import BaseExpression from '../../base';
import { hexToRgb } from '../../utils';
import { RGBA } from '../rgb';
import { constant } from '../../../expressions';

const MIN_CARTOCOLOR_SUBPALETTE_SIZE = 2;

/**
 * Color palettes.
 *
 * Palettes are constants that allow to use {@link https://carto.com/carto-colors/|CARTOColors} and {@link https://github.com/axismaps/colorbrewer/|ColorBrewer} palettes easily.
 * Use them with a {@link carto.expressions.ramp|ramp}.
 *
 * The following palettes are available in the namespace {@link carto.expressions|carto.expressions}.
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
 *   color: s.ramp(s.prop('type'), s.palettes.PRISM);
 * });
 *
 * @example <caption>Using a color scheme. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp($type, PRISM)
 * `);
 *
 * @name palettes
 * @memberof carto.expressions
 * @api
 */
export default class Palette extends BaseExpression {
    constructor (name, subPalettes) {
        super({});
        this.type = 'palette';
        this.childType = 'color';
        this.name = name;
        this.subPalettes = new Proxy(subPalettes, {
            get: (target, name) => {
                if (typeof name !== 'symbol' && Number.isSafeInteger(Number(name)) && Array.isArray(target[name])) {
                    return target[name].map(hexToRgb);
                }
            }
        });
        this.expressionName = name;
        this.tags = subPalettes.tags;
    }

    getColors (numCategories) {
        const colors = this._getBestSubPalette(numCategories);

        if (this.isQualitative()) {
            const othersColor = colors.pop();
            return { colors, othersColor };
        } else {
            return { colors, othersColor: null };
        }
    }

    toString () {
        return this.expressionName;
    }

    _getBestSubPalette (subPaletteIndex) {
        subPaletteIndex = subPaletteIndex <= MIN_CARTOCOLOR_SUBPALETTE_SIZE
            ? MIN_CARTOCOLOR_SUBPALETTE_SIZE
            : subPaletteIndex;
        const longestSubPalette = this.getLongestSubPalette();
        const subPalette = (subPaletteIndex < longestSubPalette.length
            ? [...this.subPalettes[subPaletteIndex]]
            : [...longestSubPalette]);
        return subPalette.map(color =>
            new RGBA(constant(color.r), constant(color.g), constant(color.b), constant(color.a))
        );
    }

    getLongestSubPalette () {
        const s = this.subPalettes;
        for (let i = 20; i >= 0; i--) {
            if (s[i]) {
                return s[i];
            }
        }
    }

    isQualitative () {
        return this.tags.includes('qualitative');
    }

    isQuantitative () {
        return this.tags.includes('quantitative');
    }
}
