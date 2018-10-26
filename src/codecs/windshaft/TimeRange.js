import BaseCodec from '../Base';
import * as util from '../../utils/util';

export default class TimeRangeCodec extends BaseCodec {
    constructor (metadata, propertyName) {
        super();
        const stats = metadata.stats(propertyName);
        const { min } = stats;
        this._min = decodeModal('start', min);
        this._timeZone = stats.grouping && stats.grouping.timezone;
    }

    sourceToInternal (propertyValue) {
        const lo = decodeModal('start', propertyValue);
        const hi = decodeModal('end', propertyValue);
        return [lo, hi].map(v => (v - this._min));
    }

    internalToExternal (lo, hi) {
        return util.timeRange({
            start: (lo + this._min) * 1000,
            end: (hi + this._min) * 1000,
            timeZone: this._timeZone
        });
    }

    externalToSource (v) {
        return util.castTimeRange(v, this._timeZone).text;
    }

    sourceToExternal (v) {
        return util.timeRange({ iso: v, timeZone: this._timeZone });
    }

    inlineInternalMatch (thisValue, otherCodec) {
        const offset = otherCodec._min.getTime() - this._min.getTime();
        return `(${thisValue}-${offset.toFixed(20)})`;
    }
}

function decodeModal (mode, propertyValue) {
    // if (propertyValue instanceof Date) {
    //     return propertyValue.getTime() / 1000;
    // }
    switch (mode) {
        case 'start':
            return util.timeRange({ iso: propertyValue }).startValue / 1000;
        case 'end':
            return util.timeRange({ iso: propertyValue }).endValue / 1000;
    }
}
