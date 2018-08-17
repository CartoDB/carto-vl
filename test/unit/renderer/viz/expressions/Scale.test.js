import { validateStaticType } from './utils';

describe('src/renderer/viz/expressions/scale', () => {
    describe('type', () => {
        validateStaticType('scale', [1], 'number');
    });

    describe('error control', () => {
    });
});
