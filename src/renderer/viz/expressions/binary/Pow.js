import { BinaryOperation, NUMBERS_TO_NUMBER } from './BinaryOperation';
import { checkMaxArguments } from '../utils';

/**
 * Compute the base to the exponent power, return a numeric expression with the value of the first parameter raised to the power of the second.
 * The result is undefined if x<0 or if x=0 and y≤0.
 *
 * @param {Number} base - Base of the power
 * @param {Number} exponent - Exponent of the power
 * @return {Number} Result of the power
 *
 * @example <caption>Number power.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.pow(2, 3)  // 8
 * });
 *
 * @example <caption>Number power. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 2 ^ 3  // Equivalent to pow(2, 3)
 * `);
 *
 * @memberof carto.expressions
 * @name pow
 * @function
 * @api
 */
export default class Pow extends BinaryOperation {
    constructor (a, b) {
        checkMaxArguments(arguments, 2);

        const signatureMethods = {
            1: (x, y) => Math.pow(x, y) // NUMBERS_TO_NUMBER
        };

        const glsl = (x, y) => `pow(${x}, ${y})`;

        super(a, b, signatureMethods, glsl);
        this.allowedSignature = NUMBERS_TO_NUMBER;
    }
}
