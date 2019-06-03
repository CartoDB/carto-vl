
import { DEFAULT_ID_PROPERTY } from '../../renderer/Metadata';

import schema from '../../renderer/schema';
import util from '../../utils/util';

import CartoRuntimeError, { CartoRuntimeErrorTypes } from '../../../src/errors/carto-runtime-error';
import CartoValidationError, { CartoValidationErrorTypes } from '../../../src/errors/carto-validation-error';

import GeoJSONMetadata from './GeoJSONMetadata';
import { dataframeGeometryType } from './GeoJSONGeometryType';

const SAMPLE_TARGET_SIZE = 1000;

export class GeoJSONMetadataBuilder {
    constructor (providedDateColumns, boundColumns) {
        this._providedDateColumns = providedDateColumns;
        this._boundColumns = boundColumns;

        this._numFields = new Set();
        this._catFields = new Set();
        this._dateFields = new Set();

        this._properties = {};
    }

    /**
     * Build a Metadata instance, including the columns required by the viz (and using
     * a sample of SAMPLE_TARGET_SIZE if required) to calculate the properties stats
     */
    buildFrom (viz, features) {
        this._addNumericColumnField(DEFAULT_ID_PROPERTY);

        const sample = [];
        const requiredColumns = this._requiredColumnsIn(viz);
        for (let i = 0; i < features.length; i++) {
            const featureProperties = features[i].properties;
            this._addPropertiesToMetadata(featureProperties, requiredColumns);
            this._sampleFeatureOnMetadata(featureProperties, sample, features.length);
        }

        this._calculateAvgForNumericFields();

        const metadata = new GeoJSONMetadata({
            properties: this._properties,
            featureCount: features.length,
            sample,
            geomType: this._dataframeGeomTypeFrom(features),
            idProperty: DEFAULT_ID_PROPERTY
        });
        metadata.setCodecs();

        return metadata;
    }

    /**
     * Return a list with the current numFields + catFields + dateFields
     */
    getCurrentFields () {
        const allFields = [...this._numFields].concat([...this._catFields]).concat([...this._dateFields]);
        return allFields;
    }

    _requiredColumnsIn (viz) {
        return new Set(Object.keys(schema.simplify(viz.getMinimumNeededSchema())));
    }

    _addPropertiesToMetadata (featureProperties, requiredColumns) {
        const keys = Object.keys(featureProperties);
        for (let j = 0, len = keys.length; j < len; j++) {
            const name = keys[j];
            if (!requiredColumns.has(name) || this._boundColumns.has(name)) {
                continue;
            }
            const value = featureProperties[name];
            this._addPropertyToMetadata(name, value);
        }
    }

    _calculateAvgForNumericFields () {
        this._numFields.forEach(name => {
            const property = this._properties[name];
            property.avg = property.sum / property.count;
        });
    }

    _dataframeGeomTypeFrom (features) {
        let geomType = '';
        if (features.length > 0) {
            // Set the geomType of the first feature to the metadata
            geomType = dataframeGeometryType(features[0].geometry.type);
        }
        return geomType;
    }
    _sampleFeatureOnMetadata (featureProperties, sample, featureCount) {
        if (featureCount > SAMPLE_TARGET_SIZE) {
            const sampling = SAMPLE_TARGET_SIZE / featureCount;
            if (Math.random() > sampling) {
                return;
            }
        }
        sample.push(featureProperties);
    }

    _addNumericPropertyToMetadata (propertyName, value) {
        if (this._catFields.has(propertyName) || this._dateFields.has(propertyName)) {
            throw new CartoValidationError(
                `Unsupported GeoJSON: the property '${propertyName}' has different types in different features.`,
                CartoValidationErrorTypes.INCORRECT_TYPE
            );
        }

        this._addNumericColumnField(propertyName);
        const property = this._properties[propertyName];
        property.min = Math.min(property.min, value);
        property.max = Math.max(property.max, value);
        property.sum += value;
    }

    _addNumericColumnField (propertyName) {
        if (!this._numFields.has(propertyName)) {
            this._numFields.add(propertyName);
            this._properties[propertyName] = {
                type: 'number',
                min: Number.POSITIVE_INFINITY,
                max: Number.NEGATIVE_INFINITY,
                avg: Number.NaN,
                sum: 0,
                count: 0
            };
        }
    }

    _addDatePropertyToMetadata (propertyName, value) {
        if (this._catFields.has(propertyName) || this._numFields.has(propertyName)) {
            throw new CartoRuntimeError(
                `Unsupported GeoJSON: the property '${propertyName}' has different types in different features.`,
                CartoRuntimeErrorTypes.NOT_SUPPORTED
            );
        }
        this._addDateColumnField(propertyName);
        const column = this._properties[propertyName];
        const dateValue = util.castDate(value);
        column.min = column.min ? util.castDate(Math.min(column.min, dateValue)) : dateValue;
        column.max = column.max ? util.castDate(Math.max(column.max, dateValue)) : dateValue;
        column.sum += value;
        column.count++;
    }

    _addDateColumnField (propertyName) {
        if (!this._dateFields.has(propertyName)) {
            this._dateFields.add(propertyName);
            this._properties[propertyName] = {
                type: 'date',
                min: null,
                max: null,
                avg: null,
                sum: 0,
                count: 0
            };
        }
    }

    _addPropertyToMetadata (propertyName, value) {
        if (this._providedDateColumns.has(propertyName)) {
            return this._addDatePropertyToMetadata(propertyName, value);
        }
        if (Number.isFinite(value)) {
            return this._addNumericPropertyToMetadata(propertyName, value);
        }
        if (value === null) {
            return;
        }
        this._addCategoryPropertyToMetadata(propertyName, value);
    }

    _addCategoryPropertyToMetadata (propertyName, value) {
        if (this._numFields.has(propertyName) || this._dateFields.has(propertyName)) {
            throw new CartoRuntimeError(
                `Unsupported GeoJSON: the property '${propertyName}' has different types in different features.`,
                CartoRuntimeErrorTypes.NOT_SUPPORTED
            );
        }
        if (!this._catFields.has(propertyName)) {
            this._catFields.add(propertyName);
            this._properties[propertyName] = {
                type: 'category',
                categories: []
            };
        }
        const property = this._properties[propertyName];
        const cat = property.categories.find(cat => cat.name === value);
        if (cat) {
            cat.frequency++;
        } else {
            property.categories.push({ name: value, frequency: 1 });
        }
    }
}
