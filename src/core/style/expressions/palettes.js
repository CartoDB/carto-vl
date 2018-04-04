
import * as cartocolor from 'cartocolor';
import Expression from './expression';
import { hexToRgb, checkType } from './utils';

/**
 * ### Color palettes
 *
 * Palettes are constants that allow to use {@link https://carto.com/carto-colors/|cartocolors} easily.
 * Use them with a {@link carto.style.expressions.ramp|ramp}
 *
 * The following palettes are availiable:
 *  - Categorical:
 *      - PRISM
 *      - EARTH
 *  - Numeric
 *      - ...
 *
 * @api
 * @name carto.style.expressions.palettes
 * @memberof carto.style.expressions
 *
 * @example <caption> Using a color scheme </caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *  filter: s.ramp(s.property('type'), s.palettes.PRISM);
 * });
 */
const palettes = {};

class PaletteGenerator extends Expression {
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

export class CustomPalette extends Expression {
    // colors is a list of expression of type 'color'
    constructor(...colors) {
        colors.map((color, index) => checkType('CustomPalette', `color[${index}`, index, 'color', color));
        super({});
        this.type = 'customPalette';
        try {
            // in form [{ r: 0, g: 0, b: 0, a: 0 }, { r: 255, g: 255, b: 255, a: 255 }]            
            this.colors = colors.map(c => c.eval());
        } catch (error) {
            throw new Error('Palettes must be formed by constant colors, they cannot depend on feature properties');
        }
    }
}

Object.keys(cartocolor).map(name => {
    palettes[`${name.toLowerCase()}`] = new PaletteGenerator(name, cartocolor[name]);
});

class Inverse {
    constructor(palette) {
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
