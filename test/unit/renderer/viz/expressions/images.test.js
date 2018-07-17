import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/renderer/viz/expressions/imageList', () => {
    describe('error control', () => {
        validateStaticTypeErrors('imageList', [undefined]);
        validateStaticTypeErrors('imageList', ['123']);
        validateStaticTypeErrors('imageList', [-4]);
        validateStaticTypeErrors('imageList', ['number']);
        validateStaticTypeErrors('imageList', ['color']);
        validateStaticTypeErrors('imageList', ['category']);
        validateStaticTypeErrors('imageList', ['color-array']);
    });

    describe('type', () => {
        validateStaticType('imageList', ['image-array'], 'image');
    });

    describe('eval', () => {
        // TODO
    });
});
