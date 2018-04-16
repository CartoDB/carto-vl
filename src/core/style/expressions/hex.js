import Expression from './expression';
import { checkString, hexToRgb, getStringErrorPreface } from './utils';

/**
 *
 * Create a color from its hexadecimal description
 *
 * @param {string} hexadecimalColor - color in the form #ABC or #ABCDEF
 * @return {carto.style.expressions.hex}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *   color: s.hex('#00F');
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
            this.color = hexToRgb(hexadecimalColor);
        } catch (error) {
            throw new Error(getStringErrorPreface('hex', 'hexadecimalColor', 0) + '\nInvalid hexadecimal color string');
        }
    }
    _compile(meta) {
        super._compile(meta);
        this.inlineMaker = () => `vec4(${(this.color.r / 255).toFixed(4)}, ${(this.color.g / 255).toFixed(4)}, ${(this.color.b / 255).toFixed(4)}, ${(this.color.a).toFixed(4)})`;
    }
    eval(){
        return this.color;
    }
}
