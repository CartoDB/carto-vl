import BaseCodec from '../Base';
import * as util from '../../utils/util';

export default class TimeRangeCodec extends BaseCodec {
    constructor (metadata, propertyName) {
        super();
        const { min } = metadata.stats(propertyName);
        this._min = decodeModal('start', min);
    }

    sourceToInternal (propertyValue) {
        const lo = decodeModal('start', propertyValue);
        const hi = decodeModal('end', propertyValue);
        return [lo, hi].map(v => (v - this._min));
    }

    internalToExternal (lo, hi) {
        return util.timeRange((lo + this._min) * 1000, (hi + this._min) * 1000);
    }

    externalToSource (v) {
        return util.timeRange(v).text;
    }

    sourceToExternal (v) {
        return util.timeRange(v);
    }

    inlineInternalMatch (thisValue, otherCodec) {
        const offset = otherCodec._min.getTime() - this._min.getTime();
        return `(${thisValue}-${offset.toFixed(20)})`;
    }
}

function decodeModal (mode, propertyValue) {
    if (propertyValue instanceof Date) {
        // Support Date because stats are stored so, rather that in source encoding
        return propertyValue.getTime() / 1000;
    }
    switch (mode) {
        case 'start':
            return util.startTimeValue(propertyValue) / 1000;
        case 'end':
            return util.endTimeValue(propertyValue) / 1000;
    }
}
