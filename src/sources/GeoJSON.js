import * as rsys from '../client/rsys';
import Dataframe from '../renderer/dataframe/Dataframe';
import { DEFAULT_ID_PROPERTY } from '../renderer/Metadata';

import CartoValidationError, { CartoValidationErrorTypes } from '../errors/carto-validation-error';

import util from '../utils/util';
import Base from './Base';

import GeoJSONGeometryTransformer from './geojson/GeoJSONGeometryTransformer';
import { GeoJSONGeometryType, dataframeGeometryType } from './geojson/GeoJSONGeometryType';
import { GeoJSONMetadataBuilder } from './geojson/GeoJSOMetadataBuilder';

const DATAFRAME_PADDING = 1024;
const SAMPLE_SIZE_FOR_CENTER = 10;

export default class GeoJSON extends Base {
    /**
     * Create a carto.source.GeoJSON source from a GeoJSON object.
     *
     * @param {Object} data - A GeoJSON data object
     * @param {Object} options - Options
     * @param {array<string>} options.dateColumns - List of columns that contain dates.
     *
     * The combination of different type of geometries on the same source is not supported. Valid geometry types are `Point`, `LineString`, `MultiLineString`, `Polygon` and `MultiPolygon`.
     *
     * @example
     * const source = new carto.source.GeoJSON({
     *   "type": "Feature",
     *   "geometry": {
     *     "type": "Point",
     *     "coordinates": [ 0, 0 ]
     *   },
     *   "properties": {
     *     "index": 1
     *   }
     * });
     *
     * @throws CartoError
     *
     * @memberof carto.source
     * @name GeoJSON
     * @api
     */
    constructor (data, options = {}) {
        super();

        this._initializeData(data);
        this._initializeMetadataHelpers(options);
    }

    _initializeData (data) {
        this._checkData(data);

        this._data = data;
        this._features = this._featuresFromData();
        this._geomType = this._getGeomType();
        this._webMercatorCenter = this._getWebMercatorCoordsCenter();
        this._geometryTransformer = new GeoJSONGeometryTransformer(this._webMercatorCenter);
    }

    _initializeMetadataHelpers (options) {
        this._providedDateColumns = new Set(options.dateColumns);
        this._boundColumns = new Set();

        this._metadataBuilder = new GeoJSONMetadataBuilder(this._providedDateColumns, this._boundColumns);
    }

    /**
     * Check geojson data is a proper object
     */
    _checkData (data) {
        if (util.isUndefined(data)) {
            throw new CartoValidationError('\'data\'', CartoValidationErrorTypes.MISSING_REQUIRED);
        }
        if (!util.isObject(data)) {
            throw new CartoValidationError('\'data\' property must be an object.',
                CartoValidationErrorTypes.INCORRECT_TYPE);
        }
    }

    /**
     * Get initialized Features from data
     */
    _featuresFromData () {
        let features;

        const dataType = this._data.type;
        if (dataType === 'FeatureCollection') {
            features = this._data.features;
        } else if (dataType === 'Feature') {
            features = [this._data];
        } else {
            throw new CartoValidationError('\'data\' property must be a GeoJSON object.', CartoValidationErrorTypes.INCORRECT_VALUE);
        }

        this._initializePropertiesIn(features);
        return features;
    }

    /**
     * Get the GeoJSONGeometryType from the first Feature
     */
    _getGeomType () {
        return this._features[0].geometry.type;
    }

    /**
     * Get an estimated center in WebMercator coordinates, based on a sample of the Features
     * with SAMPLE_SIZE_FOR_CENTER
     */
    _getWebMercatorCoordsCenter () {
        let x = 0;
        let y = 0;
        let nPoints = 0;
        this._fetchFeatureGeometry({ sample: SAMPLE_SIZE_FOR_CENTER }, (_, geometry) => {
            const samplePoint = this._samplePoint(geometry);
            const sampleXY = util.projectToWebMercator({ lng: samplePoint[0], lat: samplePoint[1] });
            x += sampleXY.x;
            y += sampleXY.y;
            nPoints += 1;
        });

        if (nPoints > 1) {
            x /= nPoints;
            y /= nPoints;
        }

        return { x, y };
    }

    /**
     * Get the dataframe center in a local RSys.
     */
    _getDataframeCenter () {
        const targetReferenceSystem = {
            scale: util.WM_R,
            center: { x: 0, y: 0 }
        };
        const { x: worldX, y: worldY } = this._webMercatorCenter;
        return rsys.wToR(worldX, worldY, targetReferenceSystem);
    }

    bindLayer (addDataframe) {
        this._addDataframe = addDataframe;
    }

    requestMetadata (viz) {
        return Promise.resolve(this._computeMetadata(viz));
    }

    requestData () {
        if (this._dataframe) {
            const newProperties = this._decodeUnboundProperties();
            this._dataframe.addProperties();

            const newPropertyNames = Object.keys(newProperties);
            newPropertyNames.forEach(propertyName => {
                this._boundColumns.add(propertyName);
            });

            return Promise.resolve(newPropertyNames.length > 0);
        }

        this._dataframe = this._createNewDataframe();
        return Promise.resolve(true);
    }

