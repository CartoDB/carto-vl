import * as LRU from 'lru-cache';

export default class DataframeCache {
    constructor() {
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

    get(key) {
        return this._cache.get(key);
    }

    has(key) {
        return this._cache.has(key);
    }

    set(key, value) {
        return this._cache.set(key, value);
    }

}
