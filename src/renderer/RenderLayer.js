import Feature from '../api/feature';

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
        if (this.renderer) {
            dataframe.bind(this.renderer);
        }
        this.dataframes.push(dataframe);
    }

    getActiveDataframes() {
        this.dataframes = this.dataframes.filter(df => !df.freed);
        return this.dataframes.filter(df => df.active && df.numVertex);
    }

    hasDataframes() {
        return this.getActiveDataframes().length > 0;
    }

    getNumFeatures() {
        return this.getActiveDataframes().map(d => d.numFeatures).reduce((x, y) => x + y, 0);
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
        return [].concat(...this.getActiveDataframes().map(df => df.getFeaturesAtPosition(pos, this.viz))).map(this._generateApiFeature.bind(this));
    }

    /**
     * Return a public `Feature` object from the internal feature object obtained from a dataframe.
     */
    _generateApiFeature(rawFeature) {
        return new Feature(rawFeature, this.viz, this.customizedFeatures, this.trackFeatureViz);
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
