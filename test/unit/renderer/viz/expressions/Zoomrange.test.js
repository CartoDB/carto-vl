import { validateStaticType, validateCompileTypeError } from './utils';

describe('src/renderer/viz/expressions/zoomrange', () => {
    describe('type', () => {
        validateStaticType('zoomrange', [[7, 10]], 'number');
    });

    describe('error control', () => {
        validateCompileTypeError('zoomrange', []);
        validateCompileTypeError('zoomrange', [0]);
    });
});
