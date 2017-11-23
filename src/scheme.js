function Scheme(propertyNames, propertyTypes) {
    if (propertyNames.length != propertyTypes.length) {
        throw new Error("propertyNames and propertyTypes lengths mismatch");
    }
    propertyNames.map((name, index) => this[name] = propertyTypes[index]);
}
function checkSchemeMatch(schemeA, schemeB) {
    if (schemeA && schemeB) {
        const equals = Object.keys(schemeA).map(name => schemeA[name] == schemeB[name]).reduce((a, b) => a && b);
        if (!equals) {
            throw new Error(`Scheme mismatch: ${JSON.stringify(schemeA)}, ${JSON.stringify(schemeB)}`);
        }
    }
}

export {Scheme, checkSchemeMatch};