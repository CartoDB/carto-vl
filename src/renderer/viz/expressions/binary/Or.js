import { BinaryOperation, NUMBERS_TO_NUMBER } from './BinaryOperation';

import { implicitCast, checkMaxArguments } from '../utils';

/**
 * Perform a binary OR between two numeric expressions.
 * If the numbers are different from 0 or 1 this performs a [fuzzy or operation](https://en.wikipedia.org/wiki/Fuzzy_logic#Fuzzification).
 * This fuzzy behavior will allow transitions to work in a continuos, non-discrete, fashion.
 *
 * This returns a number expression where 0 means `false` and 1 means `true`.
 *
 * @param {Number} x - First value of the expression
 * @param {Number} y - Second value of the expression
 * @return {Number} Result of the expression
 *
 * @example <caption>Show only elements with price < 30 OR price > 1000.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.or(
 *     s.lt(s.prop('price'), 30),
 *     s.gt(s.prop('price'), 1000)
 *   )
 * });
 *
 * @example <caption>Show only elements with price < 30 OR price > 1000. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: $price < 30 or $price > 1000  // Equivalent to or(lt($price, 30), gt($price, 1000))
 * `);
 *
 * @memberof carto.expressions
 * @name or
 * @function
 * @api
 */
export default class Or extends BinaryOperation {
    constructor (a, b) {
        checkMaxArguments(arguments, 2);

        const signatureMethods = {
            1: (x, y) => Math.min(x + y, 1) // NUMBERS_TO_NUMBER
        };

        const glsl = (x, y) => `min(${x} + ${y}, 1.)`;

        a = implicitCast(a);
        b = implicitCast(b);

        super(a, b, signatureMethods, glsl);
        this.allowedSignature = NUMBERS_TO_NUMBER;
    }
}
