import * as rsys from '../client/rsys';
import Dataframe from '../renderer/Dataframe';
import Metadata from './GeoJSONMetadata';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../src/errors/carto-validation-error';
import CartoRuntimeError, { CartoRuntimeTypes as runtimeErrors } from '../../src/errors/carto-runtime-error';
import util from '../utils/util';
import Base from './Base';
import schema from '../renderer/schema';
import { GEOMETRY_TYPE } from '../utils/geometry';

import GeoJSONGeometryTransformer from './geojson/GeoJSONGeometryTransformer';
import GeoJSONGeometryType from './geojson/GeoJSONGeometryType';

const SAMPLE_TARGET_SIZE = 1000;
const DATAFRAME_PADDING = 1024;
const ID_PROPERTY = 'cartodb_id';

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

        this._categoryStringToIDMap = {};
        this._numCategories = 0;
        this._numFields = new Set();
        this._catFields = new Set();
        this._dateFields = new Set();
        this._providedDateColumns = new Set(options.dateColumns);
        this._properties = {};
        this._boundColumns = new Set();
    }

    _initializeData (data) {
        this._checkData(data);

        this._data = data;
        this._features = this._featuresFromData();
        this._type = this._getType();
        this._webMercatorCenter = this._getWebMercatorCoordsCenter();
        this._geometryTransformer = new GeoJSONGeometryTransformer(this._webMercatorCenter);
    }

    _checkData (data) {
        if (util.isUndefined(data)) {
            throw new CartoValidationError(`${cvt.MISSING_REQUIRED} 'data'`);
        }
        if (!util.isObject(data)) {
            throw new CartoValidationError(`${cvt.INCORRECT_TYPE} 'data' property must be an object.`);
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
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} 'data' property must be a GeoJSON object.`);
        }

        features = this._initializeFeaturePropertiesIn(features);
        return features;
    }

    /**
     * Get the GeoJSONGeometryType from the first Feature
     */
    _getType () {
        return this._features[0].geometry.type;
    }

    /**
     * Get an estimated center in WebMercator coordinates, based on a sample of the Features
     */
    _getWebMercatorCoordsCenter () {
        let x = 0;
        let y = 0;
        let nPoints = 0;
        this._fetchFeatureGeometry({ sample: 10 }, (_, geometry) => {
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
            this._dataframe.addProperties(newProperties);

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
            type: this._getDataframeType(this._type),
            metadata: this._metadata
        });

        this._boundColumns = new Set(Object.keys(dataframe.properties));
        this._addDataframe(dataframe);

        return dataframe;
    }

    requiresNewMetadata () {
        return false;
    }

    _clone () {
        return new GeoJSON(this._data, { dateColumns: Array.from(this._providedDateColumns) });
    }

    _initializeFeaturePropertiesIn (features) {
        for (let i = 0; i < features.length; i++) {
            features[i].properties = features[i].properties || {};
        }
        return features;
    }

    _computeMetadata (viz) {
        const sample = [];
        this._addNumericColumnField(ID_PROPERTY);

        const featureCount = this._features.length;
        const requiredColumns = new Set(Object.keys(schema.simplify(viz.getMinimumNeededSchema())));
        for (let i = 0; i < this._features.length; i++) {
            const properties = this._features[i].properties;
            const keys = Object.keys(properties);
            for (let j = 0, len = keys.length; j < len; j++) {
                const name = keys[j];
                if (!requiredColumns.has(name) || this._boundColumns.has(name)) {
                    continue;
                }
                const value = properties[name];
                this._addPropertyToMetadata(name, value);
            }
            this._sampleFeatureOnMetadata(properties, sample, this._features.length);
        }

        this._numFields.forEach(name => {
            const property = this._properties[name];
            property.avg = property.sum / property.count;
        });

        let geomType = '';
        if (featureCount > 0) {
            // Set the geomType of the first feature to the metadata
            geomType = this._getDataframeType(this._features[0].geometry.type);
        }

        this._metadata = new Metadata({
            properties: this._properties,
            featureCount,
            sample,
            geomType,
            idProperty: ID_PROPERTY
        });

        this._metadata.setCodecs();
        return this._metadata;
    }

    _sampleFeatureOnMetadata (properties, sample, featureCount) {
        if (featureCount > SAMPLE_TARGET_SIZE) {
            const sampling = SAMPLE_TARGET_SIZE / featureCount;
            if (Math.random() > sampling) {
                return;
            }
        }
        sample.push(properties);
    }

    _addNumericPropertyToMetadata (propertyName, value) {
        if (this._catFields.has(propertyName) || this._dateFields.has(propertyName)) {
            throw new CartoValidationError(`${cvt.INCORRECT_TYPE} Unsupported GeoJSON: the property '${propertyName}' has different types in different features.`);
        }
        this._addNumericColumnField(propertyName);
        const property = this._properties[propertyName];
        property.min = Math.min(property.min, value);
        property.max = Math.max(property.max, value);
        property.sum += value;
    }

    _addNumericColumnField (propertyName) {
        if (!this._numFields.has(propertyName)) {
            this._numFields.add(propertyName);
            this._properties[propertyName] = {
                type: 'number',
                min: Number.POSITIVE_INFINITY,
                max: Number.NEGATIVE_INFINITY,
                avg: Number.NaN,
                sum: 0,
                count: 0
            };
        }
    }

    _addDatePropertyToMetadata (propertyName, value) {
        if (this._catFields.has(propertyName) || this._numFields.has(propertyName)) {
            throw new CartoRuntimeError(
                `${runtimeErrors.NOT_SUPPORTED} Unsupported GeoJSON: the property '${propertyName}' has different types in different features.`
            );
        }
        this._addDateColumnField(propertyName);
        const column = this._properties[propertyName];
        const dateValue = util.castDate(value);
        column.min = column.min ? util.castDate(Math.min(column.min, dateValue)) : dateValue;
        column.max = column.max ? util.castDate(Math.max(column.max, dateValue)) : dateValue;
        column.sum += value;
        column.count++;
    }

    _addDateColumnField (propertyName) {
        if (!this._dateFields.has(propertyName)) {
            this._dateFields.add(propertyName);
            this._properties[propertyName] = {
                type: 'date',
                min: null,
                max: null,
                avg: null,
                sum: 0,
                count: 0
            };
        }
    }

    _addPropertyToMetadata (propertyName, value) {
        if (this._providedDateColumns.has(propertyName)) {
            return this._addDatePropertyToMetadata(propertyName, value);
        }
        if (Number.isFinite(value)) {
            return this._addNumericPropertyToMetadata(propertyName, value);
        }
        if (value === null) {
            return;
        }
        this._addCategoryPropertyToMetadata(propertyName, value);
    }

    _addCategoryPropertyToMetadata (propertyName, value) {
        if (this._numFields.has(propertyName) || this._dateFields.has(propertyName)) {
            throw new CartoRuntimeError(
                `${runtimeErrors.NOT_SUPPORTED} Unsupported GeoJSON: the property '${propertyName}' has different types in different features.`
            );
        }
        if (!this._catFields.has(propertyName)) {
            this._catFields.add(propertyName);
            this._properties[propertyName] = {
                type: 'category',
                categories: []
            };
        }
        const property = this._properties[propertyName];
        const cat = property.categories.find(cat => cat.name === value);
        if (cat) {
            cat.frequency++;
        } else {
            property.categories.push({ name: value, frequency: 1 });
        }
    }

    _decodeUnboundProperties () {
        const unboundProperties = this._getUnboundProperties();
        const unboundFieldNames = Object.keys(unboundProperties);

        for (let i = 0; i < this._features.length; i++) {
            const f = this._features[i];
            unboundFieldNames.forEach(name => {
                if (name === ID_PROPERTY && !Number.isFinite(f.properties[ID_PROPERTY])) {
                    f.properties[ID_PROPERTY] = -i; // using negative ids for GeoJSON features
                }
                // note that GeoJSON does not support multi-value properties
                unboundProperties[name][i] = this._metadata.codec(name).sourceToInternal(this._metadata, f.properties[name]);
            });
        }

        return unboundProperties;
    }

    _getUnboundProperties () {
        const properties = {};
        const allFields = [...this._numFields].concat([...this._catFields]).concat([...this._dateFields]);
        allFields.map(name => {
            if (this._boundColumns.has(name)) {
                return;
            }
            // The dataframe expects to have a padding, adding DATAFRAME_PADDING empty values assures this condition is met
            properties[name] = new Float32Array(this._features.length + DATAFRAME_PADDING);
        });

        return properties;
    }

    _getDataframeType (type) {
        switch (type) {
            case GeoJSONGeometryType.POINT:
                return GEOMETRY_TYPE.POINT;
            case GeoJSONGeometryType.LINE_STRING:
            case GeoJSONGeometryType.MULTI_LINE_STRING:
                return GEOMETRY_TYPE.LINE;
            case GeoJSONGeometryType.POLYGON:
            case GeoJSONGeometryType.MULTI_POLYGON:
                return GEOMETRY_TYPE.POLYGON;
            default:
                return '';
        }
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
        if (this._type === 'Point') {
            return new Float32Array(this._features.length * 6);
        }
        return ([]);
    }

    _decodeGeometry () {
        let geometries = this._allocGeometry();

        this._fetchFeatureGeometry({}, (i, geometry) => {
            const type = geometry.type;
            const coordinates = geometry.coordinates;
            if (this._type !== type) {
                throw new CartoValidationError(`${cvt.INCORRECT_TYPE} multiple geometry types not supported: found '${type}' instead of '${this._type}'.`);
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
