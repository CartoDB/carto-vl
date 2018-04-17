import Expression from './expression';
import { checkString, getStringErrorPreface } from './utils';


export const CSS_COLOR_NAMES = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgrey', 'darkgreen', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'grey', 'green', 'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgrey', 'lightgreen', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'];

/**
 *
 * Create a color from its name.
 *
 * @param {string} name - Color's name
 * @return {carto.expressions.hex}
 *
 * @example <caption>Display Red points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.namedColor('red');
 * });
 *
 * @memberof carto.expressions
 * @name namedColor
 * @function
 * @api
 */
export class NamedColor extends Expression {
    constructor(colorName) {
        checkString('namedColor', 'colorName', 0, colorName);
        if (!CSS_COLOR_NAMES.includes(colorName.toLowerCase())) {
            throw new Error(getStringErrorPreface('namedColor', 'colorName', 0) + `\nInvalid color name:  "${colorName}"`);
        }
        super({});
        this.type = 'color';
        this.name = colorName;
        this.color = this._nameToRGB(this.name);
    }

    _compile(meta) {
        super._compile(meta);
        this.inlineMaker = () => `vec4(${(this.color.r / 255).toFixed(4)}, ${(this.color.g / 255).toFixed(4)}, ${(this.color.b / 255).toFixed(4)}, ${(1).toFixed(4)})`;
    }

    _nameToRGB(name) {
        const colorRegex = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
        const fakeDiv = document.createElement('div');
        fakeDiv.style.color = name;
        document.body.appendChild(fakeDiv);
        const rgbSring = getComputedStyle(fakeDiv).color;
        document.body.removeChild(fakeDiv);

        const match = colorRegex.exec(rgbSring);
        return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: 1 };

    }
    eval(){
        return this.color;
    }
}

export default NamedColor;
