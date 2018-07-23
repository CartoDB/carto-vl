import { validateStaticType } from './utils';

describe('src/renderer/viz/expressions/zoom', () => {
    describe('type', () => {
        validateStaticType('scale', [1], 'number');
    });

    describe('error control', () => {
    });
});
