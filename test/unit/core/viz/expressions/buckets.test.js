import * as s from '../../../../../src/core/viz/functions';
import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/buckets', () => {
    describe('error control', () => {
        validateDynamicTypeErrors('buckets', ['number', 'string-array']);
        validateDynamicTypeErrors('buckets', ['string', 'number-array']);
        validateStaticTypeErrors('buckets', ['color', 'number-array']);
        validateStaticTypeErrors('buckets', ['number', 'color-array']);

        it('should throw an error when the wrong parameters are passed', () => {
            let $category = s.property('category');
            expect(() => s.buckets($category, '0')).toThrowError(/is not an array/g);
        });
    });

    describe('type', () => {
        validateStaticType('buckets', ['number', 'number-array'], 'string');
        validateStaticType('buckets', ['string', 'string-array'], 'string');
    });

    describe('eval', () => {
        // TODO
    });
});
