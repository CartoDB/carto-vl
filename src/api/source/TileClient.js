import { validateTemplateURL } from '../url';
import DataframeCache from './DataframeCache';
import { rTiles } from '../../client/rsys';


export default class TileClient {
    constructor(templateURL) {
        validateTemplateURL(templateURL);
        this._templateURL = templateURL;
        this._requestGroupID = 0;
        this._oldDataframes = [];
        this._cache = new DataframeCache();
    }

    bindLayer(addDataframe, dataLoadedCallback) {
        this._addDataframe = addDataframe;
        this._dataLoadedCallback = dataLoadedCallback;
    }

    requestData(viewport, responseToDataframeTransformer) {
        const tiles = rTiles(viewport);
        this._getTiles(tiles, responseToDataframeTransformer);
    }

    free() {
        this._cache = new DataframeCache();
        this._oldDataframes = [];
    }

    _getTiles(tiles, responseToDataframeTransformer) {
        this._requestGroupID++;
        let completedTiles = [];
        let needToComplete = tiles.length;
        const requestGroupID = this._requestGroupID;
        tiles.forEach(t => {
            const { x, y, z } = t;
            this._cache.get(`${x},${y},${z}`, () => this._requestDataframe(x, y, z, responseToDataframeTransformer)).then(
                dataframe => {
                    if (dataframe.empty) {
                        needToComplete--;
                    } else {
                        completedTiles.push(dataframe);
                    }
                    if (completedTiles.length == needToComplete && requestGroupID == this._requestGroupID) {
                        this._oldDataframes.map(d => d.active = false);
                        completedTiles.map(d => d.active = true);
                        this._oldDataframes = completedTiles;
                        this._dataLoadedCallback();
                    }
                });
        });
    }

    _getDataframe(x, y, z) {
        return this._cache.get(`${x},${y},${z}`, () => this._requestDataframe(x, y, z));
    }

    _getTileUrl(x, y, z) {
        return this._templateURL.replace('{x}', x).replace('{y}', y).replace('{z}', z);
    }

    _getSubdomain(x, y) {
        // Reference https://github.com/Leaflet/Leaflet/blob/v1.3.1/src/layer/tile/TileLayer.js#L214-L217
        return this._subdomains[Math.abs(x + y) % this._subdomains.length];
    }

    async _requestDataframe(x, y, z, responseToDataframeTransformer) {
        const response = await fetch(this._getTileUrl(x, y, z));
        const dataframe = await responseToDataframeTransformer(response, x, y, z);
        if (!dataframe.empty) {
            this._addDataframe(dataframe);
        }
        return dataframe;
    }

}
