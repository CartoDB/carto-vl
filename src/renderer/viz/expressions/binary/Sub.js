import { BinaryOperation, NUMBERS_TO_NUMBER, COLORS_TO_COLOR, IMAGES_TO_IMAGE } from './BinaryOperation';

import { checkMaxArguments } from '../utils';

/**
 * Substract two numeric expressions.
 *
 * @param {Number|Color} minuend - The minuend of the subtraction
 * @param {Number|Color} subtrahend - The subtrahend of the subtraction
 * @return {Number|Color} Result of the substraction
 *
 * @example <caption>Number subtraction.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.sub(10, 2)  // 8
 * });
 *
 * @example <caption>Number subtraction. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 10 - 2  // Equivalent to sub(10, 2)
 * `);
 *
 * @memberof carto.expressions
 * @name sub
 * @function
 * @api
 */
export default class Sub extends BinaryOperation {
    constructor (a, b) {
        checkMaxArguments(arguments, 2);

        const signatureMethods = {
            1: (x, y) => x - y, // NUMBERS_TO_NUMBER
            4: _subColors // COLORS_TO_COLOR
        };

        const glsl = (x, y) => `(${x} - ${y})`;

        super(a, b, signatureMethods, glsl);
        this.allowedSignature = NUMBERS_TO_NUMBER | COLORS_TO_COLOR | IMAGES_TO_IMAGE;
    }
}

function _subColors (colorA, colorB) {
    const r = colorA.r - colorB.r > 0 ? colorA.r - colorB.r : 0;
    const g = colorA.g - colorB.g > 0 ? colorA.g - colorB.g : 0;
    const b = colorA.b - colorB.b > 0 ? colorA.b - colorB.b : 0;
    const a = colorA.a;

    return { r, g, b, a };
}
