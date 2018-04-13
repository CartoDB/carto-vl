import { blend, property, animate, notEquals } from './style/functions';
import { parseStyleExpression } from './style/parser';

export default class RenderLayer {
    constructor() {
        this.dataframes = [];
        this.renderer = null;
        this.style = null;
        this.type = null;
        this.styledFeatures = {};
    }
    // Performance-intensive. The required allocation and copy of resources will happen synchronously.
    // To achieve good performance, avoid multiple calls within the same event, particularly with large dataframes.
    addDataframe(dataframe) {
        if (this.type) {
            this._checkDataframeType(dataframe);
        }
        this.type = dataframe.type;
        dataframe.bind(this.renderer);
        this.dataframes.push(dataframe);
    }

    // Removes a dataframe for the renderer. Freeing its resources.
    removeDataframe(dataframe) {
        this.dataframes = this.dataframes.filter(df => df !== dataframe);
    }

    getActiveDataframes() {
        return this.dataframes.filter(df => df.active);
    }

    hasDataframes() {
        return this.dataframes.length > 0;
    }

    getNumFeatures() {
        return this.dataframes.filter(d => d.active).map(d => d.numFeatures).reduce((x, y) => x + y, 0);
    }

    _checkDataframeType(dataframe) {
        if (this.type != dataframe.type) {
            throw new Error('Layer dataframes must always be of the same type');
        }
    }

    getFeaturesAtPosition(pos) {
        if (!this.style) {
            return [];
        }
        return [].concat(...this.getActiveDataframes().map(df => df.getFeaturesAtPosition(pos, this.style))).map(feature => {

            const genReset = styleProperty =>
                (duration = 500) => {
                    if (this.styledFeatures[feature.id] && this.styledFeatures[feature.id][styleProperty]) {
                        this.styledFeatures[feature.id][styleProperty].replaceChild(
                            this.styledFeatures[feature.id][styleProperty].mix,
                            // animate(0) is used to ensure that blend._predraw() "GC" collects it
                            blend(notEquals(property('cartodb_id'), feature.id), animate(0), animate(duration))
                        );
                        this.style._styleSpec[styleProperty].notify();
                        this.styledFeatures[feature.id][styleProperty] = undefined;
                    }
                };

            const genStyleProperty = styleProperty => {
                const blender = (newExpression, duration = 500) => {
                    if (typeof newExpression == 'string') {
                        newExpression = parseStyleExpression(newExpression);
                    }
                    if (this.styledFeatures[feature.id] && this.styledFeatures[feature.id][styleProperty]) {
                        this.styledFeatures[feature.id][styleProperty].a.blendTo(newExpression, duration);
                        return;
                    }
                    const blendExpr = blend(
                        newExpression,
                        this.style._styleSpec[styleProperty],
                        blend(1, notEquals(property('cartodb_id'), feature.id), animate(duration))
                    );
                    this.trackFeatureStyle(feature.id, styleProperty, blendExpr);
                    this.style.replaceChild(
                        this.style._styleSpec[styleProperty],
                        blendExpr,
                    );
                    this.style._styleSpec[styleProperty].notify();
                };
                const self = this;
                const properties = feature.properties;
                return {
                    get value(){
                        return self.style._styleSpec[styleProperty].eval(properties);
                    },
                    blendTo: blender,
                    reset: genReset(styleProperty)
                };
            };
            const variables = {};
            Object.keys(this.style._styleSpec.variables).map(varName => {
                variables[varName] = genStyleProperty('__cartovl_variable_' + varName);
            });
            feature.style = {
                color: genStyleProperty('color'),
                width: genStyleProperty('width'),
                strokeColor: genStyleProperty('strokeColor'),
                strokeWidth: genStyleProperty('strokeWidth'),
                variables,
                reset: (duration = 500) => {
                    genReset('color')(duration);
                    genReset('width')(duration);
                    genReset('strokeColor')(duration);
                    genReset('strokeWidth')(duration);
                    Object.keys(this.style._styleSpec.variables).map(varName => {
                        variables[varName] = genReset('__cartovl_variable_' + varName)(duration);
                    });
                }
            };
            feature.properties = undefined;
            return feature;
        });
    }

    trackFeatureStyle(featureID, styleProperty, newStyle) {
        this.styledFeatures[featureID] = this.styledFeatures[featureID] || {};
        this.styledFeatures[featureID][styleProperty] = newStyle;
    }

    freeDataframes() {
        this.dataframes.map(df => df.free());
        this.dataframes = [];
        this.type = null;
    }
}
