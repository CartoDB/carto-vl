import * as s from '../../../../../src/renderer/viz/expressions';
import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors, validateDynamicType, validateMaxArgumentsError } from './utils';

describe('src/renderer/viz/expressions/blend', () => {
    describe('error control', () => {
        validateStaticTypeErrors('blend', []);
        validateStaticTypeErrors('blend', ['number']);
        validateStaticTypeErrors('blend', ['number', 'number']);
        validateDynamicTypeErrors('blend', ['number', 'color', 'number']);
        validateDynamicTypeErrors('blend', ['color', 'number', 'number']);
        validateDynamicTypeErrors('blend', ['category', 'number', 'number']);
        validateDynamicTypeErrors('blend', ['number', 'category', 'number']);
        validateDynamicTypeErrors('blend', ['number', 'number', 'category']);
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
    });
});
