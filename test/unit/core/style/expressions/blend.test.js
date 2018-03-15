import * as s from '../../../../../src/core/style/functions';
import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors, validateDynamicType } from './utils';

describe('src/core/style/expressions/blend', () => {
    describe('error control', () => {
        validateStaticTypeErrors('blend', []);
        validateStaticTypeErrors('blend', ['float']);
        validateStaticTypeErrors('blend', ['float', 'float']);
        validateDynamicTypeErrors('blend', ['float', 'color', 'float']);
        validateDynamicTypeErrors('blend', ['color', 'float', 'float']);
        validateDynamicTypeErrors('blend', ['category', 'float', 'float']);
        validateDynamicTypeErrors('blend', ['float', 'category', 'float']);
        validateDynamicTypeErrors('blend', ['float', 'float', 'category']);
    });

    describe('type', () => {
        validateDynamicType('blend', ['float', 'float', 'float'], 'float');
        validateStaticType('blend', ['color', 'color', 'float'], 'color');
    });

    describe('eval()', () => {
        it('should interpolate a float value 0%', () => {
            const actual = s.blend(0, 100, 0).eval();
            expect(actual).toEqual(0);
        });

        it('should interpolate a float value 50%', () => {
            const actual = s.blend(0, 100, .5).eval();
            expect(actual).toEqual(50);
        });

        it('should interpolate a float value 100%', () => {
            const actual = s.blend(0, 100, 1).eval();
            expect(actual).toEqual(100);
        });
    });
});


