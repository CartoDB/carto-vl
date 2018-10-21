import { BaseCodec, IdentityCodec } from '../renderer/Codec';
import CartoMapsAPIError, { CartoMapsAPITypes as cmt } from '../errors/carto-maps-api-error';
import * as util from '../utils/util';

export default function windshaftCodecFactory (metadata, type, propertyName) {
    switch (type) {
        case 'number':
            return new NumberCodec();
        case 'category':
            return new CategoryCodec(metadata, propertyName);
        case 'date':
            return new DateCodec(metadata, propertyName);
        case 'timerange':
            return new TimeRangeCodec(metadata, propertyName);
        default:
            throw new CartoMapsAPIError(
                `${cmt.NOT_SUPPORTED} Windshaft MVT decoding error. Feature property value of type '${typeof propertyValue}' cannot be decoded.`
            );
    }
}

const NumberCodec = IdentityCodec; // TODO: but with NaN/Null support!!!
class CategoryCodec extends BaseCodec {
    constructor (metadata, propertyName) {
        super();
        this._metadata = metadata;
        this._baseName = metadata.baseName(propertyName);
    }

    sourceToInternal (propertyValue) {
        return [this._metadata.categorizeString(this._baseName, propertyValue)];
    }

    internalToExternal (propertyValue) {
        return this._metadata.IDToCategory.get(propertyValue);
    }

    sourceToExternal (propertyValue) {
        return propertyValue;
    }

    externalToSource (v) {
        return v;
    }
}

class DateCodec extends BaseCodec {
    constructor (metadata, propertyName) {
        super();
        const { min } = metadata.stats(propertyName);
        this._min = min.getTime();
    }

    sourceToInternal (propertyValue) {
        return [util.msToDate(propertyValue * 1000) - this._min];
    }

    internalToExternal (propertyValue) {
        let value = propertyValue;
        value += this._min.getTime();
        return util.msToDate(value);
    }

    externalToSource (v) {
        return v.getTime() / 1000;
    }

    sourceToExternal (v) {
        return asDate(v);
    }

    inlineInternalMatch (thisValue, otherCodec) {
        const offset = otherCodec._min.getTime() - this._min.getTime();
        return `(${thisValue}-${offset.toFixed(20)})`;
    }
}

class TimeRangeCodec extends BaseCodec {
    constructor (metadata, propertyName) {
        super();
        const { min } = metadata.stats(propertyName);
        this._min = decodeModal('start', min);
        // this._min = this.limitsToInternal(min, max)[0];
    }

    sourceToInternal (propertyValue) {
        const lo = decodeModal('start', propertyValue);
        const hi = decodeModal('end', propertyValue);
        return [lo, hi].map(v => (v - this._min));
    }

    internalToExternal (lo, hi) {
        util.timeRange((lo + this._min) * 1000, (hi + this._min) * 1000);
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
