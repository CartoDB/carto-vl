import { BinaryOperation, NUMBERS_TO_NUMBER, COLORS_TO_COLOR, IMAGES_TO_IMAGE } from './BinaryOperation';

import { checkMaxArguments } from '../utils';

/**
 * Add two numeric expressions.
 *
 * @param {Number|Color} x - First value to add
 * @param {Number|Color} y - Second value to add
 * @return {Number|Color} Result of the addition
 *
 * @example <caption>Number addition.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.add(10, 2)  // 12
 * });
 *
 * @example <caption>Number addition. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 10 + 2  // Equivalent to add(10, 2)
 * `);
 *
 * @memberof carto.expressions
 * @name add
 * @function
 * @api
 */
export default class Add extends BinaryOperation {
    constructor (a, b) {
        checkMaxArguments(arguments, 2);

        const signatureMethods = {
            1: (x, y) => x + y, // NUMBERS_TO_NUMBER
            4: _addColors // COLORS_TO_COLOR
        };

        const glsl = (x, y) => `(${x} + ${y})`;

        super(a, b, signatureMethods, glsl);
        this.allowedSignature = NUMBERS_TO_NUMBER | COLORS_TO_COLOR | IMAGES_TO_IMAGE;
    }
}

function _addColors (colorA, colorB) {
    const r = colorA.r + colorB.r < 255 ? colorA.r + colorB.r : 255;
    const g = colorA.g + colorB.g < 255 ? colorA.g + colorB.g : 255;
    const b = colorA.b + colorB.b < 255 ? colorA.b + colorB.b : 255;
    const a = colorA.a;

    return { r, g, b, a };
}
