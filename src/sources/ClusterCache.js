import * as LRU from 'lru-cache';

export default class ClusterCache {
    constructor (source) {
        const lruOptions = {
            max: 256,
            length: () => 1,
            maxAge: 1000 * 60 * 60,
            dispose: (uid, n) => {
                n.close();
            }
        };

        this._source = source;
        this._cache = LRU(lruOptions);
    }

    async get (layerIndex, zoom, clusterId, layergroupid) {
        const uid = `${layerIndex}${zoom}${clusterId}${layergroupid}`;
        const cachedFeatures = this._cache.get(uid);

        if (cachedFeatures) {
            return cachedFeatures;
        }

        const response = await this._getFeatures(layerIndex, zoom, clusterId, layergroupid);
        const features = await response.json();

        this._cache.set(uid, features);
        return features;
    }

    async _getFeatures (layerIndex, zoom, clusterId, layergroupid) {
        const URL = this._buildClusterURL(layerIndex, zoom, clusterId, layergroupid);

        return fetch(URL);
    }

    _buildClusterURL (layerIndex, zoom, clusterId, layergroupid) {
        return `${this._source._serverURL}/api/v1/map/${layergroupid}/${layerIndex}/${zoom}/cluster/${clusterId}`;
    }
}
