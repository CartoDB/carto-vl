// The IDENTITY schema contains zero columns, and it has two interesting properties:
//      union(a,IDENTITY)=union(IDENTITY, a)=a
//      contains(x, IDENTITY)=true  (for x = valid schema)
export const IDENTITY = {
    columns: []
};

/*
const schema = {
    columns: ['temp', 'cat']
};*/

//TODO
// Returns true if subsetSchema is a contained by supersetSchema
// A schema A is contained by the schema B when all columns of A are present in B and
// all aggregations in A are present in B, if a column is not aggregated in A, it must
// be not aggregated in B
//export function contains(supersetSchema, subsetSchema) {
//}

// Returns the union of a and b schemas
// The union of two schemas is a schema with all the properties in both schemas and with their
// aggregtions set to the union of both aggregation sets, or null if a property aggregation is null in both schemas
// The union is not defined when one schema set the aggregation of one column and the other schema left the aggregation
// to null. In this case the function will throw an exception.
export function union(a, b) {
    a = a || {};
    b = b || {};
    const columns = (a.columns || []).concat(b.columns || []);
    return {
        columns: columns.filter((item, pos) => columns.indexOf(item) === pos)
    };
}

export function equals(a,b){
    if (!a || !b){
        return false;
    }
    return a.columns.length==b.columns.length && a.columns.every(v=> b.columns.includes(v));
}

const AGG_PREFIX = '_cdb_agg';
const AGG_PATTERN = new RegExp('^' + AGG_PREFIX + ' ([a-zA-Z0-9_]+) ([a-zA-Z0-9_]+)');
const AGG_PATTERN_ALIAS = new RegExp('^' + AGG_PREFIX + ' [a-zA-Z0-9_]+ [a-zA-Z0-9_]+ ([a-zA-Z0-9_]+)');

// column information functions
export const column = {
    isAggregated: name => {
        return name.startsWith(AGG_PREFIX);
    },
    getAggregateFunction: name => {
        const result = AGG_PATTERN.exec(name);
        return result ? result[1] : '';
    },
    getAggregatedColumn: name => {
        const result = AGG_PATTERN.exec(name);
        return result ? result[2] : name;
    },
    getAlias: name => {
        const result = AGG_PATTERN_ALIAS.exec(name);
        return result ? result[1] : name;
    },
    aggregatedName(aggFunction, aggColumn, alias) {
        let name = `${AGG_PREFIX} ${aggFunction} ${aggColumn}`;
        if (alias) {
            name += ` ${alias}`;
        }
        return name;
    }
};
