import { number } from '../../expressions';
import {
    BinaryOperation,
    NUMBERS_TO_NUMBER,
    NUMBER_AND_COLOR_TO_COLOR,
    COLORS_TO_COLOR,
    IMAGES_TO_IMAGE
} from './BinaryOperation';

import { implicitCast, checkMaxArguments } from '../utils';

/**
 * Divide two numeric expressions.
 *
 * @param {Number|Color} numerator - Numerator of the division
 * @param {Number|Color} denominator - Denominator of the division
 * @return {Number|Color} Result of the division
 *
 * @example <caption>Number division.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.div(10, 2)  // 5
 * });
 *
 * @example <caption>Number division. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 10 / 2  // Equivalent to div(10, 2)
 * `);
 *
 * @memberof carto.expressions
 * @name div
 * @function
 * @api
 */
export default class Div extends BinaryOperation {
    constructor (a, b) {
        checkMaxArguments(arguments, 2);

        if (Number.isFinite(a) && Number.isFinite(b)) {
            return number(a / b);
        }

        const signatureMethods = {
            1: (x, y) => x / y, // NUMBERS_TO_NUMBER
            2: _divNumberColor, // NUMBER_AND_COLOR_TO_COLOR
            4: _divColors // COLORS_TO_COLOR
        };

        const glsl = (x, y) => `(${x} / ${y})`;

        a = implicitCast(a);
        b = implicitCast(b);

        super(a, b, signatureMethods, glsl);
        this.allowedSignature = NUMBERS_TO_NUMBER | NUMBER_AND_COLOR_TO_COLOR | COLORS_TO_COLOR | IMAGES_TO_IMAGE;
    }
}

function _divColors (colorA, colorB) {
    return {
        r: Math.round(colorA.r / colorB.r),
        g: Math.round(colorA.g / colorB.g),
        b: Math.round(colorA.b / colorB.b),
        a: colorA.a
    };
}

function _divNumberColor (valueA, valueB) {
    const { n, color } = typeof valueA === 'number'
        ? { n: valueA, color: valueB }
        : { n: valueB, color: valueA };

    return {
        r: Math.round(color.r / n),
        g: Math.round(color.g / n),
        b: Math.round(color.b / n),
        a: color.a
    };
}
