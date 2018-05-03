
import * as cartocolor from 'cartocolor';
import BaseExpression from './base';
import { hexToRgb, checkType, implicitCast, checkExpression } from './utils';

/**
 * Color palettes.
 *
 * Palettes are constants that allow to use {@link https://carto.com/carto-colors/|cartocolors} easily.
 * Use them with a {@link carto.expressions.ramp|ramp}
 *
 * The following palettes are availiable in the namespace {@link carto.expressions.palettes|carto.expressions.palettes}.
 *
 *  ```
 *  BURG, BURGYL, REDOR, ORYEL, PEACH, PINKYL, MINT, BLUGRN, DARKMINT, EMRLD, AG_GRNYL, BLUYL, TEAL, TEALGRN,
 *  PURP, PURPOR, SUNSET, MAGENTA, SUNSETDARK, AG_SUNSET, BRWNYL, ARMYROSE, FALL, GEYSER, TEMPS, TEALROSE, TROPIC,
 *  EARTH, ANTIQUE, BOLD, PASTEL, PRISM, SAFE, VIVID, CB_YLGN, CB_YLGNBU, CB_GNBU, CB_BUGN, CB_PUBUGN, CB_PUBU,
 *  CB_BUPU, CB_RDPU, CB_PURD, CB_ORRD, CB_YLORRD, CB_YLORBR, CB_PURPLES, CB_BLUES, CB_GREENS, CB_ORANGES, CB_REDS,
 *  CB_GREYS, CB_PUOR, CB_BRBG, CB_PRGN, CB_PIYG, CB_RDBU, CB_RDGY, CB_RDYLBU, CB_SPECTRAL, CB_RDYLGN, CB_ACCENT,
 *  CB_DARK2, CB_PAIRED, CB_PASTEL1, CB_PASTEL2, CB_SET1, CB_SET2, CB_SET3
 *  ```
 *
 * @example <caption>Using a color scheme</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.ramp(s.prop('type'), s.palettes.PRISM);
 * });
 *
 * @example <caption>Using a color scheme (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: ramp($type, PRISM)
 * `);
 *
 * @name carto.expressions.palettes
 * @memberof carto.expressions
 * @api
 */
const palettes = {};

class PaletteGenerator extends BaseExpression {
    constructor(name, subPalettes) {
        super({});
        this.type = 'palette';
        this.name = name;
        this.subPalettes = new Proxy(subPalettes, {
            get: (target, name) => {
                if (Number.isFinite(Number(name)) && Array.isArray(target[name])) {
                    return target[name].map(hexToRgb);
                }
            }
        });
        this.tags = subPalettes.tags;
    }
    getLongestSubPalette() {
        const s = this.subPalettes;
        for (let i = 20; i >= 0; i--) {
            if (s[i]) {
                return s[i];
            }
        }
    }
}

export class CustomPalette extends BaseExpression {
    // colors is a list of expression of type 'color'
    constructor(elems) {
        elems = elems || [];
        elems = elems.map(implicitCast);
        if (!elems.length) {
            throw new Error('customPalette(): invalid parameters: must receive at least one argument');
        }
        const type = elems[0].type;
        if (type == undefined) {
            throw new Error('customPalette(): invalid parameters, must be formed by constant expressions, they cannot depend on feature properties');
        }
        checkType('customPalette', 'colors[0]', 0, ['color', 'number'], elems[0]);
        elems.map((color, index) => {
            checkExpression('customPalette', `colors[${index}]`, index, color);
            if (color.type == undefined) {
                throw new Error('customPalette(): invalid parameters, must be formed by constant expressions, they cannot depend on feature properties');
            }
            if (color.type != type) {
                throw new Error('customPalette(): invalid parameters, invalid argument type combination');
            }
        });
        super({});
        this.type = type == 'color' ? 'customPalette' : 'customPaletteNumber';
        try {
            if (type == 'color') {
                // in form [{ r: 0, g: 0, b: 0, a: 0 }, { r: 255, g: 255, b: 255, a: 255 }]
                this.colors = elems.map(c => c.eval());
            } else {
                this.floats = elems.map(c => c.eval());
            }
        } catch (error) {
            throw new Error('Palettes must be formed by constant expressions, they cannot depend on feature properties');
        }
    }
}

Object.keys(cartocolor).map(name => {
    palettes[`${name.toUpperCase()}`] = new PaletteGenerator(name, cartocolor[name]);
});

class Inverse extends BaseExpression{
    constructor(palette) {
        super({});
        this.type = 'palette';
        this._originalPalette = palette;
        this.tags = palette.tags;
        this.subPalettes = new Proxy(palette.subPalettes, {
            get: (target, name) => {
                if (Number.isFinite(Number(name)) && Array.isArray(target[name])) {
                    return this._reversePalette(target[name]);
                }
                return target[name];
            }
        });
    }
    getLongestSubPalette() {
        return this._reversePalette(this._originalPalette.getLongestSubPalette());
    }
    _reversePalette(palette) {
        if (this.tags.includes('qualitative')) {
            // Last color is 'others', therefore, we shouldn't change the order of that one
            const copy = [...palette];
            const others = copy.pop();
            return [...copy.reverse(), others];

        }
        return [...palette].reverse();
    }
}

export { palettes, Inverse };
