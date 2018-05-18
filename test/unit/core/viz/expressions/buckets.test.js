import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/buckets', () => {
    describe('error control', () => {
        validateDynamicTypeErrors('buckets', ['number', 'string-array']);
        validateDynamicTypeErrors('buckets', ['string', 'number-array']);
        validateStaticTypeErrors('buckets', ['color', 'number-array']);
        validateStaticTypeErrors('buckets', ['number', 'color-array']);
    });

    describe('type', () => {
        validateStaticType('buckets', ['number', 'number-array'], 'string');
        validateStaticType('buckets', ['string', 'string-array'], 'string');
    });

    describe('eval', () => {
        // TODO
    });
});
