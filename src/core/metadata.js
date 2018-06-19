
// The IDENTITY metadata contains zero properties
export const IDENTITY = {
    properties: {}
};

export default class Metadata {
    constructor(categoryIDs, properties, featureCount, sample, geomType, isAggregated = false) {
        this.categoryIDs = categoryIDs;
        this.properties = properties;
        this.featureCount = featureCount;
        this.sample = sample;
        this.geomType = geomType;
        this.isAggregated = isAggregated;
    }
}
