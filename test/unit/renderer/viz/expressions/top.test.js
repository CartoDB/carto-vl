import { validateTypeErrors, validateStaticType, validateFeatureDependentErrors, validateMaxArgumentsError } from './utils';
import * as s from '../../../../../src/renderer/viz/expressions';
import CartoValidationError, { CartoValidationErrorTypes } from '../../../../../src/errors/carto-validation-error';
import { OTHERS_LABEL } from '../../../../../src/renderer/viz/expressions/constants';

describe('src/renderer/viz/expressions/top', () => {
    describe('error control', () => {
        validateFeatureDependentErrors('top', ['category-property', 'dependent']);
        validateTypeErrors('top', ['number', 10]);
        validateTypeErrors('top', ['color', 10]);
        validateMaxArgumentsError('top', ['category', 10, 'number']);
    });

    describe('type', () => {
        validateStaticType('top', ['category-property', 5], 'category');
    });

    describe('numBuckets', () => {
        const realWindowSetTimeout = window.setTimeout;

        it('should return the provided buckets when it is inside the bounds', () => {
            const top = s.top(s.property('numericProperty'), 16);
            const actual = top.numBuckets;
            const expected = 16;
            expect(actual).toEqual(expected);
        });

        it('should return 0 when it is outside the bounds', () => {
            // Mock setTimeout
            window.setTimeout = (fn) => {};
            const top = s.top(s.property('numericProperty'), 17);
            const actual = top.numBuckets;
            const expected = 0;
            expect(actual).toEqual(expected);
        });

        it('should throw an async exception when it is outside the bounds', () => {
            // Mock setTimeout
            window.setTimeout = (fn) => fn();
            const top = s.top(s.property('numericProperty'), 17);
            expect(() => {
                top.numBuckets();
            }).toThrowError(CartoValidationError, CartoValidationErrorTypes.INCORRECT_VALUE + ' top() function has a limit of 16 buckets but \'17\' buckets were specified.');
        });

        afterAll(() => {
            window.setTimeout = realWindowSetTimeout;
        });
    });

    describe('eval', () => {
        const meta = {
            properties: {
                wadus: {
                    type: 'category',
                    categories: [
                        {
                            name: 'D',
                            frequency: 2
                        },
                        {
                            name: 'B',
                            frequency: 5
                        },
                        {
                            name: 'A',
                            frequency: 10
                        },
                        {
                            name: 'C',
                            frequency: 1
                        }
                    ]
                }
            }
        };

        it('should work with 1 bucket', () => {
            const top = s.top(s.prop('wadus'), 1);
            top._bindMetadata(meta);
            expect(top.eval({ wadus: 'A' })).toEqual({ label: 'A', index: 0 });
            expect(top.eval({ wadus: 'B' })).toEqual({ label: OTHERS_LABEL, index: -1 });
            expect(top.eval({ wadus: 'C' })).toEqual({ label: OTHERS_LABEL, index: -1 });
            expect(top.eval({ wadus: 'D' })).toEqual({ label: OTHERS_LABEL, index: -1 });
        });

        it('should work with 2 buckets', () => {
            const top = s.top(s.prop('wadus'), 2);
            top._bindMetadata(meta);
            expect(top.eval({ wadus: 'A' })).toEqual({ label: 'A', index: 0 });
            expect(top.eval({ wadus: 'B' })).toEqual({ label: 'B', index: 1 });
            expect(top.eval({ wadus: 'C' })).toEqual({ label: OTHERS_LABEL, index: -1 });
            expect(top.eval({ wadus: 'D' })).toEqual({ label: OTHERS_LABEL, index: -1 });
        });

        it('should work with 4 bucket', () => {
            const top = s.top(s.prop('wadus'), 4);
            top._bindMetadata(meta);
            expect(top.eval({ wadus: 'A' })).toEqual({ label: 'A', index: 0 });
            expect(top.eval({ wadus: 'B' })).toEqual({ label: 'B', index: 1 / 3 });
            expect(top.eval({ wadus: 'C' })).toEqual({ label: 'C', index: 3 / 3 });
            expect(top.eval({ wadus: 'D' })).toEqual({ label: 'D', index: 2 / 3 });
        });
    });
});
