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
                    else if (feature.geometry.type === 'MultiLineString') {
                        if (!geometry) {
                            geometry = [];
                        }
                        const lines = this._computeMultiLineStringGeometry(feature);
                        geometry.push(lines);
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
        if (type === 'MultiLineString') return 'line';
        return '';
    }

    _computePointGeometry(feature) {
        const lat = feature.geometry.coordinates[1];
        const lng = feature.geometry.coordinates[0];
        const wm = util.wmProjection({ lat, lng });
        return rsys.wToR(wm.x, wm.y, { scale: util.WM_R, center: { x: 0, y: 0 } });
    }

    _computeMultiLineStringGeometry(feature) {
        let lines = [];
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
            lines.push(line);
        }
        return lines;
    }
}
