import Base from './base';
import { Dataframe } from '../../core/renderer';
import * as rsys from '../../client/rsys';
import * as util from '../util';
import CartoValidationError from '../error-handling/carto-validation-error';

const SAMPLE_TARGET_SIZE = 1000;

export default class GeoJSON extends Base {

    /**
     * Create a carto.source.GeoJSON.
     *
     * @param {object} data - A GeoJSON data object
     *
     * @example
     * new carto.source.GeoJSON({
     *   "type": "Feature",
     *   "geometry": {
     *     "type": "Point",
     *     "coordinates": [ 0, 0 ]
     *   },
     *   "properties": {
     *     "cartodb_id": 1
     *   }
     * });
     *
     * @fires CartoError
     *
     * @constructor GeoJSON
     * @extends carto.source.Base
     * @memberof carto.source
     * @api
     */
    constructor(data) {
        super();
        this._checkData(data);

        this._type = ''; // Point, LineString, MultiLineString, Polygon, MultiPolygon
        this._status = 'init'; // init -> metadata -> data
        this._categoryStringToIDMap = {};
        this._numCategories = 0;
        this._numFields = [];
        this._catFields = [];
        this._features = this._getFeatures(data);
        this._metadata = this._computeMetadata();
    }

    bindLayer(addDataframe, removeDataframe) {
        this._addDataframe = addDataframe;
        this._removeDataframe = removeDataframe;
    }

    requestData() {
        // TODO: split it in two functions: (metadata) / (data)
        //
        if (this._status === 'init') {
            this._status = 'metadata';
            return this._requestMetadata();
        } else if (this._status === 'metadata') {
            this._status = 'data';
            this._requestData();
        }
    }

    _checkData(data) {
        if (util.isUndefined(data)) {
            throw new CartoValidationError('source', 'dataRequired');
        }
        if (!util.isObject(data)) {
            throw new CartoValidationError('source', 'dataObjectRequired');
        }
    }

    _getFeatures(data) {
        if (data.type === 'FeatureCollection') {
            return data.features || [];
        } else if (data.type === 'Feature') {
            return [data];
        }
        else {
            throw new CartoValidationError('source', 'nonValidGeoJSONData');
        }
    }

    _requestMetadata() {
        return Promise.resolve(this._metadata);
    }

    _requestData() {
        const geometry = this._decodeGeometry();
        const properties = this._decodeProperties();
        const dataframe = new Dataframe(
            { x: 0, y: 0 },
            1,
            geometry,
            properties,
        );
        dataframe.type = this._getDataframeType(this._type);
        dataframe.active = true;
        dataframe.size = this._features.length;
        this._addDataframe(dataframe);
    }

    _computeMetadata() {
        const metadata = {
            columns: [],
            categoryIDs: {},
            sample: [],
            featureCount: this._features.length,
        };
        for (var i = 0; i < this._features.length; i++) {
            const properties = this._features[i].properties;
            Object.keys(properties).map(name => {
                const value = properties[name];
                const type = Number.isFinite(value) ? 'float' : 'category';
                if (type == 'float') {
                    this._addNumericPropertyToMetadata(name, value, metadata);
                } else {
                    this._addCategoryPropertyToMetadata(name, value, metadata);
                }
            });
            this._sampleFeatureOnMetadata(properties, metadata, this._features.length);
        }
        this._numFields.map(name => {
            const column = metadata.columns.find(c => c.name == name);
            column.avg = column.sum / column.count;
        });
        this._catFields.map(name => {
            const column = metadata.columns.find(c => c.name == name);
            column.categoryNames.map(name => metadata.categoryIDs[name] = this._getCategoryIDFromString(name));
        });
        this._metadata = metadata;
        return metadata;
    }

    _sampleFeatureOnMetadata(feature, metadata, featureCount) {
        if (featureCount > SAMPLE_TARGET_SIZE) {
            const sampling = SAMPLE_TARGET_SIZE / featureCount;
            if (Math.random() > sampling) {
                return;
            }
        }
        metadata.sample.push(feature);
    }

    _addNumericPropertyToMetadata(propertyName, value, metadata) {
        if (this._catFields.includes(propertyName)) {
            throw new Error(`Unsupported GeoJSON: the property '${propertyName}' has different types in different features.`);
        }
        if (!this._numFields.includes(propertyName)) {
            this._numFields.push(propertyName);
            metadata.columns.push({
                name: propertyName,
                type: 'float',
                min: Number.POSITIVE_INFINITY,
                max: Number.NEGATIVE_INFINITY,
                avg: Number.NaN,
                sum: 0,
                count: 0
            });
        }
        const column = metadata.columns.find(c => c.name == propertyName);
        column.min = Math.min(column.min, value);
        column.max = Math.max(column.max, value);
        column.sum += value;
        column.count++;
    }
    _addCategoryPropertyToMetadata(propertyName, value, metadata) {
        if (this._numFields.includes(propertyName)) {
            throw new Error(`Unsupported GeoJSON: the property '${propertyName}' has different types in different features.`);
        }
        if (!this._catFields.includes(propertyName)) {
            this._catFields.push(propertyName);
            metadata.columns.push({
                name: propertyName,
                type: 'category',
                categoryNames: [],
                categoryCounts: [],
            });
        }
        const column = metadata.columns.find(c => c.name == propertyName);
        if (!column.categoryNames.includes(value)) {
            column.categoryNames.push(value);
            column.categoryCounts.push(0);
        }
        column.categoryCounts[column.categoryNames.indexOf(value)]++;
    }

