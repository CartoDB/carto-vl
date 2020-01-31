import DataframeCache from '../DataframeCache';
import { rTiles } from '../../client/rsys';
import { isSetsEqual } from '../../utils/util';

export default class BQTileClient {
    constructor () {
        this._nextGroupID = 0;
        this._currentRequestGroupID = 0;
        this._oldDataframes = [];
        this._cache = new DataframeCache();
    }

    bindLayer (addDataframe) {
        this._addDataframe = addDataframe;
    }

    requestData (zoom, viewport, requestDataframe, viewportZoomToSourceZoom = Math.ceil) {
        const tiles = rTiles(zoom, viewport, viewportZoomToSourceZoom);
        return this._getTiles(tiles, requestDataframe);
    }

    free () {
        this._cache.free();
        this._cache = new DataframeCache();
        this._oldDataframes = [];
    }

    async _getTiles (tiles, requestDataframe) {
        this._nextGroupID++;
        const requestGroupID = this._nextGroupID;

        // TODO:
        // Extract non-cached tiles
        // Request all tiles at the same time
        // Generate all the dataframes from the response

        const completedDataframes = await Promise.all(tiles.map(({ x, y, z }) => {
            return this._cache.get(`${x},${y},${z}`, () => this._requestDataframe(x, y, z, requestDataframe)).then(dataframe => {
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

    async _requestDataframe (x, y, z, requestDataframe) {
        const dataframe = await requestDataframe(x, y, z);
        if (!dataframe.empty) {
            this._addDataframe(dataframe);
        }
        return dataframe;
    }
}
