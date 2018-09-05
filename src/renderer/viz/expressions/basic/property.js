import BaseExpression from '../base';
import { checkString, checkMaxArguments } from '../utils';
import CartoValidationError from '../../../../errors/carto-validation-error';

/**
 * Evaluates the value of a column for every row in the dataset.
 *
 * For example think about a dataset containing 3 cities: Barcelona, Paris and London.
 * The `prop('name')` will return the name of the current city for every point in the dataset.
 *
 * @param {string} name - The property in the dataset that is going to be evaluated
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
            throw new CartoValidationError('expressions', 'propertyEmptyName');
        }
        super({});
        this.name = name;
        super._setGenericGLSL((childInlines, getGLSLforProperty) => getGLSLforProperty(this.name));
    }

    isFeatureDependent () {
        return true;
    }

    get value () {
        return this.eval();
    }

    eval (feature) {
        if (!feature) {
            throw new CartoValidationError('expressions', 'propertyNoFeature');
        }
        return feature[this.name];
    }

    _bindMetadata (meta) {
        const metaColumn = meta.properties[this.name];
        if (!metaColumn) {
            throw new CartoValidationError('expressions', `propertyNotExists[${this.name}]`);
        }
        this.type = metaColumn.type;

        if (this.type === 'category' && this.numCategories === undefined) {
            Object.defineProperty(this, 'numCategories', { get: function () { return metaColumn.categories.length; } });
        }
    }

    _applyToShaderSource (getGLSLforProperty) {
        return {
            preface: '',
            inline: getGLSLforProperty(this.name)
        };
    }

    _getMinimumNeededSchema () {
        return {
            [this.name]: [{
                type: 'unaggregated'
            }]
        };
    }
}