    _createNewDataframe () {
        const dataframe = new Dataframe({
            active: true,
            center: this._getDataframeCenter(),
            geom: this._decodeGeometry(),
            properties: this._decodeUnboundProperties(),
            scale: 1,
            size: this._features.length,
            type: dataframeGeometryType(this._geomType),
            metadata: this._metadata
        });

        this._boundColumns = new Set(Object.keys(dataframe.properties));
        this._addDataframe && this._addDataframe(dataframe);

        return dataframe;
    }

    requiresNewMetadata () {
        return false;
    }

    _clone () {
        return new GeoJSON(this._data, { dateColumns: Array.from(this._providedDateColumns) });
    }

    _initializePropertiesIn (features) {
        for (let i = 0; i < features.length; i++) {
            features[i].properties = features[i].properties || {};
        }
    }

    _computeMetadata (viz) {
        this._metadata = this._metadataBuilder.buildFrom(viz, this._features);
        return this._metadata;
    }

    _decodeUnboundProperties () {
        const unboundProperties = this._getUnboundProperties();
        const unboundFieldNames = Object.keys(unboundProperties);

        for (let i = 0; i < this._features.length; i++) {
            const f = this._features[i];
            unboundFieldNames.forEach(name => {
                if (name === DEFAULT_ID_PROPERTY && !Number.isFinite(f.properties[DEFAULT_ID_PROPERTY])) {
                    f.properties[DEFAULT_ID_PROPERTY] = -i; // using negative ids for GeoJSON features
                }
                // note that GeoJSON does not support multi-value properties
                unboundProperties[name][i] = this._metadata.codec(name).sourceToInternal(this._metadata, f.properties[name]);
            });
        }

        return unboundProperties;
    }

    _getUnboundProperties () {
        const allFields = this._metadataBuilder.getCurrentFields();

        const properties = {};
        allFields.forEach(name => {
            if (this._boundColumns.has(name)) {
                return;
            }
            // The dataframe expects to have a padding, adding DATAFRAME_PADDING empty values assures this condition is met
            properties[name] = new Float32Array(this._features.length + DATAFRAME_PADDING);
        });

        return properties;
    }

    /**
     * Take the geometry from every feature and invoke the callback with it.
     * If custom options are specified, a 'sample' can be used to skip every 'X' features
     */
    _fetchFeatureGeometry (options = {}, callback) {
        let geometry = null;
        const DEFAULT_SAMPLE = 1; // every feature
        const numFeatures = this._features.length;
        const increment = options.sample ? Math.max(1, Math.floor(numFeatures / options.sample)) : DEFAULT_SAMPLE;

        for (let i = 0; i < numFeatures; i += increment) {
            const feature = this._features[i];
            if (feature.type === 'Feature') {
                callback(i, feature.geometry);
            }
        }
        return geometry;
    }

    _allocGeometry () {
        if (this._geomType === 'Point') {
            return new Float32Array(this._features.length * 6);
        }
        return ([]);
    }

    _decodeGeometry () {
        let geometries = this._allocGeometry();

        this._fetchFeatureGeometry({}, (i, geometry) => {
            const type = geometry.type;
            const coordinates = geometry.coordinates;
            const newGeomType = dataframeGeometryType(type);
            const prevGeomType = dataframeGeometryType(this._geomType);
            if (newGeomType !== prevGeomType) {
                throw new CartoValidationError(
                    `multiple geometry types not supported: found '${newGeomType}' instead of '${prevGeomType}'.`,
                    CartoValidationErrorTypes.INCORRECT_TYPE
                );
            }
            if (type === GeoJSONGeometryType.POINT) {
                const point = this._geometryTransformer.computePoint(coordinates);
                geometries[6 * i + 0] = point.x;
                geometries[6 * i + 1] = point.y;
                geometries[6 * i + 2] = point.x;
                geometries[6 * i + 3] = point.y;
                geometries[6 * i + 4] = point.x;
                geometries[6 * i + 5] = point.y;
            } else if (type === GeoJSONGeometryType.LINE_STRING) {
                const line = this._geometryTransformer.computeLineString(coordinates);
                geometries.push([line]);
            } else if (type === GeoJSONGeometryType.MULTI_LINE_STRING) {
                const multiline = this._geometryTransformer.computeMultiLineString(coordinates);
                geometries.push(multiline);
            } else if (type === GeoJSONGeometryType.POLYGON) {
                const polygon = this._geometryTransformer.computePolygon(coordinates);
                geometries.push([polygon]);
            } else if (type === GeoJSONGeometryType.MULTI_POLYGON) {
                const multipolygon = this._geometryTransformer.computeMultiPolygon(coordinates);
                geometries.push(multipolygon);
            }
        });

        return geometries;
    }

    _samplePoint (geometry) {
        const type = geometry.type;

        const coordinates = geometry.coordinates;
        if (type === GeoJSONGeometryType.POINT) {
            return coordinates;
        } else if (type === GeoJSONGeometryType.LINE_STRING) {
            return coordinates[0];
        } else if (type === GeoJSONGeometryType.MULTI_LINE_STRING || type === GeoJSONGeometryType.POLYGON) {
            return coordinates[0][0];
        } else if (type === GeoJSONGeometryType.MULTI_POLYGON) {
            return coordinates[0][0][0];
        }
    }

    free () {
    }
}
