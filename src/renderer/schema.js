// The IDENTITY schema contains zero columns, and it has two interesting properties:
//      union(a,IDENTITY)=union(IDENTITY, a)=a
//      contains(x, IDENTITY)=true  (for x = valid schema)
export const IDENTITY = {
    columns: []
};

/*
const schema = {
    columns: ['temp', 'cat']
}; */

// TODO
// Returns true if subsetSchema is a contained by supersetSchema
// A schema A is contained by the schema B when all columns of A are present in B and
// all aggregations in A are present in B, if a column is not aggregated in A, it must
// be not aggregated in B
// export function contains(supersetSchema, subsetSchema) {
// }

// Returns the union of a and b schemas
// The union of two schemas is a schema with all the properties in both schemas and with their
// aggregtions set to the union of both aggregation sets, or null if a property aggregation is null in both schemas
// The union is not defined when one schema set the aggregation of one column and the other schema left the aggregation
// to null. In this case the function will throw an exception.
export function union (a, b) {
    const t = a.columns.concat(b.columns);
    return {
        columns: t.filter((item, pos) => t.indexOf(item) == pos)
    };
}

export function equals (a, b) {
    if (!a || !b) {
        return false;
    }
    return a.columns.length == b.columns.length && a.columns.every(v => b.columns.includes(v));
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
