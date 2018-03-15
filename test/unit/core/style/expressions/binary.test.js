import * as s from '../../../../../src/core/style/functions';
import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors, validateDynamicType } from './utils';


// Add custom toString function to improve test output.
s.TRUE.toString = () => 's.TRUE';
s.FALSE.toString = () => 's.FALSE';

describe('src/core/style/expressions/binary', () => {
    describe('error control', () => {
        describe('Signature FLOATS_TO_FLOAT | FLOAT_AND_COLOR_TO_COLOR | COLORS_TO_COLOR', () => {
            validateDynamicTypeErrors('mul', ['float', 'category']);
            validateDynamicTypeErrors('mul', ['category', 'float']);

            validateDynamicTypeErrors('mul', ['category', 'category']);
        });

        describe('Signature FLOATS_TO_FLOAT | COLORS_TO_COLOR', () => {
            validateDynamicTypeErrors('add', ['float', 'category']);
            validateDynamicTypeErrors('add', ['category', 'float']);

            validateDynamicTypeErrors('add', ['category', 'category']);

            validateDynamicTypeErrors('add', ['float', 'color']);
            validateDynamicTypeErrors('add', ['color', 'float']);
        });

        describe('Signature FLOATS_TO_FLOAT', () => {
            validateDynamicTypeErrors('mod', ['float', 'category']);
            validateDynamicTypeErrors('mod', ['category', 'float']);

            validateDynamicTypeErrors('mod', ['category', 'category']);

            validateDynamicTypeErrors('mod', ['float', 'color']);
            validateDynamicTypeErrors('mod', ['color', 'float']);

            validateStaticTypeErrors('mod', ['color', 'color']);
        });

        describe('Signature FLOATS_TO_FLOAT | CATEGORIES_TO_FLOAT', () => {
            validateDynamicTypeErrors('equals', ['float', 'category']);
            validateDynamicTypeErrors('equals', ['category', 'float']);

            validateDynamicTypeErrors('equals', ['float', 'color']);
            validateDynamicTypeErrors('equals', ['color', 'float']);

            validateStaticTypeErrors('equals', ['color', 'color']);
        });
    });

    describe('type', () => {
        describe('Signature FLOATS_TO_FLOAT | FLOAT_AND_COLOR_TO_COLOR | COLORS_TO_COLOR', () => {
            validateDynamicType('mul', ['float', 'float'], 'float');
            validateDynamicType('mul', ['float', 'color'], 'color');
            validateStaticType('mul', ['color', 'color'], 'color');
        });

        describe('Signature FLOATS_TO_FLOAT | COLORS_TO_COLOR', () => {
            validateDynamicType('add', ['float', 'float'], 'float');
            validateDynamicType('add', ['color', 'color'], 'color');
        });

        describe('Signature FLOATS_TO_FLOAT', () => {
            validateDynamicType('mod', ['float', 'float'], 'float');
        });

        describe('Signature FLOATS_TO_FLOAT | CATEGORIES_TO_FLOAT', () => {
            validateDynamicType('equals', ['float', 'float'], 'float');
            validateDynamicType('equals', ['category', 'category'], 'float');
        });
    });

    describe('eval', () => {
        describe('and', () => {
            test('and', s.TRUE, s.TRUE, 1);
            test('and', s.TRUE, s.FALSE, 0);
            test('and', s.FALSE, s.FALSE, 0);
            test('and', 0.5, s.TRUE, 0.5);
            test('and', 0.5, 0.5, 0.25);
        });

        describe('or', () => {
            test('or', 0, 0, 0);
            test('or', 0, 1, 1);
            test('or', 1, 1, 1);
            test('or', 0.5, 1, 1);
        });

        describe('floatMul', () => {
            test('floatMul', 0, 0, 0);
            test('floatMul', 1, 0, 0);
            test('floatMul', 1, 1, 1);
            test('floatMul', 1, 2, 2);
            test('floatMul', -1, 2, -2);
        });

        describe('floatDiv', () => {
            it('floatdiv(1, 0) should return an error', () => expect(() => s.floatDiv(1, 0)).toThrow());
            test('floatDiv', 0, 1, 0);
            test('floatDiv', 4, 2, 2);
            test('floatDiv', -4, 2, -2);
        });

        describe('floatAdd', () => {
            test('floatAdd', 0, 0, 0);
            test('floatAdd', 0, 1, 1);
            test('floatAdd', 2, 2, 4);
            test('floatAdd', -2, 2, 0);
            test('floatAdd', -2, -3, -5);
        });

        describe('floatSub', () => {
            test('floatSub', 0, 0, 0);
            test('floatSub', 0, 1, -1);
            test('floatSub', 2, 2, 0);
            test('floatSub', -2, 2, -4);
            test('floatSub', -2, -3, 1);
        });

        describe('floatMod', () => {
            it('floatdiv(1, 0) should return an error', () => expect(() => s.floatMod(3, 0)).toThrow());
            test('floatMod', 0, 1, 0);
            test('floatMod', 2, 1, 0);
            test('floatMod', 2, 2, 0);
            test('floatMod', 6, 4, 2);
            test('floatMod', -6, 4, -2);
        });

        describe('floatPow', () => {
            test('floatPow', 0, 0, 1);
            test('floatPow', 0, 1, 0);
            test('floatPow', 2, 2, 4);
            test('floatPow', -2, 2, 4);
            test('floatPow', -2, -3, -0.125);
        });

        describe('gt', () => {
            test('gt', 0, 0, 0);
            test('gt', 0, 1, 0);
            test('gt', 1, 0, 1);
            test('gt', 2, 2, 0);
            test('gt', 2, 3, 0);
            test('gt', 3, 2, 1);
            test('gt', -3, 2, 0);
        });

        describe('gte', () => {
            test('gte', 0, 0, 1);
            test('gte', 0, 1, 0);
            test('gte', 1, 0, 1);
            test('gte', 2, 2, 1);
            test('gte', 2, 3, 0);
            test('gte', 3, 2, 1);
            test('gte', -3, 2, 0);
        });

        describe('lt', () => {
            test('lt', 0, 0, 0);
            test('lt', 0, 1, 1);
            test('lt', 1, 0, 0);
            test('lt', 2, 2, 0);
            test('lt', 2, 3, 1);
            test('lt', 3, 2, 0);
            test('lt', -3, 2, 1);
        });

        describe('lte', () => {
            test('lte', 0, 0, 1);
            test('lte', 0, 1, 1);
            test('lte', 1, 0, 0);
            test('lte', 2, 2, 1);
            test('lte', 2, 3, 1);
            test('lte', 3, 2, 0);
            test('lte', -3, 2, 1);
        });

        describe('eq', () => {
            test('eq', 0, 0, 1);
            test('eq', 0, 1, 0);
            test('eq', 1, 0, 0);
            test('eq', 2, 2, 1);
            test('eq', 2, 3, 0);
        });

        describe('neq', () => {
            test('neq', 0, 0, 0);
            test('neq', 0, 1, 1);
            test('neq', 1, 0, 1);
            test('neq', 2, 2, 0);
            test('neq', 2, 3, 1);
        });

        function test(fn, param1, param2, expected) {
            it(`${fn}(${param1}, ${param2}) should return ${expected}`, () => {
                const actual = s[fn](param1, param2).eval();
                expect(actual).toEqual(expected);
            });
        }
    });
});


