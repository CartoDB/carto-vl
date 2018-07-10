import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/renderer/viz/expressions/images', () => {
    describe('error control', () => {
        validateStaticTypeErrors('images', [undefined]);
        validateStaticTypeErrors('images', ['123']);
        validateStaticTypeErrors('images', [-4]);
        validateStaticTypeErrors('images', ['number']);
        validateStaticTypeErrors('images', ['color']);
        validateStaticTypeErrors('images', ['category']);
        validateStaticTypeErrors('images', ['color-array']);
    });

    describe('type', () => {
        validateStaticType('images', ['image-array'], 'image');
    });

    describe('eval', () => {
        // TODO
    });

});


