import BaseCodec from '../Base';
import * as util from '../../utils/util';

export default class WindshaftDateCodec extends BaseCodec {
    constructor (metadata, propertyName) {
        super();
        const { min } = metadata.stats(propertyName);
        this._min_ms = min * 1000;
        this._min_date = util.msToDate(this._min_ms);
    }

    sourceToInternal (metadata, propertyValue) {
        return util.msToDate(propertyValue * 1000) - this._min_date;
    }

    internalToExternal (metadata, propertyValue) {
        let value = propertyValue;
        value += this._min_ms;
        return util.msToDate(value);
    }

    externalToSource (metadata, v) {
        return v.getTime() / 1000;
    }

    sourceToExternal (metadata, v) {
        return asDate(v);
    }

    inlineInternalMatch (thisValue, otherCodec) {
        const offset = otherCodec._min_ms - this._min_ms;
        return `(${thisValue}-${offset.toFixed(20)})`;
    }
}

// convert seconds epoch (source encoding) or Date to Date
function asDate (value) {
    if (value instanceof Date) {
        return value;
    }
    return util.msToDate(value * 1000);
}
