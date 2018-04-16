import Expression from './expression';
import { implicitCast, checkLooseType, checkType } from './utils';

/**
 *
 * Check if a given value is contained within an inclusive range (including the limits).
 *
 * @param {carto.style.expressions.Expression | number} value - numeric expression that is going to be tested against the [lowerLimit, upperLimit] range
 * @param {carto.style.expressions.Expression | number} lowerLimit - numeric expression with the lower limit of the range
 * @param {carto.style.expressions.Expression | number} upperLimit -  numeric expression with the upper limit of the range
 * @return {carto.style.expressions.Expression} numeric expression with the result of the check
 *
 * @example <caption>Display only cities where the population density is within the [50,100] range.</caption>
 * const s = carto.style.expressions;
 * const $dn = s.property('populationDensity');
 * const style = new carto.Viz({
 *  filter: s.between($dn, 50, 100);
 * });
 *
 * @memberof carto.style.expressions
 * @name between
 * @function
 * @api
 */
export default class Between extends Expression {
    constructor(value, lowerLimit, upperLimit) {
        value = implicitCast(value);
        lowerLimit = implicitCast(lowerLimit);
        upperLimit = implicitCast(upperLimit);

        checkLooseType('between', 'value', 0, 'float', value);
        checkLooseType('between', 'lowerLimit', 1, 'float', lowerLimit);
        checkLooseType('between', 'upperLimit', 2, 'float', upperLimit);

        super({ value, lowerLimit, upperLimit });
        this.type = 'float';
    }

    _compile(meta) {
        super._compile(meta);

        checkType('between', 'value', 0, 'float', this.value);
        checkType('between', 'lowerLimit', 1, 'float', this.lowerLimit);
        checkType('between', 'upperLimit', 2, 'float', this.upperLimit);

        this.inlineMaker = inline => `((${inline.value} >= ${inline.lowerLimit} &&  ${inline.value} <= ${inline.upperLimit}) ? 1. : 0.)`;
    }

    eval(feature) {
        const value = this.value.eval(feature);
        const lower = this.lowerLimit.eval(feature);
        const upper = this.upperLimit.eval(feature);
        return (value >= lower && value <= upper) ? 1 : 0;
    }
}
