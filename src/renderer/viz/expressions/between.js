import BaseExpression from './base';
import { implicitCast, checkType, checkMaxArguments } from './utils';

/**
 * Check if a given value is contained within an inclusive range (including the limits).
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {Number} input - Numeric expression that is going to be tested against the [lowerLimit, upperLimit] range
 * @param {Number} lowerLimit - Numeric expression with the lower limit of the range
 * @param {Number} upperLimit -  Numeric expression with the upper limit of the range
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
    constructor (input, lowerLimit, upperLimit) {
        checkMaxArguments(arguments, 3, 'between');

        input = implicitCast(input);
        lowerLimit = implicitCast(lowerLimit);
        upperLimit = implicitCast(upperLimit);

        super({ input, lowerLimit, upperLimit });
        this.type = 'number';
        this.inlineMaker = inline => `((${inline.input} >= ${inline.lowerLimit} &&  ${inline.input} <= ${inline.upperLimit}) ? 1. : 0.)`;
    }
    eval (feature) {
        const input = this.input.eval(feature);
        const lower = this.lowerLimit.eval(feature);
        const upper = this.upperLimit.eval(feature);
        return (input >= lower && input <= upper) ? 1 : 0;
    }
    _bindMetadata (meta) {
        super._bindMetadata(meta);

        checkType('between', 'input', 0, 'number', this.input);
        checkType('between', 'lowerLimit', 1, 'number', this.lowerLimit);
        checkType('between', 'upperLimit', 2, 'number', this.upperLimit);
    }
}
