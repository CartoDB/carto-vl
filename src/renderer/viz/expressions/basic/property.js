import BaseExpression from '../base';
import { checkString, checkMaxArguments } from '../utils';
import CartoValidationError, { CartoValidationErrorTypes } from '../../../../errors/carto-validation-error';
import { FP32_DESIGNATED_NULL_VALUE } from '../constants';
import { aggregationTypes } from '../../../../constants/metadata';
/**
 * Evaluates the value of a column for every row in the dataset.
 *
 * For example think about a dataset containing 3 cities: Barcelona, Paris and London.
 * The `prop('name')` will return the name of the current city for every point in the dataset.
 *
 * @param {String} name - The property in the dataset that is going to be evaluated
 * @return {Number|Category|Date}
 *
 * @example <caption>Display only cities with name different from "London".</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  filter: s.neq(s.prop('name'), 'london')
 * });
 *
 * @example <caption>Display only cities with name different from "London". (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: neq(prop('name'), 'london')
 * `);
 *
 * const viz = new carto.Viz(`
 *   filter: $name != 'london'
 * `);
 *
 * @memberof carto.expressions
 * @name prop
 * @function
 * @api
 */
export default class Property extends BaseExpression {
    constructor (name) {
        checkMaxArguments(arguments, 1, 'property');
        checkString('property', 'name', 0, name);

        if (name === '') {
            throw new CartoValidationError(
                'property(): invalid parameter, zero-length string',
                CartoValidationErrorTypes.INCORRECT_VALUE
            );
        }
        super({});
        this.name = name;
        this.expressionName = name;
        super._setGenericGLSL((childInlines, getGLSLforProperty) => getGLSLforProperty(this.name));
    }

    isFeatureDependent () {
        return true;
    }

    get value () {
        return this.eval();
    }

    get propertyName () {
        return this.name;
    }

    eval (feature) {
        if (!feature) {
            throw new CartoValidationError(
                'A property needs to be evaluated in a \'feature\'.',
                CartoValidationErrorTypes.MISSING_REQUIRED
            );
        }

        return feature[this.name] && feature[this.name] === FP32_DESIGNATED_NULL_VALUE
            ? null
            : feature[this.name];
    }

    toString () {
        return `$${this.expressionName}`;
    }

    get categories () {
        return this.type === 'category'
            ? this._metadata.properties[this.name].categories
            : undefined;
    }

    _bindMetadata (metadata) {
        const metaColumn = metadata.properties[this.name];

        if (!metaColumn) {
            throw new CartoValidationError(
                `Property '${this.name}' does not exist`,
                CartoValidationErrorTypes.MISSING_REQUIRED
            );
        }

        this._metadata = metadata;
        this.type = metaColumn.type;

        if (this.type === 'category' && this.numCategories === undefined) {
            Object.defineProperty(this, 'numCategories', {
                get: function () {
                    return metaColumn.categories.length;
                }
            });
        }
    }

    _applyToShaderSource (getGLSLforProperty) {
        return {
            preface: '',
            inline: getGLSLforProperty(this.name)
        };
    }

    _getMinimumNeededSchema () {
        const type = this._variableName
            ? aggregationTypes.UNKNOWN
            : aggregationTypes.UNAGGREGATED;

        return {
            [this.name]: [{ type }]
        };
    }
}
