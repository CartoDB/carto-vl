import * as s from '../../../../../src/core/viz/functions';
import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors, validateDynamicType } from './utils';


// Add custom toString function to improve test output.
s.TRUE.toString = () => 's.TRUE';
s.FALSE.toString = () => 's.FALSE';

fdescribe('src/core/viz/expressions/binary', () => {
    describe('error control', () => {
        describe('Signature NUMBERS_TO_NUMBER | NUMBER_AND_COLOR_TO_COLOR | COLORS_TO_COLOR', () => {
            validateDynamicTypeErrors('mul', ['number', 'category']);
            validateDynamicTypeErrors('mul', ['category', 'number']);

            validateDynamicTypeErrors('mul', ['category', 'category']);
        });

        describe('Signature NUMBERS_TO_NUMBER | COLORS_TO_COLOR', () => {
            validateDynamicTypeErrors('add', ['number', 'category']);
            validateDynamicTypeErrors('add', ['category', 'number']);

            validateDynamicTypeErrors('add', ['category', 'category']);

            validateDynamicTypeErrors('add', ['number', 'color']);
            validateDynamicTypeErrors('add', ['color', 'number']);
        });

        describe('Signature NUMBERS_TO_NUMBER', () => {
            validateDynamicTypeErrors('mod', ['number', 'category']);
            validateDynamicTypeErrors('mod', ['category', 'number']);

            validateDynamicTypeErrors('mod', ['category', 'category']);

            validateDynamicTypeErrors('mod', ['number', 'color']);
            validateDynamicTypeErrors('mod', ['color', 'number']);

            validateStaticTypeErrors('mod', ['color', 'color']);
        });

        describe('Signature NUMBERS_TO_NUMBER | CATEGORIES_TO_NUMBER', () => {
            validateDynamicTypeErrors('equals', ['number', 'category']);
            validateDynamicTypeErrors('equals', ['category', 'number']);

            validateDynamicTypeErrors('equals', ['number', 'color']);
            validateDynamicTypeErrors('equals', ['color', 'number']);

            validateStaticTypeErrors('equals', ['color', 'color']);
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
            test('gt', s.time('1950-01-01T00:00:00Z'), s.time('2018-01-01T00:00:00Z'), 0);
            test('gt', s.time('2018-01-01T00:00:00Z'), s.time('1950-01-01T00:00:00Z'), 1);
        });

        describe('gte', () => {
            test('gte', 0, 0, 1);
            test('gte', 0, 1, 0);
            test('gte', 1, 0, 1);
            test('gte', 2, 2, 1);
            test('gte', 2, 3, 0);
            test('gte', 3, 2, 1);
            test('gte', -3, 2, 0);
            test('gte', s.time('1950-01-01T00:00:00Z'), s.time('2018-01-01T00:00:00Z'), 0);
            test('gte', s.time('2018-01-01T00:00:00Z'), s.time('1950-01-01T00:00:00Z'), 1);
            test('gte', s.time('2018-01-01T00:00:00Z'), s.time('2018-01-01T00:00:00Z'), 1);
        });

        describe('lt', () => {
            test('lt', 0, 0, 0);
            test('lt', 0, 1, 1);
            test('lt', 1, 0, 0);
            test('lt', 2, 2, 0);
            test('lt', 2, 3, 1);
            test('lt', 3, 2, 0);
            test('lt', -3, 2, 1);
            test('lt', s.time('1950-01-01T00:00:00Z'), s.time('2018-01-01T00:00:00Z'), 1);
            test('lt', s.time('2018-01-01T00:00:00Z'), s.time('1950-01-01T00:00:00Z'), 0);
        });

        describe('lte', () => {
            test('lte', 0, 0, 1);
            test('lte', 0, 1, 1);
            test('lte', 1, 0, 0);
            test('lte', 2, 2, 1);
            test('lte', 2, 3, 1);
            test('lte', 3, 2, 0);
            test('lte', -3, 2, 1);
            test('lte', s.time('1950-01-01T00:00:00Z'), s.time('2018-01-01T00:00:00Z'), 1);
            test('lte', s.time('2018-01-01T00:00:00Z'), s.time('1950-01-01T00:00:00Z'), 0);
            test('lte', s.time('2018-01-01T00:00:00Z'), s.time('2018-01-01T00:00:00Z'), 1);
        });

        describe('eq', () => {
            test('eq', 0, 0, 1);
            test('eq', 0, 1, 0);
            test('eq', 1, 0, 0);
            test('eq', 2, 2, 1);
            test('eq', 2, 3, 0);
            // TODO: js functions in binary operations need tu use the milliseconds
            test('eq', s.time('1950-01-01T00:00:00Z'), s.time('2018-01-01T00:00:00Z'), 0);
            test('eq', s.time('2018-01-01T00:00:00Z'), s.time('2018-01-01T00:00:00Z'), 1);
        });

        describe('neq', () => {
            test('neq', 0, 0, 0);
            test('neq', 0, 1, 1);
            test('neq', 1, 0, 1);
            test('neq', 2, 2, 0);
            test('neq', 2, 3, 1);
            // TODO: js functions in binary operations need tu use the milliseconds
            test('neq', s.time('1950-01-01T00:00:00Z'), s.time('2018-01-01T00:00:00Z'), 1);
            test('neq', s.time('2018-01-01T00:00:00Z'), s.time('2018-01-01T00:00:00Z'), 0);
        });

        function test(fn, param1, param2, expected) {
            it(`${fn}(${param1}, ${param2}) should return ${expected}`, () => {
                let actual = s[fn](param1, param2).eval();
                expect(actual).toEqual(expected);
                actual = s[fn](param1, param2).value;
                expect(actual).toEqual(expected);
            });
        }
    });
});
