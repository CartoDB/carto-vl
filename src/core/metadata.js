
// The IDENTITY metadata contains zero columns
export const IDENTITY = {
    featureCount: 0,
    columns: []
};

/*
const metadataExample = {
    featureCount: 0,
    columns: [
        {
            name: 'temp',
            type: 'number',
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
*/

export default class Metadata {
    constructor(categoryIDs, columns, featureCount, sample) {
        this.categoryIDsToName = {};
        Object.keys(categoryIDs).forEach(name=>{
            this.categoryIDsToName[categoryIDs[name]] = name;
        });

        this.categoryIDs = categoryIDs;
        this.columns = columns;
        this.featureCount = featureCount;
        this.sample = sample;
        this.geomType = '';
    }

    setGeomType(geomType) {
        this.geomType = geomType;
    }
}
