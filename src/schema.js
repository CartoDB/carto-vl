/**
 * @jsapi
 * @constructor
 * @description A schema is a list of properties with associated types.
 *
 * Schemas are used as dataframe headers and as a way to define what kind of dataframes are valid for a particular style.
 * @param {String[]} propertyNames
 * @param {String[]} propertyTypes
 */
function Schema(propertyNames, propertyTypes) {
    if (propertyNames.length != propertyTypes.length) {
        throw new Error('propertyNames and propertyTypes lengths mismatch');
    }
    propertyNames.map((name, index) => this[name] = propertyTypes[index]);
}

/**
 * Assert that two schemas match.
 *
 * Two schemas match if at least one of them is undefined or if they contain the same properties with the same types.
 * @param {Schema} schemaA
 * @param {Schema} schemaB
 * @throws If the schemas don't match
 */
function checkSchemaMatch(schemaA, schemaB) {
    if (schemaA != undefined && schemaB != undefined) {
        const equals = Object.keys(schemaA).map(name => schemaA[name] == schemaB[name]).reduce((a, b) => a && b, true);
        if (!equals) {
            throw new Error(`schema mismatch: ${JSON.stringify(schemaA)}, ${JSON.stringify(schemaB)}`);
        }
    }
}



class Float {
    constructor(globalMin, globalMax) {
        this.globalMin = globalMin;
        this.globalMax = globalMax;
    }
}
class Category {
    constructor(categoryNames, categoryCounts, categoryIDs) {
        this.categoryNames = categoryNames;
        this.categoryCounts = categoryCounts;
        this.categoryIDs = categoryIDs;
    }
}

// The IDENTITY schema contains zero columns, and it has two interesting properties:
//      union(a,IDENTITY)=union(IDENTITY, a)=a
//      contains(x, IDENTITY)=true  (for x = valid schema)
export const IDENTITY = {
    columns: []
};

/*
const metadata = {
    featureCount: 0,
    columns: [
        {
            name: 'temp',
            type: 'float',
            min: -10,
            max: 45,
            avg: 25,
            histogram: [3, 6, 10, 22, 21, 14, 2, 1],
            jenks3: [10, 20],
            jenks4: [8, 15, 22],
            jenks5: [7, 14, 18, 23],
            jenks6: [],
            jenks7: [],
        },
        {
            name: 'cat',
            type: 'category',
            categoryNames: ['red', 'blue', 'green'],
            categoryCount: [10, 30, 15],
        }
    ]
};

const schema = {
    columns: [
        {
            name: 'temp',
            aggs: ['avg', 'min', 'max']
        },
        {
            name: 'cat',
            aggs: null,
        }
    ]
};*/

// Returns true if subsetSchema is a contained by supersetSchema
// A schema A is contained by the schema B when all columns of A are present in B and
// all aggregations in A are present in B, if a column is not aggregated in A, it must
// be not aggregated in B
export function contains(supersetSchema, subsetSchema) {
    subsetSchema.columns.map(columnA => {
        const columnB = supersetSchema.find(column => column.name == columnA.name);
        if (!columnB) {
            return false;
        }
        if (!columnA.aggs) {
            return !columnB.aggs;
        }
        return columnA.aggs.map(agg => columnB.aggs.find(agg)).reduce((x, y) => x && y, true);
    }).reduce((x, y) => x && y, true);
}

// Returns the union of a and b schemas
// The union of two schemas is a schema with all the properties in both schemas and with their
// aggregtions set to the union of both aggregation sets, or null if a property aggregation is null in both schemas
// The union is not defined when one schema set the aggregation of one column and the other schema left the aggregation
// to null. In this case the function will throw an exception.
export function union(a, b) {
    const t = a.columns.concat(b.columns);
    return {
        columns: t.filter((item, pos) => t.indexOf(item) == pos)
    };
}

export { Schema, checkSchemaMatch, Float, Category };