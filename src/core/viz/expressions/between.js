import BaseExpression from './base';
import { implicitCast, checkLooseType, checkType } from './utils';

/**
 * Check if a given value is contained within an inclusive range (including the limits).
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {Number|number} value - Numeric expression that is going to be tested against the [lowerLimit, upperLimit] range
 * @param {Number|number} lowerLimit - Numeric expression with the lower limit of the range
 * @param {Number|number} upperLimit -  Numeric expression with the upper limit of the range
 * @return {Number} Numeric expression with the result of the check
 *
 * @example <caption>Display only cities where the population density is within the [50,100] range.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.between(s.prop('dn'), 50, 100);
 * });
 *
 * @example <caption>Display only cities where the population density is within the [50,100] range. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: between($dn, 50, 100)
 * `);
 *
 * @memberof carto.expressions
 * @name between
 * @function
 * @api
 */
export default class Between extends BaseExpression {
    constructor(value, lowerLimit, upperLimit) {
        value = implicitCast(value);
        lowerLimit = implicitCast(lowerLimit);
        upperLimit = implicitCast(upperLimit);

        checkLooseType('between', 'value', 0, 'number', value);
        checkLooseType('between', 'lowerLimit', 1, 'number', lowerLimit);
        checkLooseType('between', 'upperLimit', 2, 'number', upperLimit);

        super({ value, lowerLimit, upperLimit });
        this.type = 'number';
    }
    eval(feature) {
        const value = this.value.eval(feature);
        const lower = this.lowerLimit.eval(feature);
        const upper = this.upperLimit.eval(feature);
        return (value >= lower && value <= upper) ? 1 : 0;
    }
    _compile(meta) {
        super._compile(meta);

        checkType('between', 'value', 0, 'number', this.value);
        checkType('between', 'lowerLimit', 1, 'number', this.lowerLimit);
        checkType('between', 'upperLimit', 2, 'number', this.upperLimit);

        this.inlineMaker = inline => `((${inline.value} >= ${inline.lowerLimit} &&  ${inline.value} <= ${inline.upperLimit}) ? 1. : 0.)`;
    }
}
