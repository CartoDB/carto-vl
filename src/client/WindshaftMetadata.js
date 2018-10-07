import MVTMetadata from '../sources/MVTMetadata';
import CartoMapsAPIError, { CartoMapsAPITypes as cmt } from '../errors/carto-maps-api-error';
import * as util from '../utils/util';

// // Windshaft metadata internal structure of properties
// properties: {
//     // There's an entry here for every column of the original dataset/SQL query
//     simple_value: { type: 'number', min: 10, max: 1000 },

//     // Now, that's all there's to it for other sources,
//     // but for Windshaft sources things more complicated:

//     // There might be multiple aggregated properties derived from one base column
//     value: {
//         type: 'number' // this is the type of the base column and all aggregated properties
//         aggregation: {
//             // actual properties received and decoded are _cdb_agg_sum_value and _cdb_avg_sum_value
//             sum: '_cdb_agg_sum_value',
//             avg: '_cdb_agg_sum_value'
//         }
//     },

//     // Then we can have dimension properties, also derived from a base column
//     // here time1 is a date column of the dataset/query; but what we receive is
//     // a _cdb_dim_month_time1 property of numeric type.
//     // these dimension properties are triggered by clusterMonth/clusterMonthIso etc
//     time1: {
//         type: 'date' // this is the type of the base column only,
//         min: '2017-01-01T00:00:00',  // stats of the base column
//         max: '2018-12-01T00:00:00',
//         dimension: {
//             type: 'number', // type of the actual property received and decoded
//             grouping: {},// (to be changed to group) grouping parameters
//             propertyName: "_cdb_dim_month_time1",
//             min: 1,      // actual stats of property _cdb_dim_month_time1
//             max: 24
//         }
//     },

//     // But wait, there's more, we can transfer a date dimension as an iso string property
//     // but then expose it as two date properties, one for the start of each period and
//     // one from the end (if not used, any of them may not be present)
//     // these dimension properties are triggered by clusterMonthStart/clusterMonthEnd etc.
//     time2: {
//         type: 'date' // this is the type of the base column only,
//         min: '2017-01-01T00:00:00',  // stats of the base column
//         max: '2018-12-01T00:00:00',
//         dimension: {
//             type: 'category', // type of the actual property received internally
//             grouping: {},// (to be changed to group) grouping parameters
//             propertyName: "_cdb_dim_month_time1",
//             min: '2017-01', // stats of property _cdb_dim_month_time1
//             max: '2017-12',
//             modes: {
//                 // here come the actual decoded properties!!:
//                 // the types of these properties is 'date'
//                 'start': '_cdb_dim_month_time1_start',
//                 'start': '_cdb_dim_month_time1_end'
//                 // the stats for these properties are computed by the `stats` method of Metadata
//                 // using the internal property stats
//             }
//         }
//     }
// }

export default class WindshaftMetadata extends MVTMetadata {
    _dimensionInfo (propertyName) {
        const baseName = this.baseName(propertyName);
        const column = this.properties[baseName];
        let dimension = null;
        if (baseName !== propertyName) {
            if (column.dimension) {
                dimension = column.dimension;
            }
        }
        // type of the dataset/query column
        const baseType = column.type;
        // type of the source property
        const sourceType = dimension ? dimensionBaseType(dimension) : baseType;
        // type of the dataframe properties
        const type = dimension ? dimensionType(dimension) : sourceType;
        return { baseName, column, dimension, type, baseType, sourceType };
    }

    decode (propertyName, propertyValue) {
        const { baseName, column, type, baseType, dimension } = this._dimensionInfo(propertyName);
        if (!column) {
            return;
        }

        if (dimension && (baseType === 'date' && type !== 'category')) {
            return decodeTimeDim(propertyName, propertyValue, this.stats(propertyName), dimension);
        }
        switch (type) {
            case 'date':
                return decodeDate(propertyValue, this.stats(propertyName));
            case 'category':
                return this.categorizeString(baseName, propertyValue);
            case 'number':
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
                    return encodeTimeDim(propertyName, propertyValue, this.stats(propertyName), dimension);
                }
                return propertyValue;
        }
    }

    stats (propertyName) {
        const { dimension } = this._dimensionInfo(propertyName);
        if (dimension && dimension.grouping) {
            if (dimension.modes) { // and propertyName is one of the modes
                const mode = propertyMode(dimension.modes, propertyName);
                if (mode) {
                    const { min, max } = dimension;
                    return {
                        min: asDate(decodeModal(mode, min)),
                        max: asDate(decodeModal(mode, max))
                        // instead of the strict limits for this property
                        // we could extend them always for the pair of start/end properties:
                        // min: asDate(decodeModal('start', min)),
                        // max: asDate(decodeModal('end', max))
                    };
                }
            }
            return dimension;
        }
        return super.stats(propertyName);
    }
}

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

function decodeTimeDim (propertyName, propertyValue, stats, dimension) {
    let shouldRemap = false;
    let { min, max } = stats;
    if (dimension.modes) {
        const mode = propertyMode(dimension.modes, propertyName);
        if (mode) {
            shouldRemap = true;
            propertyValue = decodeModal(mode, propertyValue);
            shouldRemap = true;
            min = min.getTime() / 1000;
            max = max.getTime() / 1000;
        }
    }
    shouldRemap = shouldRemap || ['seconds', 'minutes'].includes(dimension.grouping.units);
    if (shouldRemap) {
        // the magnitude of the values is potentially large;
        // to prevent loss of precision in the GPU we'll remap
        // the range to 0:1
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

// convert seconds epoch (source encoding) or Date to Date
function asDate (value) {
    if (value instanceof Date) {
        return value;
    }
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

function dimensionType (dimension) {
    return dimension.modes ? 'date' : dimension.type;
}

function dimensionBaseType (dimension) {
    return dimension.type;
}
