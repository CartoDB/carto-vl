import * as cartocolor from 'cartocolor';


class PaletteGenerator {
    constructor(name, subPalettes) {
        this.type = 'paletteGenerator';
        this.name = name;
        this.subPalettes = subPalettes;
    }
}


const palettes = {};
/*
Object.keys(cartocolor).map(name => {
    const s = cartocolor[name];
    var defaultFound = false;
    for (let i = 20; i >= 0; i--) {
        if (s[i]) {
            if (!defaultFound) {
                palettes[name.toLowerCase()] = () => s[i];
                defaultFound = true;
            }
            palettes[`${name.toLowerCase()}_${i}`] = () => s[i];
        }
    }
});*/

Object.keys(cartocolor).map(name => {
    palettes[`${name.toLowerCase()}`] = new PaletteGenerator(name, cartocolor[name]);
});

export { palettes };