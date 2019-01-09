import * as rsys from '../client/rsys';
import Dataframe from '../renderer/Dataframe';
import Metadata from './GeoJSONMetadata';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../src/errors/carto-validation-error';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../../src/errors/carto-runtime-error';
import util from '../utils/util';
import Base from './Base';
import schema from '../renderer/schema';
import { GEOMETRY_TYPE } from '../utils/geometry';

const SAMPLE_TARGET_SIZE = 1000;

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
        this._checkData(data);

        this._type = ''; // Point, LineString, MultiLineString, Polygon, MultiPolygon
        this._categoryStringToIDMap = {};
        this._numCategories = 0;
        this._numFields = new Set();
        this._catFields = new Set();
        this._dateFields = new Set();
        this._providedDateColumns = new Set(options.dateColumns);
        this._properties = {};
        this._boundColumns = new Set();

        this._data = data;
        if (data.type === 'FeatureCollection') {
            this._features = data.features;
        } else if (data.type === 'Feature') {
            this._features = [data];
        } else {
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} 'data' property must be a GeoJSON object.`);
        }

        this._features = this._initializeFeatureProperties(this._features);

        this._setCoordinatesCenter();
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
            Object.keys(newProperties).forEach(propertyName => {
                this._boundColumns.add(propertyName);
            });
            return Promise.resolve(Object.keys(newProperties).length > 0);
        }
        const dataframe = new Dataframe({
            active: true,
            center: this._dataframeCenter,
            geom: this._decodeGeometry(),
            properties: this._decodeUnboundProperties(),
            scale: 1,
            size: this._features.length,
            type: this._getDataframeType(this._type),
            metadata: this._metadata
        });
        this._boundColumns = new Set(Object.keys(dataframe.properties));
        this._dataframe = dataframe;
        this._addDataframe(dataframe);
        return Promise.resolve(true);
    }

    requiresNewMetadata () {
        return false;
    }

    _clone () {
        return new GeoJSON(this._data, { dateColumns: Array.from(this._providedDateColumns) });
    }

    _checkData (data) {
        if (util.isUndefined(data)) {
            throw new CartoValidationError(`${cvt.MISSING_REQUIRED} 'data'`);
        }
        if (!util.isObject(data)) {
            throw new CartoValidationError(`${cvt.INCORRECT_TYPE} 'data' property must be an object.`);
        }
    }

    _initializeFeatureProperties (features) {
        for (let i = 0; i < features.length; i++) {
            features[i].properties = features[i].properties || {};
        }

        return features;
    }

    _computeMetadata (viz) {
        const sample = [];
        this._addNumericColumnField('cartodb_id');

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
        const idProperty = 'cartodb_id';

        this._metadata = new Metadata({ properties: this._properties, featureCount, sample, geomType, idProperty });
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
                `${crt.NOT_SUPPORTED} Unsupported GeoJSON: the property '${propertyName}' has different types in different features.`
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
                `${crt.NOT_SUPPORTED} Unsupported GeoJSON: the property '${propertyName}' has different types in different features.`
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
        const properties = {};
        [...this._numFields].concat([...this._catFields]).concat([...this._dateFields]).map(name => {
            if (this._boundColumns.has(name)) {
                return;
            }
            // The dataframe expects to have a padding of 1024, adding 1024 empty values assures this condition is met
            properties[name] = new Float32Array(this._features.length + 1024);
        });

        const catFields = [...this._catFields].filter(name => !this._boundColumns.has(name));
        const numFields = [...this._numFields].filter(name => !this._boundColumns.has(name));
        const dateFields = [...this._dateFields].filter(name => !this._boundColumns.has(name));
        const fields = [...catFields, ...numFields, ...dateFields];

        for (let i = 0; i < this._features.length; i++) {
            const f = this._features[i];
            fields.forEach(name => {
                if (name === 'cartodb_id' && !Number.isFinite(f.properties.cartodb_id)) {
                    // Using negative ids for GeoJSON features
                    f.properties.cartodb_id = -i;
                }
                // note that GeoJSON does not support multi-value properties
                properties[name][i] = this._metadata.codec(name).sourceToInternal(this._metadata, f.properties[name]);
            });
        }
        return properties;
    }

    _getDataframeType (type) {
        switch (type) {
            case 'Point':
                return GEOMETRY_TYPE.POINT;
            case 'LineString':
            case 'MultiLineString':
                return GEOMETRY_TYPE.LINE;
            case 'Polygon':
            case 'MultiPolygon':
                return GEOMETRY_TYPE.POLYGON;
            default:
                return '';
        }
    }

    _fetchFeatureGeometry (options = {}, callback) {
        let geometry = null;
        const numFeatures = this._features.length;
        const incr = options.sample ? Math.max(1, Math.floor(numFeatures / options.sample)) : 1;

        for (let i = 0; i < numFeatures; i += incr) {
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
            if (type === 'Point') {
                const point = this._computePointGeometry(coordinates);
                geometries[6 * i + 0] = point.x;
                geometries[6 * i + 1] = point.y;
                geometries[6 * i + 2] = point.x;
                geometries[6 * i + 3] = point.y;
                geometries[6 * i + 4] = point.x;
                geometries[6 * i + 5] = point.y;
            } else if (type === 'LineString') {
                const line = this._computeLineStringGeometry(coordinates);
                geometries.push([line]);
            } else if (type === 'MultiLineString') {
                const multiline = this._computeMultiLineStringGeometry(coordinates);
                geometries.push(multiline);
            } else if (type === 'Polygon') {
                const polygon = this._computePolygonGeometry(coordinates);
                geometries.push([polygon]);
            } else if (type === 'MultiPolygon') {
                const multipolygon = this._computeMultiPolygonGeometry(coordinates);
                geometries.push(multipolygon);
            }
        });

        return geometries;
    }

    _computePointGeometry (data) {
        const lat = data[1];
        const lng = data[0];
        const wm = util.projectToWebMercator({ lat, lng });
        return rsys.wToR(wm.x, wm.y, { scale: util.WM_R, center: this._center });
    }

    _computeLineStringGeometry (data, reverse) {
        let line = [];
        for (let i = 0; i < data.length; i++) {
            const point = this._computePointGeometry(
                data[reverse ? (data.length - i - 1) : i]
            );
            line.push(point.x, point.y);
        }
        return line;
    }

    _computeMultiLineStringGeometry (data) {
        let multiline = [];
        for (let i = 0; i < data.length; i++) {
            let line = this._computeLineStringGeometry(data[i]);
            if (line.length > 0) {
                multiline.push(line);
            }
        }
        return multiline;
    }

    _computePolygonGeometry (data) {
        let polygon = {
            flat: [],
            holes: [],
            clipped: []
        };
        let holeIndex = 0;
        let firstReverse = false;

        if (data.length) {
            firstReverse = this._isReversed(data[0]);
            const flat = this._computeLineStringGeometry(data[0], firstReverse);
            polygon.flat = polygon.flat.concat(flat);
        }
        for (let i = 1; i < data.length; i++) {
            if (firstReverse !== this._isReversed(data[i])) {
                holeIndex += data[i - 1].length;
                polygon.holes.push(holeIndex);
            }
            const flat = this._computeLineStringGeometry(data[i], firstReverse);
            polygon.flat = polygon.flat.concat(flat);
        }
        return polygon;
    }

    _computeMultiPolygonGeometry (data) {
        let multipolygon = [];
        for (let i = 0; i < data.length; i++) {
            let polygon = this._computePolygonGeometry(data[i]);
            if (polygon.flat.length > 0) {
                multipolygon.push(polygon);
            }
        }
        return multipolygon;
    }

    _isReversed (vertices) {
        let total = 0;
        let pt1 = vertices[0];
        let pt2;
        for (let i = 0; i < vertices.length - 1; i++) {
            pt2 = vertices[i + 1];
            total += (pt2[1] - pt1[1]) * (pt2[0] + pt1[0]);
            pt1 = pt2;
        }
        // When total is positive it means that vertices are oriented clock wise
        // and, since positive orientation is counter-clock wise, it is reversed.
        return total >= 0;
    }

    _samplePoint (geometry) {
        const type = geometry.type;

        const coordinates = geometry.coordinates;
        if (type === 'Point') {
            return coordinates;
        } else if (type === 'LineString') {
            return coordinates[0];
        } else if (type === 'MultiLineString' || type === 'Polygon') {
            return coordinates[0][0];
        } else if (type === 'MultiPolygon') {
            return coordinates[0][0][0];
        }
    }

    // sets this._type, this._center, this._dataframeCenter
    _setCoordinatesCenter () {
        let x = 0;
        let y = 0;
        let nPoints = 0;
        this._fetchFeatureGeometry({ sample: 10 }, (_, geometry) => {
            if (!this._type) {
                this._type = geometry.type;
            }
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

        this._center = { x, y };
        this._dataframeCenter = rsys.wToR(this._center.x, this._center.y, { scale: util.WM_R, center: { x: 0, y: 0 } });
    }

    free () {
    }
}
