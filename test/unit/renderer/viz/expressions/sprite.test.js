import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/renderer/viz/expressions/images', () => {
    describe('error control', () => {
        validateStaticTypeErrors('image', [undefined]);
        validateStaticTypeErrors('image', [-4]);
        validateStaticTypeErrors('image', ['number']);
        validateStaticTypeErrors('image', ['color']);
        validateStaticTypeErrors('image', ['category-property']);
        validateStaticTypeErrors('image', ['color-array']);
    });

    describe('type', () => {
        validateStaticType('image', ['wadus.svg'], 'image');
    });

    describe('eval', () => {
        // TODO
    });

});


