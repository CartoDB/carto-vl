import * as LRU from 'lru-cache';

export default class DataframeCache {
    constructor () {
        const lruOptions = {
            max: 256,
            // TODO improve cache length heuristic
            length: () => 1,
            maxAge: 1000 * 60 * 60,
            dispose: (uid, dataframePromise) => {
                dataframePromise.then(dataframe => {
                    if (!dataframe.empty) {
                        dataframe.free();
                    }
                });
            }
        };
        this._cache = LRU(lruOptions);
    }

    // Get the promise of the dataframe with the provided unique ID, by querying the local cache, and using the fetch function as a fallback.
    // The `fetch` function will be called with the provided `uid` and it is expected that it will return a promise to a Dataframe
    get (uid, fetch) {
        const cachedDataframe = this._cache.get(uid);
        if (cachedDataframe) {
            return cachedDataframe;
        }

        const dataframePromise = fetch(uid);
        this._cache.set(uid, dataframePromise);
        return dataframePromise;
    }

    free () {
        this._cache.reset();
    }
}
