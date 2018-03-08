import Base from './base';
import { Dataframe } from '../../core/renderer';
import * as rsys from '../../client/rsys';
import * as util from '../util';


export default class GeoJSON extends Base {

    constructor(data) {
        super();
        data = data || {};
        if (data.type === 'FeatureCollection') {
            this._features = data.features || [];
        } else if (data.type === 'Feature') {
            this._features = [data];
        }
        this._status = 'init'; // init -> metadata -> data
        this._type = ''; // Point, MultiLineString
    }

    bindLayer(addDataframe, removeDataframe) {
        this._addDataframe = addDataframe;
        this._removeDataframe = removeDataframe;
    }

    requestData() {
        // TODO: split in two functions
        //
        if (this._status === 'init') {
            this._status = 'metadata';
            return new Promise(resolve => {
                let metadata = {};
                resolve(metadata);
            });
        } else if (this._status === 'metadata') {
            this._status = 'data';
            let geometry = null;
            const numFeatures = this._features.length;
            const properties = {};
            for (let i = 0; i < numFeatures; i++) {
                const feature = this._features[i];
                if (feature.type === 'Feature') {
                    if (!this._type) {
                        this._type = feature.geometry.type;
                    } else if (this._type !== feature.geometry.type) {
                        throw Error(`Multiple types not supported: ${this._type}, ${feature.geometry.type}`);
                    }
                    if (feature.geometry.type === 'Point') {
                        if (!geometry) {
                            geometry = new Float32Array(numFeatures * 2);
                        }
                        const point = this._computePointGeometry(feature);
                        geometry[2 * i + 0] = point.x;
                        geometry[2 * i + 1] = point.y;
                    }
                    else if (feature.geometry.type === 'LineString') {
                        if (!geometry) {
                            geometry = [];
                        }
                        const line = this._computeLineStringGeometry(feature);
                        geometry.push([line]);
                    }
                    else if (feature.geometry.type === 'MultiLineString') {
                        if (!geometry) {
                            geometry = [];
                        }
                        const multiline = this._computeMultiLineStringGeometry(feature);
                        geometry.push(multiline);
                    }
                    else if (feature.geometry.type === 'Polygon') {
                        if (!geometry) {
                            geometry = [];
                        }
                        const polygon = this._computePolygonGeometry(feature);
                        geometry.push([polygon]);
                    }
                    else if (feature.geometry.type === 'MultiPolygon') {
                        if (!geometry) {
                            geometry = [];
                        }
                        const multipolygon = this._computeMultiPolygonGeometry(feature);
                        geometry.push(multipolygon);
                    }
                }
            }
            const dataframe = new Dataframe(
                { x: 0, y: 0 },
                1,
                geometry,
                properties,
            );
            dataframe.type = this._getDataframeType(this._type);
            dataframe.active = true;
            dataframe.size = numFeatures;
            this._addDataframe(dataframe);
        }
    }

    _getDataframeType(type) {
        if (type === 'Point') return 'point';
        if (type === 'LineString' || type === 'MultiLineString') return 'line';
        if (type === 'Polygon' || type === 'MultiPolygon') return 'polygon';
        return '';
    }

    _computePointGeometry(feature) {
        const lat = feature.geometry.coordinates[1];
        const lng = feature.geometry.coordinates[0];
        const wm = util.wmProjection({ lat, lng });
        return rsys.wToR(wm.x, wm.y, { scale: util.WM_R, center: { x: 0, y: 0 } });
    }

    _computeLineStringGeometry(feature) {
        let line = [];
        for (let j = 0; j < feature.geometry.coordinates.length; j++) {
            const wm = util.wmProjection({
                lat: feature.geometry.coordinates[j][1],
                lng: feature.geometry.coordinates[j][0]
            });
            const point = rsys.wToR(wm.x, wm.y, { scale: util.WM_R, center: { x: 0, y: 0 } });
            line.push(point.x, point.y);
        }
        return line;
    }

    _computeMultiLineStringGeometry(feature) {
        let multiline = [];
        for (let i = 0; i < feature.geometry.coordinates.length; i++) {
            let line = [];
            for (let j = 0; j < feature.geometry.coordinates[i].length; j++) {
                const wm = util.wmProjection({
                    lat: feature.geometry.coordinates[i][j][1],
                    lng: feature.geometry.coordinates[i][j][0]
                });
                const point = rsys.wToR(wm.x, wm.y, { scale: util.WM_R, center: { x: 0, y: 0 } });
                line.push(point.x, point.y);
            }
            multiline.push(line);
        }
        return multiline;
    }

    _computePolygonGeometry(feature) {
        let polygon = {
            flat: [],
            holes: []
        };
        let holeIndex = 0;
        for (let j = 0; j < feature.geometry.coordinates.length; j++) {
            for (let k = 0; k < feature.geometry.coordinates[j].length; k++) {
                const wm = util.wmProjection({
                    lat: feature.geometry.coordinates[j][k][1],
                    lng: feature.geometry.coordinates[j][k][0]
                });
                const point = rsys.wToR(wm.x, wm.y, { scale: util.WM_R, center: { x: 0, y: 0 } });
                polygon.flat.push(point.x, point.y);
            }
            if (!this._isClockWise(feature.geometry.coordinates[j])) {
                if (j > 0) {
                    holeIndex += feature.geometry.coordinates[j - 1].length;
                    polygon.holes.push(holeIndex);
                } else {
                    throw new Error('First polygon ring MUST be external');
                }
            }
        }
        return polygon;
    }

    _computeMultiPolygonGeometry(feature) {
        let multipolygon = [];
        for (let i = 0; i < feature.geometry.coordinates.length; i++) {
            let polygon = {
                flat: [],
                holes: []
            };
            let holeIndex = 0;
            for (let j = 0; j < feature.geometry.coordinates[i].length; j++) {
                for (let k = 0; k < feature.geometry.coordinates[i][j].length; k++) {
                    const wm = util.wmProjection({
                        lat: feature.geometry.coordinates[i][j][k][1],
                        lng: feature.geometry.coordinates[i][j][k][0]
                    });
                    const point = rsys.wToR(wm.x, wm.y, { scale: util.WM_R, center: { x: 0, y: 0 } });
                    polygon.flat.push(point.x, point.y);
                }
                if (!this._isClockWise(feature.geometry.coordinates[i][j])) {
                    if (j > 0) {
                        holeIndex += feature.geometry.coordinates[i][j - 1].length;
                        polygon.holes.push(holeIndex);
                    } else {
                        throw new Error('First polygon ring MUST be external');
                    }
                }
            }
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
