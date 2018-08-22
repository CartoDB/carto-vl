import BaseExpression from '../base';
import { checkString, hexToRgb, getStringErrorPreface, checkMaxArguments } from '../utils';

/**
 * Create a color from its hexadecimal description.
 *
 * @param {string} hexadecimalColor - Color in the #RGB, #RGBA, #RRGGBB or #RRGGBBAA format
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
            throw new Error(getStringErrorPreface('hex', 'hexadecimalColor', 0) + '\nInvalid hexadecimal color string');
        }
        this.inlineMaker = () => `vec4(${(this.color.r / 255).toFixed(4)}, ${(this.color.g / 255).toFixed(4)}, ${(this.color.b / 255).toFixed(4)}, ${(this.color.a).toFixed(4)})`;
    }
    get value () {
        return this.eval();
    }
    eval () {
        return this.color;
    }
}
