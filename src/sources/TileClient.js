import DataframeCache from './DataframeCache';
import { rTiles } from '../client/rsys';

export function helloWorker () {

}

export default class TileClient {
    constructor (templateURLs) {
        if (!Array.isArray(templateURLs)) {
            templateURLs = [templateURLs];
        }
        this._templateURLs = templateURLs;
        this._requestGroupID = 0;
        this._oldDataframes = [];
        this._cache = new DataframeCache();
    }

    bindLayer (addDataframe, dataLoadedCallback) {
        this._addDataframe = addDataframe;
        this._dataLoadedCallback = dataLoadedCallback;
    }

    requestData (zoom, viewport, responseToDataframeTransformer, viewportZoomToSourceZoom = Math.ceil) {
        const tiles = rTiles(zoom, viewport, viewportZoomToSourceZoom);
        this._getTiles(tiles, responseToDataframeTransformer);
    }

    free () {
        this._cache.free();
        this._cache = new DataframeCache();
        this._oldDataframes = [];
    }

    _getTiles (tiles, responseToDataframeTransformer) {
        this._requestGroupID++;
        let completedTiles = [];
        let needToComplete = tiles.length;
        const requestGroupID = this._requestGroupID;
        tiles.forEach(({ x, y, z }) => {
            this._cache.get(`${x},${y},${z}`, () => this._requestDataframe(x, y, z, responseToDataframeTransformer)).then(
                dataframe => {
                    dataframe.orderID = x + y / 1000;
                    if (dataframe.empty) {
                        needToComplete--;
                    } else {
                        completedTiles.push(dataframe);
                    }
                    if (completedTiles.length === needToComplete && requestGroupID === this._requestGroupID) {
                        this._oldDataframes.forEach(d => {
                            d.active = false;
                        });
                        completedTiles.map(d => {
                            d.active = true;
                        });
                        this._oldDataframes = completedTiles;
                        this._dataLoadedCallback();
                    }
                });
        });
    }

    _getTileUrl (x, y, z) {
        const subdomainIndex = this._getSubdomainIndex(x, y);
        return this._templateURLs[subdomainIndex].replace('{x}', x).replace('{y}', y).replace('{z}', z);
    }

    _getSubdomainIndex (x, y) {
        // Reference https://github.com/Leaflet/Leaflet/blob/v1.3.1/src/layer/tile/TileLayer.js#L214-L217
        return Math.abs(x + y) % this._templateURLs.length;
    }

    async _requestDataframe (x, y, z, responseToDataframeTransformer) {
        const response = await fetch(this._getTileUrl(x, y, z));
        const dataframe = await responseToDataframeTransformer(response, x, y, z);
        if (!dataframe.empty) {
            this._addDataframe(dataframe);
        }
        return dataframe;
    }
}
