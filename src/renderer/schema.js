
export const IDENTITY = {};

/*
const mns = {
    price:  [{type: 'unaggregated'}],
    amount: [{type: 'aggregated', op: 'avg'}, {type: 'aggregated', op: 'max'}}],
    dow:    [{type: 'dimension', dimension: { group: {units: 'dayOfWeek'}}}]
};

*/

export function union (a, b) {
    const result = {};
    const propertyNames = new Set(Object.keys(a).concat(Object.keys(b)));
    propertyNames.forEach(propertyName => {
        const aUsages = a[propertyName] || [];
        const bUsages = b[propertyName] || [];
        const combinedUsage = [...aUsages, ...bUsages];
        result[propertyName] = combinedUsage;
    });
    return result;
}

export function equals (a, b) {
    if (!a || !b) {
        return false;
    }
    return JSON.stringify(simplify(a)) === JSON.stringify(simplify(b));
}

function simplify (MNS) {
    const result = {};
    const propertyNames = Object.keys(MNS).sort();
    propertyNames.forEach(propertyName => {
        // Stringify and Set to remove duplicates
        let usage = [...new Set(MNS[propertyName].map(u => JSON.stringify(u)))];
        usage.sort();
        usage = usage.map(u => JSON.parse(u));
        result[propertyName] = usage;
    });
    return result;
}

// TODO: this is Windsshaft-specific, so move to WindshaftMetadata

const AGG_PREFIX = '_cdb_agg_';
const DIM_PREFIX = '_cdb_dim_';

export const CLUSTER_FEATURE_COUNT = '_cdb_feature_count';

// column information functions
export const column = {
    aggColumn (name, aggFN) {
        return `${AGG_PREFIX}${aggFN}_${name}`;
    },
    dimColumn (name, groupBy) {
        return `${DIM_PREFIX}${groupBy}_${name}`;
    }
};

export default { column, equals, union, IDENTITY, simplify };
