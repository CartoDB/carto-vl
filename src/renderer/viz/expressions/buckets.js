import BaseExpression from './base';
import { implicitCast, getOrdinalFromIndex, checkMaxArguments, checkType, checkFeatureIndependent } from './utils';
import { OTHERS_INDEX, OTHERS_LABEL } from './constants';
import CartoValidationError, { CartoValidationErrorTypes } from '../../../errors/carto-validation-error';
import BucketsGLSLHelper from './BucketsGLSLHelper';

/**
 * Given a property create "sub-groups" based on the given breakpoints.
 *
 * This returns a number or category expression depending on the input values. The "others" label is by default CARTO_VL_OTHERS.
 * This can be overwriten by setting the "others" label as the third parameter.
 *
 * @param {Number|Category} property - The property to be evaluated and interpolated
 * @param {Number[]|Category[]} breakpoints - Expression containing the different breakpoints.
 * @param {string} othersLabel - Custom label for "others"
 * @return {Number|Category}
 *
 * @example <caption>Display a traffic dataset in 4 colors depending on the numeric speed.</caption>
 * // Using the buckets `expression` we divide the dataset into 4 buckets according to the speed
 * // - From -inf to 29
 * // - From 30 to 79
 * // - From 80 to 119
 * // - From 120 to +inf
 * // Values lower than 0 will be in the first bucket and values higher than 120 will be in the last one.
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *    color: s.ramp(
 *      s.buckets(s.prop('speed'), [30, 80, 120]),
 *      s.palettes.PRISM
 *    )
 * });
 *
 * @example <caption>Display a traffic dataset in 4 colors depending on the numeric speed. (String)</caption>
 * // Using the buckets `expression` we divide the dataset into 4 buckets according to the speed
 * // - From -inf to 29
 * // - From 30 to 79
 * // - From 80 to 119
 * // - From 120 to +inf
 * // Values lower than 0 will be in the first bucket and values higher than 120 will be in the last one.
 * const viz = new carto.Viz(`
 *    color: ramp(buckets($speed, [30, 80, 120]), PRISM)
 * `);
 *
 * @example <caption>Display a traffic dataset is 3 colors depending on the category procesedSpeed.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(
 *     s.buckets(s.prop('procesedSpeed'), ['slow', 'medium', 'high']),
 *     s.palettes.PRISM)
 *   )
 * });
 *
 * @example <caption>Display a traffic dataset is 3 colors depending on the category procesedSpeed. (String)</caption>
 * const viz = new carto.Viz(`
 *    color: ramp(buckets($procesedSpeed, ['slow', 'medium', 'high']), PRISM)
 * `);
 *
 * @example <caption>Set custom "others" label.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(
 *     s.buckets(s.prop('procesedSpeed'), ['slow', 'medium', 'high'], 'Others'),
 *     s.palettes.PRISM)
 *   )
 * });
 *
 * @example <caption>Set custom "others" label. (String)</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz(`
 *    color: ramp(buckets($procesedSpeed, ['slow', 'medium', 'high'], 'Others'), PRISM)
 * `);
 *
 * @memberof carto.expressions
 * @name buckets
 * @function
 * @api
 */
export default class Buckets extends BaseExpression {
    constructor (input, list, othersLabel = OTHERS_LABEL) {
        checkMaxArguments(arguments, 3, 'buckets');

        input = implicitCast(input);
        list = implicitCast(list);
        othersLabel = implicitCast(othersLabel);

        let children = {
            input,
            list,
            othersLabel
        };

        super(children);
        this.numCategories = null;
        this.numCategoriesWithoutOthers = null;
        this.type = 'category';

        this._GLSLhelper = new BucketsGLSLHelper(this);
    }

    get value () {
        return this.eval();
    }

    eval (feature) {
        const v = this.input.eval(feature);
        const divisor = this.numCategoriesWithoutOthers - 1 || 1;

        if (this.input.type === 'category') {
            for (let i = 0; i < this.list.elems.length; i++) {
                if (v === this.list.elems[i].eval(feature)) {
                    return i / divisor;
                }
            }

            return OTHERS_INDEX;
        }

        for (let i = 0; i < this.list.elems.length; i++) {
            if (v < this.list.elems[i].eval(feature)) {
                return i / divisor;
            }
        }

        return 1;
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        if (this.input.type !== 'number' && this.input.type !== 'category') {
            throw new CartoValidationError(
                `buckets(): invalid first parameter type\n\t'input' type was ${this.input.type}`,
                CartoValidationErrorTypes.INCORRECT_TYPE
            );
        }

        checkType('buckets', 'list', 1, ['number-list', 'category-list'], this.list);
        checkType('buckets', 'othersLabel', 2, 'category', this.othersLabel);
        checkFeatureIndependent('buckets', 'othersLabel', 2, this.othersLabel);

        this.list.elems.map((item, index) => {
            if (this.input.type !== item.type) {
                throw new CartoValidationError(
                    `buckets(): invalid ${getOrdinalFromIndex(index + 1)} parameter type` +
                    `\n\texpected type was ${this.input.type}\n\tactual type was ${item.type}`,
                    CartoValidationErrorTypes.INCORRECT_TYPE
                );
            } else if (item.type !== 'number' && item.type !== 'category') {
                throw new CartoValidationError(
                    `buckets(): invalid ${getOrdinalFromIndex(index + 1)} parameter type\n\ttype was ${item.type}`,
                    CartoValidationErrorTypes.INCORRECT_TYPE
                );
            }
        });

        if (this.input.type === 'category') {
            const property = metadata.properties[this.input.propertyName];
            this._numDatasetCategories = property
                ? property.categories.length
                : this.list.elems.length - 1;
        }

        this.numCategories = this.list.elems.length + 1;
        this.numCategoriesWithoutOthers = this.input.type === 'category' ? this.numCategories - 1 : this.numCategories;
    }

    _applyToShaderSource (getGLSLforProperty) {
        return this._GLSLhelper.applyToShaderSource(getGLSLforProperty);
    }

    getLegendData (options) {
        const name = this.toString();
        const list = this.list.elems.map(elem => elem.value);
        const config = {
            othersLabel: options && options.othersLabel ? options.othersLabel : this.othersLabel.value
        };
        const data = this.input.type === 'number'
            ? _getLegendDataNumeric(list)
            : _getLegendDataCategory(list, this._numDatasetCategories, config);

        return { data, name };
    }
}

function _getLegendDataNumeric (list) {
    const data = [];

    for (let i = 0; i <= list.length; i++) {
        const min = i - 1 >= 0 ? list[i - 1] : Number.NEGATIVE_INFINITY;
        const max = i < list.length ? list[i] : Number.POSITIVE_INFINITY;
        const key = [min, max];
        const value = i / list.length;
        data.push({ key, value });
    }

    return data;
}

function _getLegendDataCategory (list, numDatasetCategories, config) {
    const divisor = list.length - 1 || 1;
    const data = list.map((category, index) => {
        const key = category;
        const value = index / divisor;

        return { key, value };
    });

    if (numDatasetCategories > list.length) {
        data.push({
            key: config.othersLabel,
            value: OTHERS_INDEX
        });
    }

    return data;
}
