import Feature from '../interactivity/feature';
import CartoValidationError, { CartoValidationTypes as cvt } from '../errors/carto-validation-error';
import { GEOMETRY_TYPE } from '../utils/geometry';
import { getCompoundFeature } from '../interactivity/commonFeature';

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

        const noPossiblePartialFeatures = (this.viz.geometryType === GEOMETRY_TYPE.POINT);
        if (noPossiblePartialFeatures) {
            return this._getPointFeaturesAtPosition(pos);
        } else {
            return this._getPartialFeaturesAtPosition(pos);
        }
    }

    _getPointFeaturesAtPosition (pos) {
        const rawFeatures = this._getRawFeaturesAtPosition(pos);
        return rawFeatures.map((raw) => { return this._buildFeatureFromRaw(raw); });
    }

    _buildFeatureFromRaw (rawFeature) {
        const { viz, customizedFeatures, trackFeatureViz, idProperty } = this;
        const featureVizParams = { viz, customizedFeatures, trackFeatureViz, idProperty };
        return new Feature(rawFeature, featureVizParams);
    }

    _getRawFeaturesAtPosition (pos) {
        const rawFeatures = [].concat(...this.getActiveDataframes().map(df =>
            df.getFeaturesAtPosition(pos, this.viz)
        ));
        return rawFeatures;
    }

    _getPartialFeaturesAtPosition (pos) {
        const rawFeatures = this._getRawFeaturesAtPosition(pos);
        if (rawFeatures.length === 0) return [];

        const rawPartialFeatures = this._getPartialFeaturesFromSingle(rawFeatures);

        const compoundFeatures = this._getCompoundFeaturesFrom(rawPartialFeatures);
        return compoundFeatures;
    }

    _getCompoundFeaturesFrom (rawPartialFeatures) {
        const features = [];
        for (let featureId in rawPartialFeatures) {
            const viewporFeaturePieces = rawPartialFeatures[featureId];
            const featurePieces = viewporFeaturePieces.map((raw) => { return this._buildFeatureFromRaw(raw); });
            features.push(getCompoundFeature(featurePieces));
        }
        return features;
    }

    /**
     * Get all the pieces from rawFeatures.
     * Returns an Object, where each key includes an array with (potentially) several feature pieces
     */
    _getPartialFeaturesFromSingle (rawFeatures) {
        const featuresIds = new Set(rawFeatures.map(raw => raw[this.idProperty]));
        return this.getAllPiecesPerFeature(featuresIds);
    }

    /**
     * Gather all feature pieces in the dataframes
     */
    getAllPiecesPerFeature (featureIds) {
        const piecesPerFeature = {};
        featureIds.forEach((featureId) => { piecesPerFeature[featureId] = []; });

        const dataframes = this.getActiveDataframes();
        dataframes.forEach(dataframe => {
            this._addPartialFeaturesIfExistIn(dataframe, featureIds, piecesPerFeature);
        });

        return piecesPerFeature;
    }

    /**
     * Add all the feature pieces, with selected featureIds, if present in the dataframe.
     */
    _addPartialFeaturesIfExistIn (dataframe, featureIds, result) {
        for (let i = 0; i < dataframe.numFeatures; i++) {
            const feature = dataframe.getFeature(i);
            const currentFeatureId = feature[this.idProperty];

            if (featureIds.has(currentFeatureId)) {
                const pieces = result[currentFeatureId];
                pieces.push(feature);
            }
        }
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
