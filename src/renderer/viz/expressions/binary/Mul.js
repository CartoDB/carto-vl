import {
    BinaryOperation,
    NUMBERS_TO_NUMBER,
    NUMBER_AND_COLOR_TO_COLOR,
    COLORS_TO_COLOR,
    IMAGES_TO_IMAGE
} from './BinaryOperation';

import { checkMaxArguments } from '../utils';

/**
 * Multiply two numeric expressions.
 *
 * @param {Number|Color} x - First value to multiply
 * @param {Number|Color} y - Second value to multiply
 * @return {Number|Color} Result of the multiplication
 *
 * @example <caption>Number multiplication.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.mul(5, 5)  // 25
 * });
 *
 * @example <caption>Number multiplication. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 5 * 5  // Equivalent to mul(5, 5)
 * `);
 *
 * @memberof carto.expressions
 * @name mul
 * @function
 * @api
 */
export default class Mul extends BinaryOperation {
    constructor (a, b) {
        checkMaxArguments(arguments, 2);

        const signatureMethods = {
            1: (x, y) => x * y, // NUMBERS_TO_NUMBER
            2: _mulNumberColor, // NUMBER_AND_COLOR_TO_COLOR
            4: _mulColors // COLORS_TO_COLOR
        };

        const glsl = (x, y) => `(${x} * ${y})`;

        super(a, b, signatureMethods, glsl);
        this.allowedSignature = NUMBERS_TO_NUMBER | NUMBER_AND_COLOR_TO_COLOR | COLORS_TO_COLOR | IMAGES_TO_IMAGE;
    }
}

function _mulColors (colorA, colorB) {
    return {
        r: Math.round(colorA.r * colorB.r / 255),
        g: Math.round(colorA.g * colorB.g / 255),
        b: Math.round(colorA.b * colorB.b / 255),
        a: colorA.a
    };
}

function _mulNumberColor (valueA, valueB) {
    const { n, color } = typeof valueA === 'number'
        ? { n: valueA, color: valueB }
        : { n: valueB, color: valueA };

    return {
        r: Math.round(n * color.r / 255),
        g: Math.round(n * color.g / 255),
        b: Math.round(n * color.b / 255),
        a: color.a
    };
}
