
export const IDENTITY = {};

/*
const mns = {
    price:  [{type: 'unaggregated'}],
    amount: [{type: 'aggregated', op: 'avg'}, {type: 'aggregated', op: 'max'}}],
    dow:    [{type: 'dimension', op: 'dayOfWeek'}]
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

const AGG_PREFIX = '_cdb_agg_';
const AGG_PATTERN = new RegExp('^' + AGG_PREFIX + '[a-zA-Z0-9]+_');
const DIM_PREFIX = '_cdb_dim_';
const DIM_PATTERN = new RegExp('^' + DIM_PREFIX + '[a-zA-Z0-9]+_');

export const CLUSTER_FEATURE_COUNT = '_cdb_feature_count';

function isAggregated (name) {
    return name.startsWith(AGG_PREFIX);
}

function isDimension (name) {
    return name.startsWith(DIM_PREFIX);
}

// column information functions
export const column = {
    isAggregated,
    isDimension,
    getBase: function getBase (name) {
        const pattern = isAggregated(name) ? AGG_PATTERN
                      : isDimension(name) ? DIM_PATTERN
                      : '';
        return name.replace(pattern, '');
    },
    getAggFN: function getAggFN (name) {
        let s = name.substr(AGG_PREFIX.length);
        return s.substr(0, s.indexOf('_'));
    },
    aggColumn (name, aggFN) {
        return `${AGG_PREFIX}${aggFN}_${name}`;
    },
    dimColumn (name, groupBy) {
        return `${DIM_PREFIX}${groupBy}_${name}`;
    },
    getGroupBy: function getGroupBy (name) {
        let s = name.substr(DIM_PREFIX.length);
        return s.substr(0, s.indexOf('_'));
    }
};

export default { column, equals, union, IDENTITY, simplify };
