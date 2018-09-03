import { validateStaticType, validateTypeErrors } from './utils';

describe('src/renderer/viz/expressions/zoomrange', () => {
    describe('type', () => {
        validateStaticType('zoomrange', [[7, 10]], 'number');
    });

    describe('error control', () => {
        validateTypeErrors('zoomrange', []);
        validateTypeErrors('zoomrange', [0]);
    });
});
