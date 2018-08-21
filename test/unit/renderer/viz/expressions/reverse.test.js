import { validateStaticType, validateMaxArgumentsError, validateCompileTypeError } from './utils';

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
    describe('eval', () => {
        // TODO check reversal of the array (see blend.test.js)
    });
});
