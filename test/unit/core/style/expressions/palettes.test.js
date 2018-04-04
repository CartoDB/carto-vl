import {customPalette, rgb, rgba, hsv, hsva, hsl, hsla} from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/palettes', () => {
    describe('type', () => {
        // TODO
    });
    describe('custom color palettes', () => {
        it('should work with rgb/rgba children', () => {
            expect(customPalette(rgb(0,0,0), rgba(255,0,0,1)).colors).toEqual([{r:0,g:0,b:0,a:1}, {r:255, g:0, b:0, a:1}]);
        });
        it('should work with hsv/hsva children', () => {
            expect(customPalette(hsv(0,1,1), hsva(1,1,1,1)).colors).toEqual([{r:255,g:0,b:0,a:1}, {r:255, g:0, b:0, a:1}]);
        });
    });
});
