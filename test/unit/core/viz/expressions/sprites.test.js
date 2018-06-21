import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/sprites', () => {
    describe('error control', () => {
        validateStaticTypeErrors('sprites', [undefined]);
        validateStaticTypeErrors('sprites', ['123']);
        validateStaticTypeErrors('sprites', [-4]);
        validateStaticTypeErrors('sprites', ['number']);
        validateStaticTypeErrors('sprites', ['color']);
        validateStaticTypeErrors('sprites', ['category']);
        validateStaticTypeErrors('sprites', ['color-array']);
    });

    describe('type', () => {
        validateStaticType('sprites', ['sprite-array'], 'sprite');
    });

    describe('eval', () => {
        // TODO
    });

});


