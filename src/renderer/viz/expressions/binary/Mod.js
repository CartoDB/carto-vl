import { BinaryOperation, NUMBERS_TO_NUMBER, DATES_TO_DATES } from './BinaryOperation';

import { implicitCast, checkMaxArguments } from '../utils';

/**
 * Modulus of two numeric expressions, mod returns a numeric expression with the value of x module y. This is computed as x - y * floor(x/y).
 *
 * @param {Number} x - First value of the modulus
 * @param {Number} y - Second value of the modulus
 * @return {Number} Result of the modulus
 *
 * @example <caption>Number modulus.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.mod(10, 6)  // 4
 * });
 *
 * @example <caption>Number modulus. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 10 % 6  // Equivalent to mod(10, 6)
 * `);
 *
 * @memberof carto.expressions
 * @name mod
 * @function
 * @api
 */
export default class Mod extends BinaryOperation {
    constructor (a, b) {
        checkMaxArguments(arguments, 2);

        const signatureMethods = {
            1: (x, y) => x % y // NUMBERS_TO_NUMBER
        };

        const glsl = (x, y) => `mod(${x}, ${y})`;

        a = implicitCast(a);
        b = implicitCast(b);

        super(a, b, signatureMethods, glsl);
        this.allowedSignature = NUMBERS_TO_NUMBER | DATES_TO_DATES;
    }
}
