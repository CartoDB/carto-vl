import MVTMetadata from '../sources/MVTMetadata';
import windshaftCodecFactory from '../codecs/windshaft';

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
//             type: 'category', // type of the actual (source) property received internally
//             grouping: {},// (to be changed to group) grouping parameters
//             propertyName: "_cdb_dim_month_time1", // source property
//             min: '2017-01', // stats of property _cdb_dim_month_time1
//             max: '2017-12',
//             range: [
//                 // here come the actual decoded (internal) properties!!:
//                 // the types of these properties is 'date'
//                 '_cdb_dim_month_time1_start',
//                 '_cdb_dim_month_time1_end'
//             }
//         }
//     }
// }

export default class WindshaftMetadata extends MVTMetadata {
    constructor (...args) {
        super(...args);
        this.propertyKeys = [];
        this.baseNames = {};
        Object.keys(this.properties).forEach(baseName => {
            const property = this.properties[baseName];
            if (property.aggregations) {
                Object.values(property.aggregations).forEach(propName => {
                    this._addProperty(baseName, propName);
                });
            } else if (property.dimension) {
                if (property.dimension.range) {
                    property.dimension.range.forEach(rangePropertyName => {
                        this._addProperty(baseName, rangePropertyName, false);
                    });
                    // add source property too, for stats
                    this._addProperty(baseName, property.dimension.propertyName);
                } else {
                    this._addProperty(baseName, property.dimension.propertyName);
                }
            } else {
                this._addProperty(baseName, baseName);
            }
        });
    }

    _addProperty (baseName, propertyName, addToKeys = true) {
        this.baseNames[propertyName] = baseName;
        if (addToKeys) {
            this.propertyKeys.push(propertyName);
        }
    }

    _dimensionInfo (propertyName) {
        const baseName = this.baseName(propertyName) || propertyName;
        const column = this.properties[baseName];
        let dimension = null;
        if (baseName !== propertyName) {
            if (baseName !== propertyName && column.dimension) {
                dimension = column.dimension;
            }
        }
        const baseType = column.type;
        const sourceType = dimension ? dimensionBaseType(dimension) : baseType;
        // type of the dataframe properties
        const dataframeType = dimension ? dimensionType(dimension, propertyName) : sourceType;
        return { baseName, column, dimension, dataframeType, baseType, sourceType };
    }

    baseName (propertyName) {
        return this.baseNames[propertyName];
    }

    decodedProperties (propertyName) {
        const { dimension } = this._dimensionInfo(propertyName);
        if (dimension && dimension.grouping && dimension.range) {
            return dimension.range;
        }
        return super.decodedProperties(propertyName);
    }

    // Stats usage: (is internal, external or source representation preferable?)
    // * global aggregations
    // * coding/decoding
    stats (propertyName) {
        const { dimension } = this._dimensionInfo(propertyName);
        if (dimension && dimension.grouping) {
            return dimension;
        }
        return super.stats(propertyName);
    }

    setCodecs () {
        setMetadataCodecs(this);
    }

    sourcePropertyName (propertyName) {
        const baseName = this.baseName(propertyName);
        const dimension = this.properties[baseName].dimension;
        if (dimension && dimension.range) {
            return dimension.propertyName;
        }
        return propertyName;
    }
}

function dimensionType (dimension, propertyName) {
    if (dimension.range) {
        return 'date';
    }
    return dimension.type;
}

function dimensionBaseType (dimension) {
    return dimension.type;
}

function setMetadataCodecs (metadata) {
    // assign codecs
    // a single codec kept per base property
    // so, all its aggregations share the same encoding.
    // form a dimension, the kept codec is that of the dimension
    Object.keys(metadata.properties).forEach(baseName => {
        const property = metadata.properties[baseName];
        const baseType = property.type;
        if (baseType !== 'geometry') {
            const dimType = property.dimension ? property.dimension.type : null;
            const dimName = dimType ? property.dimension.propertyName : baseName;
            const actualDimType = (dimType === 'category' && property.dimension.range) ? 'timerange' : dimType;
            property.codec = windshaftCodecFactory(metadata, actualDimType || baseType, dimName || baseName);
        }
    });
}
