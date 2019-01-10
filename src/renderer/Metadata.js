import CartoRuntimeError from '../errors/carto-runtime-error';
import IdentityCodec from '../codecs/Identity';
import { FP32_DESIGNATED_NULL_VALUE } from './viz/expressions/constants';

const DEFAULT_MVT_EXTENT = 4096;

// The IDENTITY metadata contains zero properties
export const IDENTITY = {
    properties: {}
};

export default class Metadata {
    constructor ({ properties, featureCount, sample, geomType, isAggregated, idProperty, extent } = { properties: {} }) {
        this.properties = properties;
        this.featureCount = featureCount;
        this.sample = sample;
        this.geomType = geomType;
        this.isAggregated = isAggregated;
        this.idProperty = idProperty || 'cartodb_id';

        this.categoryToID = new Map();
        this.IDToCategory = new Map();
        this.numCategories = 0;
        this.extent = extent || DEFAULT_MVT_EXTENT;

        Object.values(properties).map(property => {
            property.categories = property.categories || [];
            property.categories.map(category => this.categorizeString(property, category.name, true));
        });

        this.propertyKeys = Object.keys(properties);
    }

    setCodecs () {
        throw new CartoRuntimeError('You must call "setCodecs" once you have determined the proper subclass');
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

    // dataframe properties into which a single source property is decoded
    // TODO: rename as encodedProperties or dataframeProperties
    decodedProperties (propertyName) {
        return [propertyName];
    }

    // property of the data origin (dataset, query) from which
    // a (source or dataframe) property is derived
    baseName (propertyName) {
        return propertyName;
    }

    // property transferred from the source from which
    // a (source or dataframe) property it so be computed
    // TODO: move to windshaft metadata
    sourcePropertyName (propertyName) {
        return propertyName;
    }

    stats (propertyName) {
        return this.properties[propertyName];
    }

    codec (propertyName) {
        // FIXME: default identity code for debugging purposes
        return this.properties[this.baseName(propertyName)].codec || new IdentityCodec();
    }
}
