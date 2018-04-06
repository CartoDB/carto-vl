import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/ramp', () => {
    describe('error control', () => {
        validateStaticTypeErrors('ramp', []);
        validateStaticTypeErrors('ramp', ['float']);
        validateStaticTypeErrors('ramp', ['category']);
    });

    describe('type', () => {
        validateStaticType('ramp', ['float', 'palette'], 'color');
        validateStaticType('ramp', ['category', 'palette'], 'color');
        validateStaticType('ramp', ['category', 'customPalette'], 'color');
        validateStaticType('ramp', ['category', 'customPaletteFloat'], 'float');
    });

    describe('eval', () => {
        // TODO
    });
});


