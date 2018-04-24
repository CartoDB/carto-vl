import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/ramp', () => {
    describe('error control', () => {
        validateStaticTypeErrors('ramp', []);
        validateStaticTypeErrors('ramp', ['number']);
        validateStaticTypeErrors('ramp', ['category']);
    });

    describe('type', () => {
        validateStaticType('ramp', ['number', 'palette'], 'color');
        validateStaticType('ramp', ['category', 'palette'], 'color');
        validateStaticType('ramp', ['category', 'customPalette'], 'color');
        validateStaticType('ramp', ['category', 'customPaletteNumber'], 'number');
    });

    describe('eval', () => {
        // TODO
    });
});


