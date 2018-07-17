
import * as cartocolor from 'cartocolor';
import Palette from './palettes/Palette';

const palettes = {};

Object.keys(cartocolor).map(name => {
    palettes[`${name.toUpperCase()}`] = new Palette(name, cartocolor[name]);
});

export default palettes;
