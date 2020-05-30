import BigQueryTileCache from './BQTileCache';
import { rTiles } from '../../client/rsys';
import { isSetsEqual, projectToWebMercator, WM_R } from '../../utils/util';

export default class BigQueryTileClient {
    constructor () {
        this._nextGroupID = 0;
        this._currentRequestGroupID = 0;
        this._oldDataframes = [];
        this._cache = new BigQueryTileCache();
    }

    bindLayer (addDataframe) {
        this._addDataframe = addDataframe;
    }

    requestData (zoom, viewport, requestDataframes, viewportZoomToSourceZoom = Math.ceil, bounds) {
        const extend = 0; // tile ring around the viewport
        viewport = this._filterViewport(viewport, bounds);
        const tiles = rTiles(zoom, viewport, viewportZoomToSourceZoom, extend);
        return this._getTiles(tiles, requestDataframes);
    }

    free () {
        this._cache.free();
        this._cache = new BigQueryTileCache();
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

    _filterViewport (viewport, bounds) {
        if (bounds) {
            const localBounds = this._localBounds(bounds);
            return [
                Math.max(viewport[0], localBounds[0]),
                Math.max(viewport[1], localBounds[1]),
                Math.min(viewport[2], localBounds[2]),
                Math.min(viewport[3], localBounds[3])
            ];
        }
        return viewport;
    }

    _localBounds (bounds) {
        const sw = projectToWebMercator({
            lng: bounds[0],
            lat: bounds[1]
        });
        const ne = projectToWebMercator({
            lng: bounds[2],
            lat: bounds[3]
        });
        return [sw.x / WM_R, sw.y / WM_R, ne.x / WM_R, ne.y / WM_R];
    }
}
