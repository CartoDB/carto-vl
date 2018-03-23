import { validateStaticType, validateStaticTypeErrors, validateDynamicTypeErrors } from './utils';

describe('src/core/style/expressions/opacity', () => {
    describe('error control', () => {
        validateStaticTypeErrors('opacity', []);
        validateStaticTypeErrors('opacity', ['float']);
        validateStaticTypeErrors('opacity', ['float', 'float']);
        validateDynamicTypeErrors('opacity', ['color', 'category']);
    });

    describe('type', () => {
        validateStaticType('opacity', ['color', 'float'], 'color');
    });

    describe('eval', () => {
        // TODO
    });
});


