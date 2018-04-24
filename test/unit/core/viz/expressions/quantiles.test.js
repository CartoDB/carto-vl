import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/quantiles', () => {
    describe('error control', () => {
        validateStaticTypeErrors('quantiles', []);
        validateStaticTypeErrors('quantiles', ['number']);
        validateStaticTypeErrors('quantiles', ['number', 'category']);
        validateDynamicTypeErrors('quantiles', ['category', 2]);
        validateStaticTypeErrors('quantiles', ['color', 2]);
        validateStaticTypeErrors('quantiles', ['number', 'color']);
    });

    describe('type', () => {
        validateStaticType('quantiles', ['number-property', 2], 'category');
    });

    describe('eval', () => {
        // TODO
    });
});
