import BaseExpression from '../../base';
import { number } from '../../../expressions';
import { checkMaxArguments } from '../../utils';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../../../errors/carto-validation-error';
/**
 * Return the Nth percentile of an numeric property for the entire source data.
 *
 * @param {Number} property - numeric property
 * @param {Number} percentile - Numeric expression in the [0, 100] range
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the 90th percentile of the `amount` property for the entire dataset to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_percentile: s.globalPercentile(s.prop('amount'), 90)
 *   }
 * });
 *
 * @example <caption>Assign the 90th percentile of the `amount` property for the entire dataset to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_percentile: globalPercentile($amount, 90)
 * `);
 *
 * @memberof carto.expressions
 * @name globalPercentile
 * @function
 * @api
 */
export default class GlobalPercentile extends BaseExpression {
    constructor (property, percentile) {
        checkMaxArguments(arguments, 2, 'globalPercentile');

        if (!Number.isFinite(percentile)) {
            throw new CartoValidationError(`${cvt.INCORRECT_TYPE} 'percentile' must be a fixed literal number`);
        }
        super({ _value: number(0) });
        // TODO improve type check
        this.property = property;
        this.percentile = percentile;
    }

    isFeatureDependent () {
        return false;
    }

    get value () {
        return this._value.expr;
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        this.property._bindMetadata(metadata);
        this.type = 'number';
        super.inlineMaker = inline => inline._value;
        const copy = metadata.sample.map(s => s[this.property.name]);
        copy.sort((x, y) => x - y);
        const p = this.percentile / 100;
        this._value.expr = copy[Math.floor(p * copy.length)];
    }

    _getMinimumNeededSchema () {
        return this.property._getMinimumNeededSchema();
    }
}
