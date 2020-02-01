import * as LRU from 'lru-cache';

export default class BQDataframeCache {
    constructor () {
        const lruOptions = {
            max: 512,
            length: () => 1,
            maxAge: 1000 * 60 * 60,
            dispose: (uid, dataframe) => {
                if (dataframe.empty === false) {
                    dataframe.free();
                }
            }
        };
        this._cache = LRU(lruOptions);
    }

    get (uid) {
        return this._cache.get(uid);
    }

    set (uid, dataframe) {
        this._cache.set(uid, dataframe);
    }

    free () {
        this._cache.reset();
    }
}
