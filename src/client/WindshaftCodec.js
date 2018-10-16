import DataframeCodec from '../renderer/DataframeCodec';
import CartoMapsAPIError, { CartoMapsAPITypes as cmt } from '../errors/carto-maps-api-error';
import * as util from '../utils/util';

export default class WindshaftCodec extends DataframeCodec {
    encode (metadata, propertyName, propertyValue) {
        const { baseName, column, type, baseType, dimension } = metadata._dimensionInfo(propertyName);
        if (!column) {
            return;
        }

        if (dimension && (baseType === 'date' && type !== 'category')) {
            return decodeTimeDim(propertyName, propertyValue, metadata.stats(propertyName), dimension);
        }
        switch (type) {
            case 'date':
                return decodeDate(propertyValue, metadata.stats(propertyName));
            case 'category':
                // TODO: if baseType === 'date' wrap in util.timeRange()
                return metadata.categorizeString(baseName, propertyValue);
            case 'number':
                return propertyValue;
            default:
                throw new CartoMapsAPIError(
                    `${cmt.NOT_SUPPORTED} Windshaft MVT decoding error. Feature property value of type '${typeof propertyValue}' cannot be decoded.`
                );
        }
    }

    decode (metadata, propertyName, ...propertyValues) {
        const propertyValue = propertyValues[0];
        const { dimension, type, baseType } = metadata._dimensionInfo(propertyName);

        if (type === 'category' && baseType === 'date') {
            let start = propertyValue;
            let end = propertyValues[1];
            const [estart, eend] = [[start, 'start'], [end, 'end']].map(([v, mode]) => {
                const [min, max] = modalMinMax(mode, dimension);
                // return min !== max ? min + v * (max - min) : v;
                return v + min;
            });
            return util.timeRange(estart*1000, eend*1000);
        }

        switch (type) {
            case 'date':
                return encodeDate(propertyValue, metadata.stats(propertyName));
            case 'category':
                return metadata.IDToCategory.get(propertyValue);
            default:
                if (type === 'number' && baseType === 'date') {
                    return encodeTimeDim(propertyName, propertyValue, metadata.stats(propertyName), dimension);
                }
                return propertyValue;
        }
    }
};

function decodeDate (propertyValue, stats) {
    // unclassified date (epoch)
    // for convenience propertyValue can be either a source-encoded value or a Date()
    // (so this can be applied to the source values or to the stats which are stored as Dates)
    const d = asDate(propertyValue);
    const { min, max } = stats;
    const n = (d - min) / (max.getTime() - min.getTime());
    return n;
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

function propertyMode (modes, propertyName) {
    return Object.keys(modes).find(mode => modes[mode] === propertyName);
}

const COMBINED_LIMITS = true;

function modalMinMax(mode, stats) {
    let { min, max } = stats;
    if (COMBINED_LIMITS) {
        min = decodeModal('start', min);
        max = decodeModal('end', max);
    } else {
        min = decodeModal(mode, min);
        max = decodeModal(mode, max);
    }
    return [min, max];
}

function decodeTimeDim (propertyName, propertyValue, stats, dimension) {
    let shouldRemap = false;
    let { min, max } = stats;
    if (dimension.modes) {
        const mode = propertyMode(dimension.modes, propertyName);
        if (mode) {
            shouldRemap = true;
            propertyValue = decodeModal(mode, propertyValue);
            shouldRemap = true;
            [min, max] = modalMinMax(mode, stats);
        }
    }
    shouldRemap = shouldRemap || ['seconds', 'minutes'].includes(dimension.grouping.units);
    if (shouldRemap) {
        // the magnitude of the values is potentially large;
        // to prevent loss of precision in the GPU we'll remap
        // the range to 0:1
        // if (min !== max) {
        //     return (propertyValue - min) / (max - min);
        // }
        return propertyValue - min;
    }
    return propertyValue;
}

function encodeDate (propertyValue, stats) {
    let value = propertyValue;
    const { min, max } = stats;
    value *= (max.getTime() - min.getTime());
    value += min.getTime();
    const d = new Date();
    d.setTime(value);
    return d;
}

// Dates (rather than time dimensions)
// are handled internally as UNIX epochs (UTC)
// and converted to Date when accessed through a feature;
// The Date represents the internal UTC time in the
// local system timezone.
//
// For time dimension Start/End times
// the internal representation is a UNIX epoch but
// with the time zone offset of the ...
// we have two options:
// (as now) convert to Date adjusting for local TZ
// so that getUTCSTring(), getUTCDate() etc give access to
// the original date structure
// the purpose is to have a numerical quantity for styling, animation...
// alternative: reinterpret as local (so the TZ indication is incorrect)
// but the structure is correct.

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

function encodeTimeDim (propertyName, propertyValue, stats, dimension) {
    let shouldRemap = false;
    let castDate = false;
    if (dimension.modes) {
        const mode = propertyMode(dimension.modes, propertyName);
        if (mode) {
            shouldRemap = true;
            castDate = true;
        }
    }
    shouldRemap = shouldRemap || ['seconds', 'minutes'].includes(dimension.grouping.units);
    if (shouldRemap) {
        const { min, max } = stats;
        if (min !== max) {
            return Math.round((max - min) * propertyValue + min);
        }
    }
    if (castDate) {
        propertyValue = asDate(propertyValue);
    }
    return propertyValue;
}

