import { validateStaticType } from './utils';

describe('src/renderer/viz/expressions/Scaled', () => {
    describe('type', () => {
        validateStaticType('scaled', [1], 'number');
    });

    describe('error control', () => {
    });
});
