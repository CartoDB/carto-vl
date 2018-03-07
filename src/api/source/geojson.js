import { Dataframe } from '../../core/renderer';
import * as rsys from '../../client/rsys';
import * as util from '../util';


export default class GeoJSON {

    constructor(data) {
        data = data || {};
        if (data.type === 'FeatureCollection') {
            this._features = data.features || [];
        } else if (data.type === 'Feature') {
            this._features = [data];
        }
        this._status = 'init'; // init -> metadata -> data
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
            const numFeatures = this._features.length;
            const geometry = new Float32Array(numFeatures * 2);
            const properties = {};
            for (let i = 0; i < numFeatures; i++) {
                const feature = this._features[i];
                if (feature.type === 'Feature') {
                    const { x, y } = this._computeGeometry(feature);
                    geometry[2 * i + 0] = x;
                    geometry[2 * i + 1] = y;
                }
            }
            const dataframe = new Dataframe(
                { x: 0, y: 0 },
                1,
                geometry,
                properties,
            );
            dataframe.type = 'point';
            dataframe.active = true;
            dataframe.size = numFeatures;
            this._addDataframe(dataframe);
        }
    }

    _computeGeometry(feature) {
        if (feature.geometry && feature.geometry.type === 'Point') {
            const lat = feature.geometry.coordinates[1];
            const lng = feature.geometry.coordinates[0];
            const wm = util.wmProjection({ lat, lng });
            return rsys.wToR(wm.x, wm.y, { scale: util.WM_R, center: { x: 0, y: 0 } });
        }
        return { x: 0, y: 0 };
    }
}
