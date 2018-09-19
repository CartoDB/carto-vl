
// The IDENTITY metadata contains zero properties
export const IDENTITY = {
    properties: {}
};

export default class Metadata {
    constructor ({ properties, featureCount, sample, geomType, isAggregated, idProperty } = { properties: {} }) {
        this.properties = properties;
        this.featureCount = featureCount;
        this.sample = sample;
        this.geomType = geomType;
        this.isAggregated = isAggregated;
        this.idProperty = idProperty || 'cartodb_id';

        this.categoryToID = new Map();
        this.IDToCategory = new Map();
        this.numCategories = 0;

        Object.values(properties).map(property => {
            property.categories = property.categories || [];
            property.categories.map(category => this.categorizeString(property, category.name, true));
        });

        this.propertyKeys = Object.keys(this.properties);
    }

    categorizeString (propertyName, category, init = false) {
        if (category === undefined) {
            category = null;
        }
        if (this.categoryToID.has(category)) {
            return this.categoryToID.get(category);
        }
        if (!init) {
            this.properties[propertyName].categories.push({
                name: category,
                frequency: Number.NaN
            });
        }
        this.categoryToID.set(category, this.numCategories);
        this.IDToCategory.set(this.numCategories, category);
        this.numCategories++;
        return this.numCategories - 1;
    }

    propertyNames (propertyName) {
        const prop = this.properties[propertyName];
        if (prop.aggregations) {
            return Object.keys(prop.aggregations).map(fn => prop.aggregations[fn]);
        }
        return [propertyName];
    }
}
