import BaseExpression from '../base';
import { checkString, hexToRgb, getStringErrorPreface, checkMaxArguments } from '../utils';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../../errors/carto-validation-error';

/**
 * Create a color from its hexadecimal description.
 *
 * @param {String} hexadecimalColor - Color in the #RGB, #RGBA, #RRGGBB or #RRGGBBAA format
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.hex('#00F');  // Equivalent to `color: '#00F'`
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: #00F  // Equivalent to hex('#00F')
 * `);
 *
 * @memberof carto.expressions
 * @name hex
 * @function
 * @api
 */
export default class Hex extends BaseExpression {
    constructor (hexadecimalColor) {
        checkMaxArguments(arguments, 1, 'hex');
        checkString('hex', 'hexadecimalColor', 0, hexadecimalColor);

        super({});
        this.type = 'color';
        try {
            this.color = hexToRgb(hexadecimalColor);
        } catch (error) {
            const preface = getStringErrorPreface('hex', 'hexadecimalColor', 0);
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} ${preface} \nInvalid hexadecimal color string`);
        }
        this.hexadecimalColor = hexadecimalColor;
        this.inlineMaker = () => `vec4(${(this.color.r / 255).toFixed(4)}, ${(this.color.g / 255).toFixed(4)}, ${(this.color.b / 255).toFixed(4)}, ${(this.color.a).toFixed(4)})`;
    }
    toString () {
        return this.hexadecimalColor;
    }
    get value () {
        return this.eval();
    }
    eval () {
        return this.color;
    }
}
