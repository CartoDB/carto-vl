import * as LRU from 'lru-cache';

export default class ClusterCache {
    constructor (layergroupid, source) {
        const lruOptions = {
            max: 256,
            length: () => 1,
            maxAge: 1000 * 60 * 60,
            dispose: (uid, n) => {
                n.close();
            }
        };

        this.layergroupid = layergroupid;
        this._source = source;
        this._cache = LRU(lruOptions);
    }

    get (layerIndex, zoom, clusterId) {
        const uid = `${layerIndex}${zoom}${clusterId}`;
        const cachedFeatures = this._cache.get(uid);

        if (cachedFeatures) {
            return cachedFeatures;
        }

        const features = this._getFeatures(layerIndex, zoom, clusterId);
        this._cache.set(uid, features);
        return features;
    }

    async _getFeatures (layerIndex, zoom, clusterId) {
        const URL = this._buildClusterURL(layerIndex, zoom, clusterId);

        return fetch(URL);
    }

    _buildClusterURL (layerIndex, zoom, clusterId) {
        return `${this._source.serverURL}/${this.layergroupid}/${layerIndex}/${zoom}/cluster/${clusterId}`;
    }
}
