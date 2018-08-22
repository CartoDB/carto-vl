import * as s from '../../../../../src/renderer/viz/expressions';
import { validateStaticType, validateDynamicType, validateMaxArgumentsError, validateCompileTypeError } from './utils';

// Add custom toString function to improve test output.
s.constants.TRUE.toString = () => 's.TRUE';
s.constants.FALSE.toString = () => 's.FALSE';

describe('src/renderer/viz/expressions/binary', () => {
    describe('error control', () => {
        describe('Signature NUMBERS_TO_NUMBER | NUMBER_AND_COLOR_TO_COLOR | COLORS_TO_COLOR', () => {
            validateCompileTypeError('mul', ['number', 'category']);
            validateCompileTypeError('mul', ['category', 'number']);
            validateCompileTypeError('mul', ['category', 'category']);
            validateMaxArgumentsError('mul', ['number', 'number', 'number']);
        });

        describe('Signature NUMBERS_TO_NUMBER | COLORS_TO_COLOR', () => {
            validateCompileTypeError('add', ['number', 'category']);
            validateCompileTypeError('add', ['category', 'number']);

            validateCompileTypeError('add', ['category', 'category']);

            validateCompileTypeError('add', ['number', 'color']);
            validateCompileTypeError('add', ['color', 'number']);

            validateMaxArgumentsError('add', ['number', 'number', 'number']);
        });

        describe('Signature NUMBERS_TO_NUMBER', () => {
            validateCompileTypeError('mod', ['number', 'category']);
            validateCompileTypeError('mod', ['category', 'number']);

            validateCompileTypeError('mod', ['category', 'category']);

            validateCompileTypeError('mod', ['number', 'color']);
            validateCompileTypeError('mod', ['color', 'number']);

            validateCompileTypeError('mod', ['color', 'color']);

            validateMaxArgumentsError('mod', ['number', 'number', 'number']);
        });

        describe('Signature NUMBERS_TO_NUMBER | CATEGORIES_TO_NUMBER', () => {
            validateCompileTypeError('equals', ['number', 'category']);
            validateCompileTypeError('equals', ['category', 'number']);

            validateCompileTypeError('equals', ['number', 'color']);
            validateCompileTypeError('equals', ['color', 'number']);

            validateCompileTypeError('equals', ['color', 'color']);

            validateMaxArgumentsError('equals', ['number', 'number', 'number']);
        });
    });

    describe('type', () => {
        describe('Signature NUMBERS_TO_NUMBER | NUMBER_AND_COLOR_TO_COLOR | COLORS_TO_COLOR', () => {
            validateDynamicType('mul', ['number', 'number'], 'number');
            validateDynamicType('mul', ['number', 'color'], 'color');
            validateStaticType('mul', ['color', 'color'], 'color');
        });

        describe('Signature NUMBERS_TO_NUMBER | COLORS_TO_COLOR', () => {
            validateDynamicType('add', ['number', 'number'], 'number');
            validateDynamicType('add', ['color', 'color'], 'color');
        });

        describe('Signature NUMBERS_TO_NUMBER', () => {
            validateDynamicType('mod', ['number', 'number'], 'number');
        });

        describe('Signature NUMBERS_TO_NUMBER | CATEGORIES_TO_NUMBER', () => {
            validateDynamicType('equals', ['number', 'number'], 'number');
            validateDynamicType('equals', ['category', 'category'], 'number');
        });
    });

    describe('eval', () => {
        describe('and', () => {
            test('and', s.constants.TRUE, s.constants.TRUE, 1);
            test('and', s.constants.TRUE, s.constants.FALSE, 0);
            test('and', s.constants.FALSE, s.constants.FALSE, 0);
            test('and', 0.5, s.constants.TRUE, 0.5);
            test('and', 0.5, 0.5, 0.25);
        });

        describe('or', () => {
            test('or', 0, 0, 0);
            test('or', 0, 1, 1);
            test('or', 1, 1, 1);
            test('or', 0.5, 1, 1);
        });

        describe('mul', () => {
            test('mul', 0, 0, 0);
            test('mul', 1, 0, 0);
            test('mul', 1, 1, 1);
            test('mul', 1, 2, 2);
            test('mul', -1, 2, -2);
        });

        describe('div', () => {
            test('div', 1, 0, Infinity);
            test('div', -1, 0, -Infinity);
            test('div', 0, 0, NaN);
            test('div', 0, 1, 0);
            test('div', 4, 2, 2);
            test('div', -4, 2, -2);
        });

        describe('add', () => {
            test('add', 0, 0, 0);
            test('add', 0, 1, 1);
            test('add', 2, 2, 4);
            test('add', -2, 2, 0);
            test('add', -2, -3, -5);
        });

        describe('sub', () => {
            test('sub', 0, 0, 0);
            test('sub', 0, 1, -1);
            test('sub', 2, 2, 0);
            test('sub', -2, 2, -4);
            test('sub', -2, -3, 1);
        });

        describe('mod', () => {
            test('mod', 0, 1, 0);
            test('mod', 2, 1, 0);
            test('mod', 2, 2, 0);
            test('mod', 6, 4, 2);
            test('mod', -6, 4, -2);
        });

        describe('pow', () => {
            test('pow', 0, 0, 1);
            test('pow', 0, 1, 0);
            test('pow', 2, 2, 4);
            test('pow', -2, 2, 4);
            test('pow', -2, -3, -0.125);
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

        function test (fn, param1, param2, expected) {
            it(`${fn}(${param1}, ${param2}) should return ${expected}`, () => {
                let actual = s[fn](param1, param2).eval();
                expect(actual).toEqual(expected);
                actual = s[fn](param1, param2).value;
                expect(actual).toEqual(expected);
            });
        }
    });
});
