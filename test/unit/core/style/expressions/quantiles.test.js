import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/quantiles', () => {
    describe('error control', () => {
        validateStaticTypeErrors('quantiles', []);
        validateStaticTypeErrors('quantiles', ['float']);
        validateStaticTypeErrors('quantiles', ['float', 'category']);
        validateDynamicTypeErrors('quantiles', ['category', 2]);
        validateStaticTypeErrors('quantiles', ['color', 2]);
        validateStaticTypeErrors('quantiles', ['float', 'color']);
    });

    describe('type', () => {
        validateStaticType('quantiles', ['float-property', 2], 'category');
    });

    describe('eval', () => {
        // TODO
    });
});


