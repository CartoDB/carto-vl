import { validateStaticType, validateMaxArgumentsError, validateCompileTypeError } from './utils';
// import reverse from '../../../../../src/renderer/viz/expressions/reverse/reverse';
// import { palettes } from '../../../../../src/renderer/viz/expressions';

describe('src/renderer/viz/expressions/reverse', () => {
    describe('type', () => {
        validateStaticType('reverse', [[1, 2]], 'number-array');
        validateStaticType('reverse', [['A', 'B']], 'category-array');
        validateStaticType('reverse', ['color-array'], 'color-array');
        validateStaticType('reverse', ['palette'], 'palette');
    });
    describe('error control', () => {
        validateCompileTypeError('reverse', ['number']);
        validateMaxArgumentsError('reverse', [[1, 2], 0]);
        validateMaxArgumentsError('reverse', ['palette', 0]);
    });
    // describe('eval', () => {
    //     // TODO check reversal of the array (see blend.test.js)
    //     it('should reverse a palette', () => {
    //         const maxColorIndex = [palettes.PRISM.length - 1];
    //         let { 0: firstColor, maxColorIndex: lastColor } = palettes.PRISM;

    //         const reversed = reverse(palettes.PRISM).eval();
    //         expect(reversed[0]).toEqual(lastColor);
    //         expect(reversed[maxColorIndex]).toEqual(firstColor);
    //     });
    // });
});
