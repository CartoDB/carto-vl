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
            return dimension;
        }
        return super.stats(propertyName);
    }
}

function decodeDate (propertyValue, stats) {
    // unclassified date (epoch)
    const d = new Date();
    d.setTime(1000 * propertyValue);
    const { min, max } = stats;
    const n = (d - min) / (max.getTime() - min.getTime());
    return n;
}

function decodeTimeDim (propertyValue, stats, grouping) {
    if (['seconds', 'minutes'].includes(grouping.grouping)) {
        // the magnitude of the values is potentially large;
        // to prevent loss of precision in the GPU we'll remap
        // the range to 0:1
        const { min, max } = stats;
        if (min !== max) {
            return (propertyValue - min) / (max - min);
        }
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

function encodeTimeDim (propertyValue, stats, grouping) {
    if (['seconds', 'minutes'].includes(grouping.grouping)) {
        const { min, max } = stats;
        if (min !== max) {
            return Math.round((max - min) * propertyValue + min);
        }
    }
    return propertyValue;
}

