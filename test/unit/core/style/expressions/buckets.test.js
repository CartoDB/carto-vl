import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/buckets', () => {
    describe('error control', () => {
        validateDynamicTypeErrors('buckets', ['float', 'category']);
        validateDynamicTypeErrors('buckets', ['category', 'float']);
        validateStaticTypeErrors('buckets', ['color', 'float']);
        validateStaticTypeErrors('buckets', ['float', 'color']);
    });

    describe('type', () => {
        validateStaticType('buckets', ['float', 'float'], 'category');
        validateStaticType('buckets', ['category', 'category'], 'category');
    });

    describe('eval', () => {
        // TODO
    });
});


