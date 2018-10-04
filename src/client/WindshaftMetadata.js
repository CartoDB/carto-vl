import MVTMetadata from '../sources/MVTMetadata';
import CartoMapsAPIError, { CartoMapsAPITypes as cmt } from '../errors/carto-maps-api-error';

export default class WindshaftMetadata extends MVTMetadata {

    _dimensionInfo (propertyName) {
        const baseName = this.baseName(propertyName);
        const column = this.properties[baseName];
        let dimension = null;
        if (baseName !== propertyName) {
            if (column.dimension && column.dimension.propertyName === propertyName) {
                dimension = column.dimension;
            }
        }
        const baseType = column.type;
        const type = dimension ? dimension.type : baseType;
        return { baseName, column, dimension, type, baseType };
    }

    decode (propertyName, propertyValue) {
        const { baseName, column, type, baseType, dimension } = this._dimensionInfo(propertyName);
        if (!column) {
            return;
        }

        switch (type) {
            case 'date':
                return decodeDate(propertyValue, this.stats(propertyName));
            case 'category':
                return this.categorizeString(baseName, propertyValue);
            case 'number':
                if (baseType === 'date') {
                    return decodeTimeDim(propertyValue, this.stats(propertyName), dimension.grouping);
                }
                return propertyValue;
            default:
                throw new CartoMapsAPIError(
                    `${cmt.NOT_SUPPORTED} Windshaft MVT decoding error. Feature property value of type '${typeof propertyValue}' cannot be decoded.`
                );
        }
    }

    encode (propertyName, propertyValue) {
        const { dimension, type, baseType } = this._dimensionInfo(propertyName);

        switch (type) {
            case 'date':
                return encodeDate(propertyValue, this.stats(propertyName));
            case 'category':
                return this.IDToCategory.get(propertyValue);
            default:
                if (type === 'number' && baseType === 'date') {
                    return encodeTimeDim(propertyValue, this.stats(propertyName), dimension.grouping);
                }
                return propertyValue;
        }
    }

    stats(propertyName) {
        const { column, dimension } = this._dimensionInfo(propertyName);
        if (dimension && dimension.grouping) {
            // TODO: when backend dim stats are implemented,
            // keep them here and use them.
            return timeLimits(dimension.grouping, column);
        }
        return super.stats(propertyName);
    }
}

function epochTo (t, grouping) {
    // TODO: support grouping.offset, grouping.timezone
    // which are currently ignored
    // Note that supporting timezone for other than fixed offsets
    // (i.e. with DST) would require a largish time library
    switch (grouping.group_by) {
        case 'second':
            return Math.floor(t);
        case 'minute':
            return Math.floor(t / 60);
        case 'hour':
            return Math.floor(t / 3600);
        case 'day':
            return Math.floor(t / 86400);
        case 'week':
            return Math.floor(t / (7 * 86400));

        case 'month':
            return 1000; // debugging

        default:
            throw new Error(`Time grouped by ${grouping.group_by} not yet supported`);
        // TODO:
        // case 'month':
        // case 'quarter':
        // case 'year':
        // case 'century':
        // case 'millenium':
        // case 'semester':
        // case 'trimester':
    }
}

// derive the limits of a grouped time dimension from
// the limits of the base column
function timeLimits (grouping, limits) {
    const { min, max } = limits;
    switch (grouping.group_by) {
        case 'minuteOfHour':
            return { min: 0, max: 59 };
        case 'hourOfDay':
            return { min: 0, max: 23 };
        case 'dayOfWeek':
            return { min: 0, max: 6 };
        case 'dayOfMonth':
            return { min: 1, max: 31 };
        case 'dayOfYear':
            return { min: 1, max: 366 };
        case 'weekOfYear':
            return { min: 1, max: 52 };
        case 'monthOfYear':
            return { min: 1, max: 12 };
        case 'quarterOfYear':
            return { min: 1, max: 4 };
        case 'trimesterOfYear':
            return { min: 1, max: 3 };
        case 'semesterOfYear':
            return { min: 1, max: 2 };
    }
    return { min: epochTo(min, grouping), max: epochTo(max, grouping) };
}

const UNIT_DECODING = false; // DEBUGGING

function decodeDate (propertyValue, stats) {
    // unclassified date (epoch)
    const d = new Date();
    d.setTime(1000 * propertyValue);
    const { min, max } = stats;
    const n = (d - min) / (max.getTime() - min.getTime());
    return n;
}

function decodeTimeDim (propertyValue, stats, _grouping) {
    // TODO: only needed for some _grouping.group_by cases
    if (!UNIT_DECODING) {
        return propertyValue;
    }
    // classified date
    const { min, max } = stats;
    return (propertyValue - min) / (max - min); // TODO: handle max === min

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

function encodeTimeDim (propertyValue, stats, _grouping) {
    // TODO: only needed for some _grouping.group_by cases
    if (!UNIT_DECODING) {
        return propertyValue;
    }
    const { min, max } = stats;
    return Math.round((max - min) * propertyValue + min);
}

