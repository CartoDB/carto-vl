import MVTMetadata from '../sources/MVTMetadata';

// TODO: remove
import schema from '../renderer/schema';

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

        if (this.properties[basename].type === 'category') {
            return this.IDToCategory.get(propertyValue);
        } else if (this.properties[basename].type === 'date') {
            return encodeDate(propertyName, this.properties[basename], propertyValue);
        } else {
            return propertyValue;
        }
    }
};


function epochTo (t, unit) {
    switch (unit) {
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

function timeLimits (groupBy, limits) {
    const { min, max } = limits;
    switch (groupBy) {
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
    return { min: epochTo(min, groupBy), max: epochTo(max, groupBy) };
}

function decodeDate (propertyName, column, propertyValue) {
    if (column.dimensions) {
        // classified date
        // obtain time classification
        // we could also find the entry in column.dimensions which has the value propertyName
        const groupBy = schema.column.getGroupBy(propertyName);
        // now we have metadata in column about the base column;
        // and we have to derive from it the limits of the classified column
        const { min, max } = timeLimits(groupBy, column);
        console.log(column,column.dimensions);
        console.log("DD CLASSIFIED", propertyValue, min, max);
        return (propertyValue - min) / (max - min); // TODO: handle max === min
    } else {
        // unclassified date (epoch)
        const d = new Date();
        d.setTime(1000 * propertyValue);
        const { min, max } = column;
        const n = (d - min) / (max.getTime() - min.getTime());
        console.log("DD EPOCH", propertyValue, d, min, max);
        return n;
    }
}

function encodeDate (propertyName, column, propertyValue) {
    if (column.dimensions) { // more specifically if there's a dimension mapped to propertyName
        // TODO: un map from 0,1... need to use the limits computed from metadata (maybe move that function to metadata?)
        const groupBy = schema.column.getGroupBy(propertyName);
        // TODO:...
    } else {
        let value = propertyValue;
        const { min, max } = column;
        value *= (max.getTime() - min.getTime());
        value += min.getTime();
        const d = new Date();
        d.setTime(1000 * value);
        return d;
    }
}
