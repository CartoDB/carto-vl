import * as cartocolor from 'cartocolor';

class PaletteGenerator {
    constructor(name, subPalettes) {
        this.type = 'paletteGenerator';
        this.name = name;
        this.subPalettes = subPalettes;
        this.tags = subPalettes.tags;
    }
    getLongestSubPalette(){
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

export { palettes };