import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/hsv', () => {
    describe('error control', () => {
        validateStaticTypeErrors('hsv', []);
        validateStaticTypeErrors('hsv', ['float']);
        validateStaticTypeErrors('hsv', ['float', 'category']);
        validateStaticTypeErrors('hsv', ['float', 'float', 'color']);

        validateStaticTypeErrors('hsva', ['float', 'float', 'float']);
    });

    describe('type', () => {
        validateStaticType('hsv', ['float', 'float', 'float'], 'color');
        validateStaticType('hsv', ['category', 'float', 'float'], 'color');
        validateStaticType('hsv', ['float', 'category', 'float'], 'color');
        validateStaticType('hsv', ['float', 'float', 'category'], 'color');
        validateStaticType('hsv', ['category', 'category', 'category'], 'color');

        validateStaticType('hsva', ['float', 'float', 'float', 'float'], 'color');
        validateStaticType('hsva', ['category', 'float', 'float', 'float'], 'color');
        validateStaticType('hsva', ['float', 'category', 'float', 'float'], 'color');
        validateStaticType('hsva', ['float', 'float', 'category', 'float'], 'color');
        validateStaticType('hsva', ['category', 'category', 'category', 'float'], 'color');
    });

    describe('eval', () => {
        // TODO
    });
});


