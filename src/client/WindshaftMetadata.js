import MVTMetadata from '../sources/MVTMetadata';

export default class WindshaftMetadata extends MVTMetadata {
    decode(propertyName, propertyValue) {
        const basename = this.baseName(propertyName);
        const column = this.properties[basename];
        if (!column) {
            return;
        }
        switch (column.type) {
            case 'date':
                return decodeDate(propertyName, column, propertyValue);
            case 'category':
                return this.categorizeString(basename, propertyValue);
            case 'number':
                return propertyValue;
            default:
                throw new CartoMapsAPIError(
                    `${cmt.NOT_SUPPORTED} Windshaft MVT decoding error. Feature property value of type '${typeof propertyValue}' cannot be decoded.`
                );
        }
    }

    encode(propertyName, propertyValue) {
        const basename = this.baseName(propertyName);

        switch (this.properties[basename].type) {
            case 'date':
                return encodeDate(propertyName, this.properties[basename], propertyValue);
            case 'category':
                return this.IDToCategory.get(propertyValue);
            default:
                return propertyValue;
        }
    }
};

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

function decodeDate (propertyName, column, propertyValue) {
    if (column.dimension && column.dimension.grouping) {
        if (!UNIT_DECODING) {
            return propertyValue;
        }
        // classified date
        // column.dimension.propertyName === propertyName
        const grouping = column.dimension.grouping;
        const { min, max } = timeLimits(grouping, column);
        return (propertyValue - min) / (max - min); // TODO: handle max === min
    } else {
        // unclassified date (epoch)
        const d = new Date();
        d.setTime(1000 * propertyValue);
        const { min, max } = column;
        const n = (d - min) / (max.getTime() - min.getTime());
        return n;
    }
}

function encodeDate (propertyName, column, propertyValue) {
    if (column.dimension && column.dimension.grouping) {
        if (!UNIT_DECODING) {
            return propertyValue;
        }
        // TODO: un map from 0,1... need to use the limits computed from metadata (maybe move that function to metadata?)
        // TODO: use other parameters: timezone, offset
        // column.dimension.propertyName === propertyName
        const grouping = column.dimension.grouping;
        const { min, max } = timeLimits(grouping, column);
        return Math.round((max - min) * propertyValue + min);
    } else {
        let value = propertyValue;
        const { min, max } = column;
        value *= (max.getTime() - min.getTime());
        value += min.getTime();
        const d = new Date();
        d.setTime(value);
        return d;
    }
}
