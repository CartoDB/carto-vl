import * as cartocolor from 'cartocolor';

class PaletteGenerator {
    constructor(name, subPalettes) {
        this.type = 'paletteGenerator';
        this.name = name;
        this.subPalettes = subPalettes;
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

const palettes = {};

Object.keys(cartocolor).map(name => {
    palettes[`${name.toLowerCase()}`] = new PaletteGenerator(name, cartocolor[name]);
});

class Inverse {
    constructor(palette) {
        this.type = 'paletteGenerator';
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
