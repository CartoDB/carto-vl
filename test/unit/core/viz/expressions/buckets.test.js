import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/buckets', () => {
    describe('error control', () => {
        validateDynamicTypeErrors('buckets', ['number', 'category']);
        validateDynamicTypeErrors('buckets', ['category', 'number']);
        validateStaticTypeErrors('buckets', ['color', 'number']);
        validateStaticTypeErrors('buckets', ['number', 'color']);
    });

    describe('type', () => {
        validateStaticType('buckets', ['number', 'number'], 'category');
        validateStaticType('buckets', ['category', 'category'], 'category');
    });

    describe('eval', () => {
        // TODO
    });
});
