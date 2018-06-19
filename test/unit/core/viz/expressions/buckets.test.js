import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';
import * as s from '../../../../../src/core/viz/functions';

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
        describe('when input type is category', () => {
            describe('and it has one breakpoint', () => {
                const city = 'Murcia';
                let bucketExpression;
                let inputFeature = { city };
                let $cities = s.property('city');
                const METADATA = {
                    columns: [
                        {
                            name: 'city',
                            type: 'category',
                            categoryNames: ['Murcia', 'Madrid'],


                        }
                    ],
                    categoryIDs: {
                        'Murcia': 0,
                        'Madrid': 1
                    }
                };

                beforeEach(() => {
                    $cities._compile(METADATA);
                    bucketExpression = s.buckets($cities, [city]);
                });

                it('should classify the input feature in the first bucket', () => {
                    const response = bucketExpression.eval(inputFeature);
                    expect(response).toEqual(0);
                });
            });

            fdescribe('and it has two breakpoints', () => {
                let bucketExpression;
                let $cities = s.property('city');
                const METADATA = {
                    columns: [
                        {
                            name: 'city',
                            type: 'category',
                            categoryNames: ['Madrid', 'Murcia'],

                        },
                    ],
                    categoryIDs: {
                        'Mardrid': 0,
                        'Murcia': 1,
                    }
                };

                beforeEach(() => {
                    bucketExpression = s.buckets($cities, ['Murcia', 'Madrid']);
                    bucketExpression._compile(METADATA);
                });

                it('should classify the input feature in the first bucket', () => {
                    const inputFeature = { city: 'Murcia' };
                    const actual = bucketExpression.eval(inputFeature);
                    const expected = 0;

                    expect(actual).toEqual(expected);
                });

                it('should classify the input feature in the last bucket', () => {
                    const inputFeature = { city: 'Madrid' };
                    const actual = bucketExpression.eval(inputFeature);
                    const expected = 1;

                    expect(actual).toEqual(expected);
                });
            });

            describe('and it has more than two breakpoints', () => {

            });
        });

        describe('when input type is number', () => {
            describe('and it has one breakpoint', () => {

            });

            describe('and it has two breakpoints', () => {

            });

            describe('and it has more than two breakpoints', () => {

            });
        });
    });
});
