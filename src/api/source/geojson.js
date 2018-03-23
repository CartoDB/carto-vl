import Base from './base';
import { Dataframe } from '../../core/renderer';
import * as rsys from '../../client/rsys';
import * as util from '../util';
import CartoValidationError from '../error-handling/carto-validation-error';
import Metadata from '../../core/metadata';

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
        this._categoryStringToIDMap = {};
        this._numCategories = 0;
        this._numFields = [];
        this._catFields = [];
        this._features = this._getFeatures(data);
        this._metadata = this._computeMetadata();

        this._loaded = false;
    }

    bindLayer(addDataframe, removeDataframe, dataLoadedCallback) {
        this._addDataframe = addDataframe;
        this._removeDataframe = removeDataframe;
        this._dataLoadedCallback = dataLoadedCallback;
    }

    requestMetadata() {
        return Promise.resolve(this._metadata);
    }

    requestData() {
        if (this._loaded) {
            return;
        }
        this._loaded = true;
        const dataframe = new Dataframe({
            active: true,
            center: { x: 0, y: 0 },
            geom: this._decodeGeometry(),
            properties: this._decodeProperties(),
            scale: 1,
            size: this._features.length,
            type: this._getDataframeType(this._type)
        });
        this._addDataframe(dataframe);
        this._dataLoadedCallback();
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

    _computeMetadata() {
        const categoryIDs = {};
        const columns = [];
        const sample = [];
        const featureCount = this._features.length;

        for (var i = 0; i < this._features.length; i++) {
            const properties = this._features[i].properties;
            Object.keys(properties).map(name => {
                const value = properties[name];
                Number.isFinite(value) ?
                    this._addNumericPropertyToMetadata(name, value, columns) :
                    this._addCategoryPropertyToMetadata(name, value, columns);
            });
            this._sampleFeatureOnMetadata(properties, sample, this._features.length);
        }
        this._numFields.map(name => {
            const column = columns.find(c => c.name == name);
            column.avg = column.sum / column.count;
        });
        this._catFields.map(name => {
            const column = columns.find(c => c.name == name);
            column.categoryNames.map(name => categoryIDs[name] = this._getCategoryIDFromString(name));
        });

        this._metadata = new Metadata(categoryIDs, columns, featureCount, sample);
        return this._metadata;
    }

    _sampleFeatureOnMetadata(feature, sample, featureCount) {
        if (featureCount > SAMPLE_TARGET_SIZE) {
            const sampling = SAMPLE_TARGET_SIZE / featureCount;
            if (Math.random() > sampling) {
                return;
            }
        }
        sample.push(feature);
    }

    _addNumericPropertyToMetadata(propertyName, value, columns) {
        if (this._catFields.includes(propertyName)) {
            throw new Error(`Unsupported GeoJSON: the property '${propertyName}' has different types in different features.`);
        }
        if (!this._numFields.includes(propertyName)) {
            this._numFields.push(propertyName);
            columns.push({
                name: propertyName,
                type: 'float',
                min: Number.POSITIVE_INFINITY,
                max: Number.NEGATIVE_INFINITY,
                avg: Number.NaN,
                sum: 0,
                count: 0
            });
        }
        const column = columns.find(c => c.name == propertyName);
        column.min = Math.min(column.min, value);
        column.max = Math.max(column.max, value);
        column.sum += value;
        column.count++;
    }
    _addCategoryPropertyToMetadata(propertyName, value, columns) {
        if (this._numFields.includes(propertyName)) {
            throw new Error(`Unsupported GeoJSON: the property '${propertyName}' has different types in different features.`);
        }
        if (!this._catFields.includes(propertyName)) {
            this._catFields.push(propertyName);
            columns.push({
                name: propertyName,
                type: 'category',
                categoryNames: [],
                categoryCounts: [],
            });
        }
        const column = columns.find(c => c.name == propertyName);
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

    free(){
    }
}
