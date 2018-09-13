import { validateTypeErrors, validateStaticType, validateMaxArgumentsError } from './utils';
import * as s from '../../../../../src/renderer/viz/expressions';
import Metadata from '../../../../../src/renderer/Metadata';
import { OTHERS_INDEX } from '../../../../../src/renderer/viz/expressions/constants';

describe('src/renderer/viz/expressions/buckets', () => {
    describe('error control', () => {
        validateTypeErrors('buckets', ['number', 'number']);
        validateTypeErrors('buckets', ['category', 'category']);

        validateTypeErrors('buckets', ['number', 'category-list']);
        validateTypeErrors('buckets', ['category', 'number-list']);
        validateTypeErrors('buckets', ['color', 'number-list']);
        validateTypeErrors('buckets', ['number', 'color-list']);
        validateMaxArgumentsError('buckets', ['number', 'number-list', 'number']);
    });

    describe('type', () => {
        validateStaticType('buckets', ['number', 'number-list'], 'category');
        validateStaticType('buckets', ['category', 'category-list'], 'category');
    });

    describe('eval', () => {
        let bucketExpression;

        describe('when input type is category', () => {
            const METADATA = new Metadata({
                properties: {
                    city: {
                        type: 'category',
                        categories: [
                            { name: 'Murcia' },
                            { name: 'Madrid' },
                            { name: 'Pontevedra' },
                            { name: 'Barcelona' }
                        ]
                    }
                }
            });

            let $cities = s.property('city');

            describe('and it has one breakpoint', () => {
                beforeEach(() => {
                    bucketExpression = s.buckets($cities, ['Murcia']);
                    bucketExpression._bindMetadata(METADATA);
                });

                it('should classify the input feature in the first bucket', () => {
                    const expected = 0;
                    const feature = { city: 'Murcia' };
                    const response = bucketExpression.eval(feature);

                    expect(response).toEqual(expected);
                });

                it('should classify extra category as other', () => {
                    const expected = OTHERS_INDEX;
                    let feature;
                    let response;

                    feature = { city: 'Pontevedra' };
                    response = bucketExpression.eval(feature);

                    expect(response).toEqual(expected);

                    feature = { city: 'Barcelona' };
                    response = bucketExpression.eval(feature);

                    expect(response).toEqual(expected);
                });
            });

            describe('and it has two breakpoints', () => {
                beforeEach(() => {
                    bucketExpression = s.buckets($cities, ['Murcia', 'Madrid']);
                    bucketExpression._bindMetadata(METADATA);
                });

                it('should classify the input feature in the first bucket', () => {
                    const expected = 0;
                    const feature = { city: 'Murcia' };
                    const actual = bucketExpression.eval(feature);

                    expect(actual).toEqual(expected);
                });

                it('should classify the input feature in the last bucket', () => {
                    const expected = 1;
                    const feature = { city: 'Madrid' };
                    const actual = bucketExpression.eval(feature);

                    expect(actual).toEqual(expected);
                });

                it('should classify extra category as other', () => {
                    const expected = OTHERS_INDEX;
                    let feature;
                    let actual;

                    feature = { city: 'Pontevedra' };
                    actual = bucketExpression.eval(feature);

                    expect(actual).toEqual(expected);

                    feature = { city: 'Barcelona' };
                    actual = bucketExpression.eval(feature);

                    expect(actual).toEqual(expected);
                });
            });

            describe('and it has more than two breakpoints', () => {
                beforeEach(() => {
                    bucketExpression = s.buckets($cities, ['Pontevedra', 'Murcia', 'Madrid']);
                    bucketExpression._bindMetadata(METADATA);
                });

                it('should classify the input feature in the first bucket', () => {
                    const expected = 0;
                    const feature = { city: 'Pontevedra' };
                    const actual = bucketExpression.eval(feature);

                    expect(actual).toEqual(expected);
                });

                it('should classify the input feature in the second bucket', () => {
                    const expected = 0.5;
                    const feature = { city: 'Murcia' };
                    const actual = bucketExpression.eval(feature);

                    expect(actual).toEqual(expected);
                });

                it('should classify the input feature in the third bucket', () => {
                    const expected = 1;
                    const feature = { city: 'Madrid' };
                    const actual = bucketExpression.eval(feature);

                    expect(actual).toEqual(expected);
                });

                it('should classify extra category as other', () => {
                    const expected = OTHERS_INDEX;
                    let feature;
                    let response;

                    feature = { city: 'Barcelona' };
                    response = bucketExpression.eval(feature);

                    expect(response).toEqual(expected);
                });
            });
        });

        describe('when input type is number', () => {
            const METADATA = new Metadata({
                properties: {
                    price: {
                        type: 'number'
                    }
                }
            });

            const $price = s.property('price');

            describe('and it has one breakpoint', () => {
                beforeEach(() => {
                    bucketExpression = s.buckets($price, [10]);
                    bucketExpression._bindMetadata(METADATA);
                });

                it('should classify the input in the first category when is lower than the breakpoint', () => {
                    const expected = 0;
                    const feature = { price: 5 };
                    const actual = bucketExpression.eval(feature);

                    expect(actual).toEqual(expected);
                });

                it('should classify the input in the second category when is higher than the breakpoint', () => {
                    const expected = 1;
                    const feature = { price: 11 };
                    const actual = bucketExpression.eval(feature);

                    expect(actual).toEqual(expected);
                });

                it('should classify the input in the second category when is equal than the breakpoint', () => {
                    const expected = 1;
                    const feature = { price: 10 };
                    const actual = bucketExpression.eval(feature);

                    expect(actual).toEqual(expected);
                });
            });

            describe('and it has two breakpoints', () => {
                beforeEach(() => {
                    bucketExpression = s.buckets($price, [10, 20]);
                    bucketExpression._bindMetadata(METADATA);
                });

                it('should classify the input in the first category when is lower than the first breakpoint', () => {
                    const expected = 0;
                    const feature = { price: 9 };
                    const actual = bucketExpression.eval(feature);

                    expect(actual).toEqual(expected);
                });

                it('should classify the input in the second category when is equal than the first breakpoint', () => {
                    const expected = 0.5;
                    const feature = { price: 10 };
                    const actual = bucketExpression.eval(feature);

                    expect(actual).toEqual(expected);
                });

                it('should classify the input in the second category when is lower than the second breakpoint', () => {
                    const expected = 0.5;
                    const feature = { price: 15 };
                    const actual = bucketExpression.eval(feature);

                    expect(actual).toEqual(expected);
                });

                it('should classify the input in the third category when is equal than the third breakpoint', () => {
                    const expected = 1;
                    const feature = { price: 20 };
                    const actual = bucketExpression.eval(feature);

                    expect(actual).toEqual(expected);
                });

                it('should classify the input in the third category when is higher than the third breakpoint', () => {
                    const expected = 1;
                    const feature = { price: 21 };
                    const actual = bucketExpression.eval(feature);

                    expect(actual).toEqual(expected);
                });
            });
        });
    });
});
