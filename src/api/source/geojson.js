import Base from './base';
import { Dataframe } from '../../core/renderer';
import * as rsys from '../../client/rsys';
import * as util from '../util';
import CartoValidationError from '../error-handling/carto-validation-error';


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
        this._features = this._getFeatures(data);
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
        return new Promise(resolve => {
            let metadata = {};
            resolve(metadata);
        });
    }

    _requestData() {
        const geometry = this._decodeGeometry();
        const properties = {};
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