    _decodeProperties() {
        const properties = {};
        this._numFields.concat(this._catFields).map(name => {
            // The dataframe expects to have a padding of 1024, adding 1024 empty values assures this condition is met            
            properties[name] = new Float32Array(this._features.length + 1024);
        });
        for (var i = 0; i < this._features.length; i++) {
            const f = this._features[i];

            this._catFields.map(name => {
                properties[name][i] = this._getCategoryIDFromString(f.properties[name]);
            });
            this._numFields.map(name => {
                properties[name][i] = Number(f.properties[name]);
            });
            // TODO support date / timestamp properties
        }
        return properties;
    }

    _getCategoryIDFromString(category) {
        if (this._categoryStringToIDMap[category] !== undefined) {
            return this._categoryStringToIDMap[category];
        }
        this._categoryStringToIDMap[category] = this._numCategories;
        this._numCategories++;
        return this._categoryStringToIDMap[category];
    }

    _getDataframeType(type) {
        switch (type) {
            case 'Point':
                return 'point';
            case 'LineString':
            case 'MultiLineString':
                return 'line';
            case 'Polygon':
            case 'MultiPolygon':
                return 'polygon';
            default:
                return '';
        }
    }

    _decodeGeometry() {
        let geometry = null;
        const numFeatures = this._features.length;
        for (let i = 0; i < numFeatures; i++) {
            const feature = this._features[i];
            if (feature.type === 'Feature') {
                const type = feature.geometry.type;
                const coordinates = feature.geometry.coordinates;
                if (!this._type) {
                    this._type = type;
                } else if (this._type !== type) {
                    throw new CartoValidationError('source', `multipleFeatureTypes[${this._type}, ${type}]`);
                }
                if (type === 'Point') {
                    if (!geometry) {
                        geometry = new Float32Array(numFeatures * 2);
                    }
                    const point = this._computePointGeometry(coordinates);
                    geometry[2 * i + 0] = point.x;
                    geometry[2 * i + 1] = point.y;
                }
                else if (type === 'LineString') {
                    if (!geometry) {
                        geometry = [];
                    }
                    const line = this._computeLineStringGeometry(coordinates);
                    geometry.push([line]);
                }
                else if (type === 'MultiLineString') {
                    if (!geometry) {
                        geometry = [];
                    }
                    const multiline = this._computeMultiLineStringGeometry(coordinates);
                    geometry.push(multiline);
                }
                else if (type === 'Polygon') {
                    if (!geometry) {
                        geometry = [];
                    }
                    const polygon = this._computePolygonGeometry(coordinates);
                    geometry.push([polygon]);
                }
                else if (type === 'MultiPolygon') {
                    if (!geometry) {
                        geometry = [];
                    }
                    const multipolygon = this._computeMultiPolygonGeometry(coordinates);
                    geometry.push(multipolygon);
                }
            }
        }
        return geometry;
    }

    _computePointGeometry(data) {
        const lat = data[1];
        const lng = data[0];
        const wm = util.projectToWebMercator({ lat, lng });
        return rsys.wToR(wm.x, wm.y, { scale: util.WM_R, center: { x: 0, y: 0 } });
    }

    _computeLineStringGeometry(data) {
        let line = [];
        for (let i = 0; i < data.length; i++) {
            const point = this._computePointGeometry(data[i]);
            line.push(point.x, point.y);
        }
        return line;
    }

    _computeMultiLineStringGeometry(data) {
        let multiline = [];
        for (let i = 0; i < data.length; i++) {
            let line = this._computeLineStringGeometry(data[i]);
            if (line.length > 0) {
                multiline.push(line);
            }
        }
        return multiline;
    }

    _computePolygonGeometry(data) {
        let polygon = {
            flat: [],
            holes: []
        };
        let holeIndex = 0;
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                const point = this._computePointGeometry(data[i][j]);
                polygon.flat.push(point.x, point.y);
            }
            if (!this._isClockWise(data[i])) {
                if (i > 0) {
                    holeIndex += data[i - 1].length;
                    polygon.holes.push(holeIndex);
                } else {
                    throw new CartoValidationError('source', 'firstPolygonExternal');
                }
            }
        }
        return polygon;
    }

    _computeMultiPolygonGeometry(data) {
        let multipolygon = [];
        for (let i = 0; i < data.length; i++) {
            let polygon = this._computePolygonGeometry(data[i]);
            if (polygon.flat.length > 0) {
                multipolygon.push(polygon);
            }
        }
        return multipolygon;
    }

    _isClockWise(vertices) {
        let total = 0;
        let pt1 = vertices[0], pt2;
        for (let i = 0; i < vertices.length - 1; i++) {
            pt2 = vertices[i + 1];
            total += (pt2[1] - pt1[1]) * (pt2[0] + pt1[0]);
            pt1 = pt2;
        }
        return total >= 0;
    }
}
