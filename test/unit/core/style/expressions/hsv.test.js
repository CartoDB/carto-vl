import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/hsv', () => {
    describe('error control', () => {
        validateStaticTypeErrors('hsv', []);
        validateStaticTypeErrors('hsv', ['float']);
        validateStaticTypeErrors('hsv', ['float', 'category']);
        validateStaticTypeErrors('hsv', ['float', 'float', 'color']);
    });

    describe('type', () => {
        validateStaticType('hsv', ['float', 'float', 'float'], 'color');

        validateStaticType('hsv', ['category', 'float', 'float'], 'color');
        validateStaticType('hsv', ['float', 'category', 'float'], 'color');
        validateStaticType('hsv', ['float', 'float', 'category'], 'color');
        validateStaticType('hsv', ['category', 'category', 'category'], 'color');
    });

    describe('eval', () => {
        // TODO
    });
});


