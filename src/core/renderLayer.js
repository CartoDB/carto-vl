import { blend, property, animate, notEquals } from './viz/functions';
import { parseVizExpression } from './viz/parser';

export default class RenderLayer {
    constructor() {
        this.dataframes = [];
        this.renderer = null;
        this.viz = null;
        this.type = null;
        this.customizedFeatures = {};
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
        if (!this.viz) {
            return [];
        }
        return [].concat(...this.getActiveDataframes().map(df => df.getFeaturesAtPosition(pos, this.viz))).map(feature => {

            const genReset = vizProperty =>
                (duration = 500) => {
                    if (this.customizedFeatures[feature.id] && this.customizedFeatures[feature.id][vizProperty]) {
                        this.customizedFeatures[feature.id][vizProperty].replaceChild(
                            this.customizedFeatures[feature.id][vizProperty].mix,
                            // animate(0) is used to ensure that blend._predraw() "GC" collects it
                            blend(notEquals(property('cartodb_id'), feature.id), animate(0), animate(duration))
                        );
                        this.viz[vizProperty].notify();
                        this.customizedFeatures[feature.id][vizProperty] = undefined;
                    }
                };

            const genVizProperty = vizProperty => {
                const blender = (newExpression, duration = 500) => {
                    if (typeof newExpression == 'string') {
                        newExpression = parseVizExpression(newExpression);
                    }
                    if (this.customizedFeatures[feature.id] && this.customizedFeatures[feature.id][vizProperty]) {
                        this.customizedFeatures[feature.id][vizProperty].a.blendTo(newExpression, duration);
                        return;
                    }
                    const blendExpr = blend(
                        newExpression,
                        this.viz[vizProperty],
                        blend(1, notEquals(property('cartodb_id'), feature.id), animate(duration))
                    );
                    this.trackFeatureViz(feature.id, vizProperty, blendExpr);
                    this.viz.replaceChild(
                        this.viz[vizProperty],
                        blendExpr,
                    );
                    this.viz[vizProperty].notify();
                };
                const self = this;
                const properties = feature.properties;
                return {
                    get value() {
                        return self.viz[vizProperty].eval(properties);
                    },
                    blendTo: blender,
                    reset: genReset(vizProperty)
                };
            };
            const variables = {};
            Object.keys(this.viz.variables).map(varName => {
                variables[varName] = genVizProperty('__cartovl_variable_' + varName);
            });

            return {
                id: feature.id,
                color: genVizProperty('color'),
                width: genVizProperty('width'),
                strokeColor: genVizProperty('strokeColor'),
                strokeWidth: genVizProperty('strokeWidth'),
                variables,
                reset: (duration = 500) => {
                    genReset('color')(duration);
                    genReset('width')(duration);
                    genReset('strokeColor')(duration);
                    genReset('strokeWidth')(duration);
                    Object.keys(this.viz.variables).map(varName => {
                        variables[varName] = genReset('__cartovl_variable_' + varName)(duration);
                    });
                }
            };
        });
    }

    trackFeatureViz(featureID, vizProperty, newViz) {
        this.customizedFeatures[featureID] = this.customizedFeatures[featureID] || {};
        this.customizedFeatures[featureID][vizProperty] = newViz;
    }

    freeDataframes() {
        this.dataframes.map(df => df.free());
        this.dataframes = [];
        this.type = null;
    }
}
