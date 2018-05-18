
import * as cartocolor from 'cartocolor';
import BaseExpression from './base';
import { hexToRgb } from './utils';

/**
 * Color palettes.
 *
 * Palettes are constants that allow to use {@link https://carto.com/carto-colors/|CARTOColors} and {@link https://github.com/axismaps/colorbrewer/|ColorBrewer} palettes easily.
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
 * @example <caption>Using a color scheme.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.ramp(s.prop('type'), s.palettes.PRISM);
 * });
 *
 * @example <caption>Using a color scheme. (String)</caption>
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
