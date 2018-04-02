import Expression from './expression';
import { checkString, hexToRgb, getStringErrorPreface } from './utils';

/**
 *
 * Create a color from its name.
 *
 * @param {string} name - Color's name
 * @return {carto.style.expressions.hex}
 *
 * @example <caption>Display Red points.</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *   color: s.color('red');
 * });
 *
 * @memberof carto.style.expressions
 * @name hex
 * @function
 * @api
 */
export default class Color extends Expression {
    constructor(colorName) {
        checkString('color', 'colorName', 0, colorName);
        super({});
        this.type = 'color';
        try {
            this.name = hexToRgb(colorName);
        } catch (error) {
            throw new Error(getStringErrorPreface('color', 'colorName', 0) + '\nInvalid named color string');
        }
    }

    _compile(meta) {
        super._compile(meta);
        const color = this._nameToRGB(this.name);
        this.inlineMaker = () => `vec4(${(color.r / 255).toFixed(4)}, ${(color.g / 255).toFixed(4)}, ${(color.b / 255).toFixed(4)}, ${(1).toFixed(4)})`;
    }

    _nameToRGB(name) {
        const colorRegex = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
        const fakeDiv = document.createElement('div');
        fakeDiv.style.color = name;
        document.body.appendChild(fakeDiv);
        const rgbSring = getComputedStyle(rgbSring).color;
        document.body.removeChild(fakeDiv);

        const match = rgbSring.exec(colorRegex);
        return { r: match[1], g: match[2], b: match[3] };

    }
    // TODO eval
}
