import * as LRU from 'lru-cache';
import CartoMapsAPIError from '../errors/carto-maps-api-error';

export default class ClusterCache {
    constructor (source) {
        const lruOptions = {
            max: 256, // TODO check
            length: () => 1,
            maxAge: 1000 * 60 * 60 // TODO check
        };

        this._username = source._username;
        this._serverURL = source._serverURL;
        this._cache = LRU(lruOptions);
    }

    async get (layerIndex, zoom, clusterId, layergroupid) {
        const uid = `${layerIndex}${zoom}${clusterId}${layergroupid}`;
        const cachedFeatures = this._cache.get(uid);

        if (cachedFeatures) {
            return cachedFeatures;
        }

        try {
            const response = await this._getFeatures(layerIndex, zoom, clusterId, layergroupid);
            const features = await response.json();

            this._cache.set(uid, features);

            return features;
        } catch (error) {
            throw new CartoMapsAPIError(`Failed to connect to Maps API with your user('${this._username}'), ${error}`);
        }
    }

    async _getFeatures (layerIndex, zoom, clusterId, layergroupid) {
        const URI = `${layergroupid}/${layerIndex}/${Math.round(zoom)}/cluster/${clusterId}`;
        const URL = `${this._serverURL}/api/v1/map/${URI}`;

        return fetch(URL);
    }
}
