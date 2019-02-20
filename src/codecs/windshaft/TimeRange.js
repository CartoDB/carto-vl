import BaseCodec from '../Base';
import * as util from '../../utils/util';

export default class TimeRangeCodec extends BaseCodec {
    constructor (metadata, propertyName) {
        super();
        const stats = metadata.stats(propertyName);
        const { min } = stats;
        const tr = util.timeRange({ iso: min });
        this._min = tr.startValue / 1000;
        this._timeZone = stats.grouping && stats.grouping.timezone;
    }

    isRange () {
        return true;
    }

    sourceToInternal (metadata, propertyValue) {
        const tr = util.timeRange({ iso: propertyValue });
        return [tr.startValue / 1000, tr.endValue / 1000].map(v => (v - this._min));
    }

    internalToExternal (metadata, [lo, hi]) {
        return util.timeRange({
            start: (lo + this._min) * 1000,
            end: (hi + this._min) * 1000,
            timeZone: this._timeZone
        });
    }

    externalToSource (metadata, v) {
        return util.castTimeRange(v, this._timeZone).text;
    }

    sourceToExternal (metadata, v) {
        return util.timeRange({ iso: v, timeZone: this._timeZone });
    }

    inlineInternalMatch (thisValue, otherCodec) {
        const offset = otherCodec._min.getTime() - this._min.getTime();
        return `(${thisValue}-${offset.toFixed(20)})`;
    }
}
