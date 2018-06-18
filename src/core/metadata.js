
// The IDENTITY metadata contains zero columns
export const IDENTITY = {
    properties: {}
};

export default class Metadata {
    constructor(categoryIDs, properties, featureCount, sample, geomType, isAggregated = false) {
        this.categoryIDsToName = {};
        Object.keys(categoryIDs).forEach(name=>{
            this.categoryIDsToName[categoryIDs[name]] = name;
        });

        this.categoryIDs = categoryIDs;
        this.properties = properties;
        this.featureCount = featureCount;
        this.sample = sample;
        this.geomType = geomType;
        this.isAggregated = isAggregated;
    }
}
