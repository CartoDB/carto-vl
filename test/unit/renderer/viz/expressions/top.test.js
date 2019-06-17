import { validateTypeErrors, validateStaticType, validateFeatureDependentErrors, validateMaxArgumentsError } from './utils';
import * as s from '../../../../../src/renderer/viz/expressions';
import CartoValidationError, { CartoValidationErrorTypes } from '../../../../../src/errors/carto-validation-error';
import { OTHERS_LABEL } from '../../../../../src/renderer/viz/expressions/constants';

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

const meta16 = {
    properties: {
        wadus: {
            type: 'category',
            categories: [
                {
                    name: 'A',
                    frequency: 2
                },
                {
                    name: 'B',
                    frequency: 5
                },
                {
                    name: 'C',
                    frequency: 10
                },
                {
                    name: 'D',
                    frequency: 8
                },
                {
                    name: 'E',
                    frequency: 12
                },
                {
                    name: 'F',
                    frequency: 3
                },
                {
                    name: 'G',
                    frequency: 10
                },
                {
                    name: 'H',
                    frequency: 1
                },
                {
                    name: 'I',
                    frequency: 1
                },
                {
                    name: 'J',
                    frequency: 15
                },
                {
                    name: 'K',
                    frequency: 40
                },
                {
                    name: 'L',
                    frequency: 1
                },
                {
                    name: 'M',
                    frequency: 2
                },
                {
                    name: 'N',
                    frequency: 4
                },
                {
                    name: 'O',
                    frequency: 3
                },
                {
                    name: 'P',
                    frequency: 1
                },
                {
                    name: 'Q',
                    frequency: 9
                },
                {
                    name: 'R',
                    frequency: 8
                },
                {
                    name: 'S',
                    frequency: 12
                },
                {
                    name: 'T',
                    frequency: 1
                }
            ]
        }
    }
};

describe('src/renderer/viz/expressions/top', () => {
    describe('error control', () => {
        validateFeatureDependentErrors('top', ['category-property', 'dependent']);
        validateTypeErrors('top', ['number', 10]);
        validateTypeErrors('top', ['color', 10]);
        validateTypeErrors('top', ['color', 10, 2]);
        validateMaxArgumentsError('top', ['category', 10, 'number', 'number']);
    });

    describe('type', () => {
        validateStaticType('top', ['category-property', 5], 'category');
    });

    describe('numBuckets', () => {
        it('should return the provided buckets if there are less than given', () => {
            const top = s.top(s.property('wadus'), 16);
            top._bindMetadata(meta);
            const actual = top.numBuckets;
            const expected = 4;
            expect(actual).toEqual(expected);
        });

        it('should return the provided buckets when it is inside the bounds', () => {
            const top = s.top(s.property('wadus'), 16);
            top._bindMetadata(meta16);
            const actual = top.numBuckets;
            const expected = 16;
            expect(actual).toEqual(expected);
        });

        it('should throw an async exception when it is outside the bounds', () => {
            expect(() => {
                const top = s.top(s.property('wadus'), 17);
                top._bindMetadata(meta16);
            }).toThrowError(CartoValidationError, CartoValidationErrorTypes.INCORRECT_VALUE + ' top() function has a limit of 16 buckets but \'17\' buckets were specified.');
        });
    });

    describe('eval', () => {
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
