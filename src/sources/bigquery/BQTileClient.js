import BQDataframeCache from './BQDataframeCache';
import { rTiles } from '../../client/rsys';
import { isSetsEqual } from '../../utils/util';

export default class BQTileClient {
    constructor () {
        this._nextGroupID = 0;
        this._currentRequestGroupID = 0;
        this._oldDataframes = [];
        this._cache = new BQDataframeCache();
    }

    bindLayer (addDataframe) {
        this._addDataframe = addDataframe;
    }

    requestData (zoom, viewport, requestDataframes, viewportZoomToSourceZoom = Math.ceil) {
        const extend = 1; // one-tile ring over the viewport
        const tiles = rTiles(zoom, viewport, viewportZoomToSourceZoom, extend);
        return this._getTiles(tiles, requestDataframes);
    }

    free () {
        this._cache.free();
        this._cache = new BQDataframeCache();
        this._oldDataframes = [];
    }

    async _getTiles (tiles, requestDataframes) {
        this._nextGroupID++;
        const requestGroupID = this._nextGroupID;

        // Extract non-cached tiles
        const nonCachedTiles = tiles.filter(({ x, y, z }) => !this._cache.get(`${x},${y},${z}`));

        // Cache tiles with empty Dataframe to avoid multiple requests
        nonCachedTiles.map(({ x, y, z }) => this._cache.set(`${x},${y},${z}`, { }));

        // Request all tiles at the same time
        if (nonCachedTiles.length) {
            await this._requestDataframes(nonCachedTiles, requestDataframes);
        }

        const completedDataframes = tiles.map(({ x, y, z }) => this._cache.get(`${x},${y},${z}`));

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

    async _requestDataframes (tiles, requestDataframes) {
        const dataframes = await requestDataframes(tiles);
        for (let i = 0; i < dataframes.length; i++) {
            const dataframe = dataframes[i];
            const { x, y, z } = dataframe;
            dataframes[i].orderID = x + y / 1000;
            if (!dataframe.empty) {
                this._addDataframe(dataframe);
            }
            this._cache.set(`${x},${y},${z}`, dataframe);
        }
    }
}
