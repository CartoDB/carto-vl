import { validateStaticType } from './utils';

describe('src/renderer/viz/expressions/Scaled', () => {
    describe('type', () => {
        validateStaticType('scaled', ['number'], 'number');
        validateStaticType('scaled', ['number', 'number'], 'number');
    });

    describe('error control', () => {
    });
});
