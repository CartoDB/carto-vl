import Expression from './expression';
import { checkString, hexToRgb, getStringErrorPreface } from './utils';

/**
 *
 * Create a color from their hexadecimal description
 *
 * @param {string} hexadecimalColor - color in the form #AA88AA
 * @return {carto.style.expressions.hex}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.style.expressions;
 * const $type = s.property('type');
 * const style = new carto.Style({
 *  color: s.hex('#2233AA');
 * });
 *
 * @memberof carto.style.expressions
 * @name hex
 * @function
 * @api
 */
export default class Hex extends Expression {
    constructor(hexadecimalColor) {
        checkString('hex', 'hexadecimalColor', 0, hexadecimalColor);
        super({});
        this.type = 'color';
        try {
            this.hex = hexToRgb(hexadecimalColor);
        } catch (error) {
            throw new Error(getStringErrorPreface('hex', 'hexadecimalColor', 0) + '\nInvalid hexadecimal color string');
        }
    }
    _compile(meta) {
        super._compile(meta);
        this.inlineMaker = () => `vec4(${(this.hex.r / 255).toFixed(4)}, ${(this.hex.g / 255).toFixed(4)}, ${(this.hex.b / 255).toFixed(4)}, ${(this.hex.a / 255).toFixed(4)})`;
    }
    // TODO eval
}

