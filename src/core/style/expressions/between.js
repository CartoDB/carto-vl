import Expression from './expression';

/**
 *
 * Check if a given value is contained within an inclusive range (including the limits).
 *
 * @param {carto.style.expressions.expression | number} value - numeric expression that is going to be tested against the [lowerLimit, upperLimit] range
 * @param {carto.style.expressions.expression | number} lowerLimit - numeric expression with the lower limit of the range
 * @param {carto.style.expressions.expression | number} upperLimit -  numeric expression with the upper limit of the range
 * @return {carto.style.expressions.expression} numeric expression with the result of the check: 1 if value is inside the range, 0 otherwise
 *
 * @example <caption>Display only cities where the population density is within the [50,100] range.</caption>
 * const s = carto.style.expressions;
 * const $dn = s.property('populationDensity');
 * const style = new carto.Style({
 *  filter: s.between($dn, 50, 100);
 * });
 *
 * @memberof carto.style.expressions
 * @name in
 * @function
 * @api
 */
export default class Between extends Expression {
    constructor(value, lowerLimit, upperLimit) {
        super({ value, lowerLimit, upperLimit });
        this.type = 'float';
    }

    _compile(meta) {
        super._compile(meta);
        if (this.value.type != 'float') {
            throw new Error('Between() can only be performed to float properties');
        }
        if (this.lowerLimit.type != 'float') {
            throw new Error('Between() can only be performed to float properties');
        }
        if (this.upperLimit.type != 'float') {
            throw new Error('Between() can only be performed to float properties');
        }
        this.inlineMaker = inline => `((${inline.value} >= ${inline.lowerLimit} &&  ${inline.value} <= ${inline.upperLimit}) ? 1. : 0.)`;
    }

    eval(feature) {
        const value = this.value.eval(feature);
        const lower = this.lowerLimit.eval(feature);
        const upper = this.upperLimit.eval(feature);
        return (value >= lower && value <= upper) ? 1 : 0;
    }
}
