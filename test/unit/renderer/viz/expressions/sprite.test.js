import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/renderer/viz/expressions/sprites', () => {
    describe('error control', () => {
        validateStaticTypeErrors('sprite', [undefined]);
        validateStaticTypeErrors('sprite', [-4]);
        validateStaticTypeErrors('sprite', ['number']);
        validateStaticTypeErrors('sprite', ['color']);
        validateStaticTypeErrors('sprite', ['category-property']);
        validateStaticTypeErrors('sprite', ['color-array']);
    });

    describe('type', () => {
        validateStaticType('sprite', ['wadus.svg'], 'sprite');
    });

    describe('eval', () => {
        // TODO
    });

});


