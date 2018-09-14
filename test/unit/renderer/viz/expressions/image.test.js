import { validateStaticType, validateTypeErrors, validateMaxArgumentsError } from './utils';

describe('src/renderer/viz/expressions/image', () => {
    describe('error control', () => {
        validateTypeErrors('image', [undefined]);
        validateTypeErrors('image', [-4]);
        validateTypeErrors('image', ['number']);
        validateTypeErrors('image', ['color']);
        validateTypeErrors('image', ['category-property']);
        validateTypeErrors('image', ['color-list']);
        validateMaxArgumentsError('image', ['number', 'number']);
    });

    describe('type', () => {
        validateStaticType('image', ['wadus.svg'], 'image');
    });

    describe('eval', () => {
        // TODO
    });
});
