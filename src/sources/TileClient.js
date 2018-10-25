import DataframeCache from './DataframeCache';
import { rTiles } from '../client/rsys';
import { isSetsEqual } from '../utils/util';

export default class TileClient {
    constructor (templateURLs) {
        if (!Array.isArray(templateURLs)) {
            templateURLs = [templateURLs];
        }

        this._templateURLs = templateURLs;
        this._nextGroupID = 0;
        this._currentRequestGroupID = 0;
        this._oldDataframes = [];
        this._cache = new DataframeCache();
    }

    bindLayer (addDataframe) {
        this._addDataframe = addDataframe;
    }

    requestData (zoom, viewport, urlToDataframeTransformer, viewportZoomToSourceZoom = Math.ceil) {
        const tiles = rTiles(zoom, viewport, viewportZoomToSourceZoom);
        return this._getTiles(tiles, urlToDataframeTransformer);
    }

    free () {
        this._cache.free();
        this._cache = new DataframeCache();
        this._oldDataframes = [];
    }

    _getTileUrl (x, y, z) {
        const subdomainIndex = this._getSubdomainIndex(x, y);
        return this._templateURLs[subdomainIndex].replace('{x}', x).replace('{y}', y).replace('{z}', z);
    }

    _getSubdomainIndex (x, y) {
        // Reference https://github.com/Leaflet/Leaflet/blob/v1.3.1/src/layer/tile/TileLayer.js#L214-L217
        return Math.abs(x + y) % this._templateURLs.length;
    }

    async _getTiles (tiles, urlToDataframeTransformer) {
        this._nextGroupID++;
        const requestGroupID = this._nextGroupID;

        const completedDataframes = await Promise.all(tiles.map(({ x, y, z }) => {
            return this._cache.get(`${x},${y},${z}`, () => this._requestDataframe(x, y, z, urlToDataframeTransformer)).then(dataframe => {
                dataframe.orderID = x + y / 1000;
                return dataframe;
            });
        }));

        if (requestGroupID < this._currentRequestGroupID) {
            return true;
        }
        this._currentRequestGroupID = requestGroupID;

        this._oldDataframes.forEach(d => {
            d.active = false;
        });
        completedDataframes.forEach(d => {
            d.active = true;
        });
        const dataframesChanged = !isSetsEqual(new Set(completedDataframes), new Set(this._oldDataframes));
        this._oldDataframes = completedDataframes;
        return dataframesChanged;
    }

    async _requestDataframe (x, y, z, urlToDataframeTransformer) {
        const url = this._getTileUrl(x, y, z);
        const dataframe = await urlToDataframeTransformer(x, y, z, url);
        if (!dataframe.empty) {
            this._addDataframe(dataframe);
        }
        return dataframe;
    }
}
