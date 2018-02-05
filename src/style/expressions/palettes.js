import * as cartocolor from 'cartocolor';

const palettes = {};
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
});

export { palettes };