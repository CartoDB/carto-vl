import BaseCodec from '../Base';
import * as util from '../../utils/util';

export default class WindshaftDateCodec extends BaseCodec {
    constructor (metadata, propertyName) {
        super();
        const { min } = metadata.stats(propertyName);
        this._min_ms = min * 1000;
        this._min_date = util.msToDate(this._min_ms);
    }

    sourceToInternal (propertyValue) {
        return [util.msToDate(propertyValue * 1000) - this._min_date];
    }

    internalToExternal (propertyValue) {
        let value = propertyValue;
        value += this._min_ms;
        return util.msToDate(value);
    }

    externalToSource (v) {
        return v.getTime() / 1000;
    }

    sourceToExternal (v) {
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
    // TODO: value is in some arbitrary TZ;
    // next will interpret it as UTC, but then return
    // the value adjusted to the local TZ
    // it would be better to avoid the conversion,
    // so that the date can be interpreted in the value implicit TZ

    // as it is now, it is the corresponding UTC date that defines the start/end
    // so getUTCDate() etc toUTCString() etc
    return util.msToDate(value * 1000);
}
