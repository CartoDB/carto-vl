import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/hsl', () => {
    describe('error control', () => {
        validateStaticTypeErrors('hsl', []);
        validateStaticTypeErrors('hsl', ['float']);
        validateStaticTypeErrors('hsl', ['float', 'category']);
        validateStaticTypeErrors('hsl', ['float', 'float', 'color']);

        validateStaticTypeErrors('hsla', ['float', 'float', 'float']);
    });

    describe('type', () => {
        validateStaticType('hsl', ['float', 'float', 'float'], 'color');
        validateStaticType('hsl', ['category', 'float', 'float'], 'color');
        validateStaticType('hsl', ['float', 'category', 'float'], 'color');
        validateStaticType('hsl', ['float', 'float', 'category'], 'color');
        validateStaticType('hsl', ['category', 'category', 'category'], 'color');

        validateStaticType('hsla', ['float', 'float', 'float', 'float'], 'color');
        validateStaticType('hsla', ['category', 'float', 'float', 'float'], 'color');
        validateStaticType('hsla', ['float', 'category', 'float', 'float'], 'color');
        validateStaticType('hsla', ['float', 'float', 'category', 'float'], 'color');
        validateStaticType('hsla', ['category', 'category', 'category', 'float'], 'color');
    });

    describe('eval', () => {
        // TODO
    });
});
