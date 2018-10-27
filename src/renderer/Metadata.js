import IdentityCodec from '../codecs/Identity';
import { FP32_DESIGNATED_NULL_VALUE } from './viz/expressions/constants';

// The IDENTITY metadata contains zero properties
export const IDENTITY = {
    properties: {}
};

const STATS = ['min', 'max', 'avg', 'sum', 'mode'];

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
                if (property.dimension.range) {
                    property.dimension.range.forEach(rangePropertyName => {
                        this._addProperty(baseName, rangePropertyName, false);
                    });
                    // add source property too, for stats
                    this._addProperty(baseName, property.dimension.propertyName);
                } else {
                    this._addProperty(baseName, property.dimension.propertyName);
                }
            } else {
                this._addProperty(baseName, baseName);
            }
        });
    }

    _addProperty (baseName, propertyName, addToKeys = true) {
        this.baseNames[propertyName] = baseName;
        if (addToKeys) {
            this.propertyKeys.push(propertyName);
        }
    }

    categorizeString (propertyName, category, init = false) {
        if (category === undefined) {
            category = null;
        }
        if (this.categoryToID.has(category)) {
            return this.categoryToID.get(category);
        }
        if (!init && category !== null) {
            this.properties[propertyName].categories.push({
                name: category,
                frequency: Number.NaN
            });
        }
        const categoryId = category === null ? FP32_DESIGNATED_NULL_VALUE : this.numCategories;
        this.categoryToID.set(category, categoryId);
        this.IDToCategory.set(categoryId, category);
        this.numCategories++;
        return categoryId;
    }

    propertyNames (baseName) {
        // TODO: aggregations and dimensions are specific of Windshaft;
        // move this method there (and baseNames too?) and leave a
        // generic method here returning [baseName]
        const prop = this.properties[baseName];
        if (prop.aggregations) {
            return Object.values(prop.aggregations);
        } else if (prop.dimension) {
            if (prop.dimension.range) {
                return prop.dimension.range;
            }
            return [prop.dimension.propertyName];
        }
        return [baseName];
    }

    // dataframe properties into which a single source property is decoded
    // TODO: rename as encodedProperties
    decodedProperties (propertyName) {
        return [propertyName];
    }

    // property of the data origin (dataset, query) from which
    // a (dataframe) property is derived
    // TODO: move to windshaft metadata
    baseName (propertyName) {
        return this.baseNames[propertyName];
    }

    // property transferred from the source from which
    // a (dataframe) property it so be computed
    // TODO: move to windshaft metadata
    sourcePropertyName (propertyName) {
        const baseName = this.baseName(propertyName);
        const dimension = this.properties[baseName].dimension;
        if (dimension && dimension.range) {
            return dimension.propertyName;
        }
        return propertyName;
    }

    _filterStats (keys) {
        return keys.filter(key => STATS.includes(key));
    }

    stats (propertyName) {
        return this.properties[propertyName];
    }

    codec (propertyName) {
        // FIXME: default identity code for debugging purposes
        return this.properties[this.baseName(propertyName)].codec || new IdentityCodec();
    }
}
