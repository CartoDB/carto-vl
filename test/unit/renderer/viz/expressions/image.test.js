import { validateStaticType, validateStaticTypeErrors, validateMaxArgumentsError } from './utils';

describe('src/renderer/viz/expressions/image', () => {
    describe('error control', () => {
        validateStaticTypeErrors('image', [undefined]);
        validateStaticTypeErrors('image', [-4]);
        validateStaticTypeErrors('image', ['number']);
        validateStaticTypeErrors('image', ['color']);
        validateStaticTypeErrors('image', ['category-property']);
        validateStaticTypeErrors('image', ['color-array']);
        validateMaxArgumentsError('image', ['number', 'number']);
    });

    describe('type', () => {
        validateStaticType('image', ['wadus.svg'], 'image');
    });

    describe('eval', () => {
        // TODO
    });
});
