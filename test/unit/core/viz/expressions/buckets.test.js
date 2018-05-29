import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/buckets', () => {
    describe('error control', () => {
        validateDynamicTypeErrors('buckets', ['number', 'category-array']);
        validateDynamicTypeErrors('buckets', ['category', 'number-array']);
        validateStaticTypeErrors('buckets', ['color', 'number-array']);
        validateStaticTypeErrors('buckets', ['number', 'color-array']);
    });

    describe('type', () => {
        validateStaticType('buckets', ['number', 'number-array'], 'category');
        validateStaticType('buckets', ['category', 'category-array'], 'category');
    });

    describe('eval', () => {
        // TODO
    });
});
