import MVTMetadata from '../sources/MVTMetadata';

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
        const type = dimension ? dimensionType(dimension, propertyName) : sourceType;
        return { baseName, column, dimension, type, baseType, sourceType };
    }

    decodedProperties (propertyName) {
        const { dimension } = this._dimensionInfo(propertyName);
        if (dimension && dimension.grouping && dimension.modes) {
            return Object.values(dimension.modes);
        }
        return super.decodedProperties(propertyName);
    }

    stats (propertyName) {
        const { dimension, type } = this._dimensionInfo(propertyName);
        if (dimension && dimension.grouping) {
            return dimension;
        }
        return super.stats(propertyName);
    }
}

const MODE_TYPES = {
    'start': 'date',
    'end': 'date',
    'iso': 'category'
};

function dimensionType (dimension, propertyName) {
    if (dimension.modes) {
        const mode = Object.keys(dimension.modes).find(mode => dimension.modes[mode] === propertyName);
        return MODE_TYPES[mode] || dimension.type;
    }
    return dimension.type;
}

function dimensionBaseType (dimension) {
    return dimension.type;
}
