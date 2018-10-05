
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

        this.propertyKeys = [];
        this.baseNames = {};
        Object.keys(this.properties).forEach(baseName => {
            const property = properties[baseName];
            if (property.aggregations) {
                Object.values(property.aggregations).forEach(propName => {
                    this._addProperty(baseName, propName);
                });
            } else if (property.dimension) {
                if (property.dimension.modes) {
                    Object.values(property.dimension.modes).forEach(modePropertyName => {
                        this._addProperty(baseName, modePropertyName);
                    });
                } else {
                    this._addProperty(baseName, property.dimension.propertyName);
                }
            } else {
                this._addProperty(baseName, baseName);
            }
        });
    }

    _addProperty(baseName, propertyName) {
        this.baseNames[propertyName] = baseName;
        this.propertyKeys.push(propertyName);
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
        // TODO: aggregations and dimensions are specific of Windshaft;
        // move this method there (and baseNames too?) and leave a
        // generic method here returning [baseName]
        const prop = this.properties[baseName];
        if (prop.aggregations) {
            return Object.values(prop.aggregations);
        } else if (prop.dimension) {
            if (prop.dimension.modes) {
                return Object.values(prop.dimension.modes);
            }
            return [prop.dimension.propertyName];
        }
        return [baseName];
    }

    baseName (propertyName) {
        return this.baseNames[propertyName];
    }

    sourcePropertyName (propertyName) {
        const baseName = this.baseName(propertyName);
        const dimension = this.properties[baseName].dimension;
        if (dimension && dimension.modes) {
            return dimension.propertyName;
        }
        return propertyName;
    }

    // convert source values to internal representation
    decode (propertyName, propertyValue) {
        throw new Error(`Undefined decode called for ${propertyName} ${propertyValue}`);
    }

    // convert internal representation to user
    encode (propertyName, propertyValue) {
        throw new Error(`Undefined encode called for ${propertyName} ${propertyValue}`);
    }

    stats (propertyName) {
        return this.properties[propertyName];
    }
}
