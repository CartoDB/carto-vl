import * as s from '../../../../../src/core/viz/functions';
import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/buckets', () => {
    describe('error control', () => {
        validateDynamicTypeErrors('buckets', ['number', 'category-array']);
        validateDynamicTypeErrors('buckets', ['category', 'number-array']);
        validateStaticTypeErrors('buckets', ['color', 'number-array']);
        validateStaticTypeErrors('buckets', ['number', 'color-array']);

        it('should throw an error when the wrong parameters are passed', () => {
            let $category = s.property('category');
            expect(() => s.buckets($category, '0')).toThrowError(/is not an array/g);
        });
    });

    describe('type', () => {
        validateStaticType('buckets', ['number', 'number-array'], 'category');
        validateStaticType('buckets', ['category', 'category-array'], 'category');
    });

    describe('eval', () => {
        // TODO
    });
});
