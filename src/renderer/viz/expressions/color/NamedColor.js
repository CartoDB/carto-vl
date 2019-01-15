import BaseExpression from '../base';
import { checkString, checkMaxArguments, getStringErrorPreface } from '../utils';
import { CSS_COLOR_NAMES } from './cssColorNames';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../../errors/carto-validation-error';

/**
 * Create a color from its name.
 *
 * @param {String} name - The name of the color
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.namedColor('blue')  // Equivalent to `color: 'blue'`
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: blue  // Equivalent to namedColor('blue')
 * `);
 *
 * @memberof carto.expressions
 * @name namedColor
 * @function
 * @api
 */
export default class NamedColor extends BaseExpression {
    constructor (colorName) {
        checkMaxArguments(arguments, 1, 'namedColor');
        checkString('namedColor', 'colorName', 0, colorName);

        if (!CSS_COLOR_NAMES.includes(colorName.toLowerCase())) {
            const preface = getStringErrorPreface('namedColor', 'colorName', 0);
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} ${preface}\nInvalid color name:  '${colorName}'`);
        }
        super({});
        this.type = 'color';
        this.name = colorName;
        this.expressionName = colorName;
        this.color = _nameToRGBA(this.name);
        this.inlineMaker = () => `vec4(${(this.color.r / 255).toFixed(4)}, ${(this.color.g / 255).toFixed(4)}, ${(this.color.b / 255).toFixed(4)}, ${(this.color.a).toFixed(4)})`;
    }

    get value () {
        return this.eval();
    }

    eval () {
        return this.color;
    }

    toString () {
        return this.expressionName;
    }
}

const nameToRGBACache = {};

function _nameToRGBA (name) {
    if (nameToRGBACache[name]) {
        return nameToRGBACache[name];
    }
    const colorRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/;
    const fakeDiv = document.createElement('div');
    fakeDiv.style.backgroundColor = name;
    document.body.appendChild(fakeDiv);
    const rgbSring = getComputedStyle(fakeDiv).backgroundColor;
    document.body.removeChild(fakeDiv);

    const match = colorRegex.exec(rgbSring);
    const color = {
        r: Number(match[1]),
        g: Number(match[2]),
        b: Number(match[3]),
        a: Number(match[4] || 1)
    };

    nameToRGBACache[name] = color;
    return color;
}
