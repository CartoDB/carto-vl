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
        throw new Error("propertyNames and propertyTypes lengths mismatch");
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
        const equals = Object.keys(schemaA).map(name => schemaA[name] == schemaB[name]).reduce((a, b) => a && b);
        if (!equals) {
            throw new Error(`schema mismatch: ${JSON.stringify(schemaA)}, ${JSON.stringify(schemaB)}`);
        }
    }
}

export { Schema, checkSchemaMatch };