import { customPalette, rgb, rgba, hsv, hsva } from '../../../../../src/core/viz/functions';
import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/palettes', () => {
    describe('error control', () => {
        validateStaticTypeErrors('customPalette', []);
        validateStaticTypeErrors('customPalette', ['number-property']);
        validateStaticTypeErrors('customPalette', ['category']);
    });

    describe('type', () => {
        validateStaticType('customPalette', [rgb(0, 0, 0), rgb(0, 0, 0)], 'customPalette');
        validateStaticType('customPalette', [10, 20], 'customPaletteNumber');
    });
    describe('custom color palettes', () => {
        it('should work with rgb/rgba children', () => {
            expect(customPalette([rgb(0, 0, 0), rgba(255, 0, 0, 1)]).colors).toEqual([{ r: 0, g: 0, b: 0, a: 1 }, { r: 255, g: 0, b: 0, a: 1 }]);
        });
        it('should work with hsv/hsva children', () => {
            expect(customPalette([hsv(0, 1, 1), hsva(1, 1, 1, 1)]).colors).toEqual([{ r: 255, g: 0, b: 0, a: 1 }, { r: 255, g: 0, b: 0, a: 1 }]);
        });
        it('should work with floats', () => {
            expect(customPalette([10, 20, 30]).floats).toEqual([10, 20, 30]);
        });
    });
});
