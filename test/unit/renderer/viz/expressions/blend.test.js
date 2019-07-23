import * as s from '../../../../../src/renderer/viz/expressions';
import { validateTypeErrors, validateStaticType, validateDynamicType, validateMaxArgumentsError } from './utils';

describe('src/renderer/viz/expressions/blend', () => {
    describe('error control', () => {
        validateTypeErrors('blend', []);
        validateTypeErrors('blend', ['number']);
        validateTypeErrors('blend', ['number', 'number']);
        validateTypeErrors('blend', ['number', 'color', 'number']);
        validateTypeErrors('blend', ['color', 'number', 'number']);
        validateTypeErrors('blend', ['category', 'number', 'number']);
        validateTypeErrors('blend', ['number', 'category', 'number']);
        validateTypeErrors('blend', ['number', 'number', 'category']);
        validateMaxArgumentsError('blend', ['number', 'number', 'number', 'number', 'number']);
    });

    describe('type', () => {
        validateDynamicType('blend', ['number', 'number', 'number'], 'number');
        validateStaticType('blend', ['color', 'color', 'number'], 'color');
    });

    describe('eval()', () => {
        it('should interpolate a float value 0%', () => {
            const actual = s.blend(0, 100, 0).eval();
            expect(actual).toEqual(0);
        });

        it('should interpolate a float value 50%', () => {
            const actual = s.blend(0, 100, 0.5).eval();
            expect(actual).toEqual(50);
        });

        it('should interpolate a float value 100%', () => {
            const actual = s.blend(0, 100, 1).eval();
            expect(actual).toEqual(100);
        });

        it('should interpolate a date 0%', () => {
            const actual = s.blend(s.date('1/1/2019'), s.date('3/2/2019'), 0).value;
            const expected = new Date('1/1/2019');
            expect(actual).toEqual(expected);
        });

        it('should interpolate a date 50%', () => {
            const actual = s.blend(s.date('1/1/2019'), s.date('3/2/2019'), 0.5).value;
            const expected = new Date('1/31/2019');
            expect(actual).toEqual(expected);
        });

        it('should interpolate a date 100%', () => {
            const actual = s.blend(s.date('1/1/2019'), s.date('3/2/2019'), 1).value;
            const expected = new Date('3/2/2019');
            expect(actual).toEqual(expected);
        });
    });
});
