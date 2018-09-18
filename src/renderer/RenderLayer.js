import Feature from '../interactivity/feature';
import CartoValidationError, { CartoValidationTypes as cvt } from '../errors/carto-validation-error';

export default class RenderLayer {
    constructor () {
        this.dataframes = [];
        this.renderer = null;
        this.viz = null;
        this.type = null;
        this.customizedFeatures = {};
        this.idProperty = null;
    }
    // Performance-intensive. The required allocation and copy of resources will happen synchronously.
    // To achieve good performance, avoid multiple calls within the same event, particularly with large dataframes.
    addDataframe (dataframe) {
        if (this.type) {
            this._checkDataframeType(dataframe);
        }
        this.type = dataframe.type;
        if (this.renderer) {
            dataframe.bindRenderer(this.renderer);
        }
        this.dataframes.push(dataframe);
        this.idProperty = dataframe.metadata.idProperty;
    }

    setRenderer (renderer) {
        this.renderer = renderer;
        this.dataframes.forEach(d => d.bindRenderer(renderer));
    }

    setViz (viz) {
        this.viz = viz;
    }

    getActiveDataframes () {
        this.dataframes = this.dataframes.filter(df => !df.freed);
        let active = this.dataframes.filter(df => df.active && df.numVertex);
        if (active.length && active[0].orderID !== undefined) {
            active = active.sort((a, b) => a.orderID - b.orderID);
        }
        return active;
    }

    hasDataframes () {
        return this.getActiveDataframes().length > 0;
    }

    getNumFeatures () {
        return this.getActiveDataframes().map(d => d.numFeatures).reduce((x, y) => x + y, 0);
    }

    _checkDataframeType (dataframe) {
        if (this.type !== dataframe.type) {
            throw new CartoValidationError(`${cvt.INCORRECT_TYPE} Layer dataframes must always be of the same type`);
        }
    }

    getFeaturesAtPosition (pos) {
        if (!this.viz) {
            return [];
        }
        return [].concat(...this.getActiveDataframes().map(df =>
            df.getFeaturesAtPosition(pos, this.viz)
        )).map(rawFeature =>
            new Feature(rawFeature, this.viz, this.customizedFeatures, this.trackFeatureViz, this.idProperty)
        );
    }

    trackFeatureViz (featureID, vizProperty, newViz, customizedFeatures) {
        customizedFeatures[featureID] = customizedFeatures[featureID] || {};
        customizedFeatures[featureID][vizProperty] = newViz;
    }

    freeDataframes () {
        this.dataframes.map(df => df.free());
        this.dataframes = [];
        this.type = null;
    }
}
