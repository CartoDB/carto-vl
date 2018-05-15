import { generateResetFunction, VizProperty } from './vizProperty';
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
            const variables = {};
            Object.keys(this.viz.variables).map(varName => {
                variables[varName] = new VizProperty(`__cartovl_variable_${varName}`, feature, this.viz, this.customizedFeatures, this.trackFeatureViz);
            });

            return {
                id: feature.id,
                color: new VizProperty('color', feature, this.viz, this.customizedFeatures, this.trackFeatureViz),
                width: new VizProperty('width', feature, this.viz, this.customizedFeatures, this.trackFeatureViz),
                strokeColor: new VizProperty('strokeColor', feature, this.viz, this.customizedFeatures, this.trackFeatureViz),
                strokeWidth: new VizProperty('strokeWidth', feature, this.viz, this.customizedFeatures, this.trackFeatureViz),
                variables,
                reset: (duration = 500) => {
                    generateResetFunction('color', feature, this.customizedFeatures, this.viz)(duration);
                    generateResetFunction('width', feature, this.customizedFeatures, this.viz)(duration);
                    generateResetFunction('strokeColor', feature, this.customizedFeatures, this.viz)(duration);
                    generateResetFunction('strokeWidth', feature, this.customizedFeatures, this.viz)(duration);
                    Object.keys(this.viz.variables).map(varName => {
                        variables[varName] = generateResetFunction(`__cartovl_variable_${varName}`, feature, this.customizedFeatures, this.viz)(duration);
                    });
                }
            };
        });
    }

    trackFeatureViz(featureID, vizProperty, newViz, customizedFeatures) {
        customizedFeatures[featureID] = customizedFeatures[featureID] || {};
        customizedFeatures[featureID][vizProperty] = newViz;
    }

    freeDataframes() {
        this.dataframes.map(df => df.free());
        this.dataframes = [];
        this.type = null;
    }
}
