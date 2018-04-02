import Expression from './expression';
import { checkString, getStringErrorPreface } from './utils';


const CSS_COLOR_NAMES = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgrey', 'darkgreen', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'grey', 'green', 'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgrey', 'lightgreen', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'];
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
        if (!CSS_COLOR_NAMES.includes(colorName.toLowerCase())) {
            throw new Error(getStringErrorPreface('color', 'colorName', 0) + `\nInvalid color name:  "${colorName}"`);
        }
        super({});
        this.type = 'color';
        this.name = colorName;
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
        const rgbSring = getComputedStyle(fakeDiv).color;
        document.body.removeChild(fakeDiv);

        const match = colorRegex.exec(rgbSring);
        return { r: match[1], g: match[2], b: match[3] };

    }
    // TODO eval
}
