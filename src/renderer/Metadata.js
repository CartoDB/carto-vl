
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
        this.baseNames = {};
        this.propertyKeys.forEach(baseName => {
            const property = properties[baseName];
            if (property.aggregations) {
                Object.values(property.aggregations).forEach(propName => {
                    this.baseNames[propName] = baseName;
                });
            } else if (property.dimension) {
                this.baseNames[property.dimension.propertyName] = baseName;
            } else {
                this.baseNames[baseName] = baseName;
            }
        });
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

    propertyNames (baseName) {
        const prop = this.properties[baseName];
        if (prop.aggregations) {
            return Object.values(prop.aggregations);
        } else if (prop.dimension) {
            return [prop.dimension.propertyName];
        }
        return [baseName];
    }

    baseName (propertyName) {
        return this.baseNames[propertyName];
    }

    // convert source values to internal representation
    decode(propertyName, propertyValue) {
       throw new Error(`Undefined decode called for ${propertyName} ${propertyValue}`)
    }

    // convert internal representation to user
    encode(propertyName, propertyValue) {
        return propertyValue;
        throw new Error(`Undefined encode called for ${propertyName} ${propertyValue}`)
    }
}
