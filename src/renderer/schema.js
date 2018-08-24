
export const IDENTITY = {};

/*
const mns = {
  price:  new Set(['avg', 'max]),
  amount: new Set(['unaggregated']),
  other:  new Set([]),
};

*/

// TODO

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
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    return [...new Set(aKeys.concat(bKeys))].every(propertyName => {
        const aUsages = a[propertyName];
        const bUsages = b[propertyName];
        if (!aUsages || !bUsages) {
            return false;
        }

        function cmp (a, b) {
            return a.type === b.type && a.op === b.op;
        }
        return aUsages.every(a =>
            bUsages.find(b => cmp(a, b))
        ) &&
            bUsages.every(b =>
                aUsages.find(a => cmp(a, b))
            );
    });
}

const AGG_PREFIX = '_cdb_agg_';
const AGG_PATTERN = new RegExp('^' + AGG_PREFIX + '[a-zA-Z0-9]+_');

// column information functions
export const column = {
    isAggregated: function isAggregated (name) {
        return name.startsWith(AGG_PREFIX);
    },
    getBase: function getBase (name) {
        return name.replace(AGG_PATTERN, '');
    },
    getAggFN: function getAggFN (name) {
        let s = name.substr(AGG_PREFIX.length);
        return s.substr(0, s.indexOf('_'));
    },
    aggColumn (name, aggFN) {
        return `${AGG_PREFIX}${aggFN}_${name}`;
    }
};

export default { column, equals, union, IDENTITY };
