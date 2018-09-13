import { validateTypeErrors, validateStaticType, validateFeatureDependentErrors, validateMaxArgumentsError } from './utils';
import * as s from '../../../../../src/renderer/viz/expressions';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../../../src/errors/carto-validation-error';

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
            }).toThrowError(CartoValidationError, cvt.INCORRECT_VALUE + ' top() function has a limit of 16 buckets but \'17\' buckets were specified.');
        });

        afterAll(() => {
            window.setTimeout = realWindowSetTimeout;
        });
    });
});
