/**
 * @api
 * @constructor
 * @param {*} propertyNames
 * @param {*} propertyTypes
 */
function Schema(propertyNames, propertyTypes) {
    if (propertyNames.length != propertyTypes.length) {
        throw new Error("propertyNames and propertyTypes lengths mismatch");
    }
    propertyNames.map((name, index) => this[name] = propertyTypes[index]);
}

/**
 *
 * @param {*} schemaA
 * @param {*} schemaB
 */
function checkschemaMatch(schemaA, schemaB) {
    if (schemaA && schemaB) {
        const equals = Object.keys(schemaA).map(name => schemaA[name] == schemaB[name]).reduce((a, b) => a && b);
        if (!equals) {
            throw new Error(`schema mismatch: ${JSON.stringify(schemaA)}, ${JSON.stringify(schemaB)}`);
        }
    }
}

export {Schema, checkschemaMatch};