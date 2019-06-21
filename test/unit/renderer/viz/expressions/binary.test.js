import * as s from '../../../../../src/renderer/viz/expressions';
import { validateDynamicType, validateMaxArgumentsError, validateTypeErrors } from './utils';

// Add custom toString function to improve test output.
s.TRUE.toString = () => 's.TRUE';
s.FALSE.toString = () => 's.FALSE';

describe('src/renderer/viz/expressions/binary', () => {
    describe('error control', () => {
        describe('Signature NUMBERS_TO_NUMBER | NUMBER_AND_COLOR_TO_COLOR | COLORS_TO_COLOR', () => {
            validateTypeErrors('mul', ['number', 'category']);
            validateTypeErrors('mul', ['category', 'number']);
            validateTypeErrors('mul', ['category', 'category']);
            validateMaxArgumentsError('mul', ['number', 'number', 'number']);
        });

        describe('Signature NUMBERS_TO_NUMBER | COLORS_TO_COLOR', () => {
            validateTypeErrors('add', ['number', 'category']);
            validateTypeErrors('add', ['category', 'number']);

            validateTypeErrors('add', ['category', 'category']);

            validateTypeErrors('add', ['number', 'color']);
            validateTypeErrors('add', ['color', 'number']);

            validateMaxArgumentsError('add', ['number', 'number', 'number']);
        });

        describe('Signature NUMBERS_TO_NUMBER', () => {
            validateTypeErrors('mod', ['number', 'category']);
            validateTypeErrors('mod', ['category', 'number']);

            validateTypeErrors('mod', ['category', 'category']);

            validateTypeErrors('mod', ['number', 'color']);
            validateTypeErrors('mod', ['color', 'number']);

            validateTypeErrors('mod', ['color', 'color']);

            validateMaxArgumentsError('mod', ['number', 'number', 'number']);
        });

        describe('Signature NUMBERS_TO_NUMBER | CATEGORIES_TO_NUMBER', () => {
            validateTypeErrors('equals', ['number', 'category']);
            validateTypeErrors('equals', ['category', 'number']);

            validateTypeErrors('equals', ['number', 'color']);
            validateTypeErrors('equals', ['color', 'number']);

            validateTypeErrors('equals', ['color', 'color']);

            validateMaxArgumentsError('equals', ['number', 'number', 'number']);
        });
    });

    describe('type', () => {
        describe('Signature NUMBERS_TO_NUMBER | NUMBER_AND_COLOR_TO_COLOR | COLORS_TO_COLOR', () => {
            validateDynamicType('mul', ['number', 'number'], 'number');
            validateDynamicType('mul', ['number', 'color'], 'color');
            validateDynamicType('mul', ['color', 'color'], 'color');
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

    describe('.eval', () => {
        describe('mul', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                testValue('mul', 0, 0, 0);
                testValue('mul', 1, 0, 0);
                testValue('mul', 1, 1, 1);
                testValue('mul', 1, 2, 2);
                testValue('mul', -1, 2, -2);
            });

            describe('NUMBER_AND_COLOR_TO_COLOR', () => {

            });

            describe('COLORS_TO_COLOR', () => {

            });

            describe('IMAGES_TO_IMAGE', () => {

            });
        });

        describe('div', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                testValue('div', 1, 0, Infinity);
                testValue('div', -1, 0, -Infinity);
                testValue('div', 0, 0, NaN);
                testValue('div', 0, 1, 0);
                testValue('div', 4, 2, 2);
                testValue('div', -4, 2, -2);
            });

            describe('NUMBER_AND_COLOR_TO_COLOR', () => {

            });

            describe('COLORS_TO_COLOR', () => {

            });

            describe('IMAGES_TO_IMAGE', () => {

            });
        });

        describe('add', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                testValue('add', 0, 0, 0);
                testValue('add', 0, 1, 1);
                testValue('add', 2, 2, 4);
                testValue('add', -2, 2, 0);
                testValue('add', -2, -3, -5);
            });

            describe('COLORS_TO_COLOR', () => {

            });

            describe('IMAGES_TO_IMAGE', () => {

            });
        });

        describe('sub', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                testValue('sub', 0, 0, 0);
                testValue('sub', 0, 1, -1);
                testValue('sub', 2, 2, 0);
                testValue('sub', -2, 2, -4);
                testValue('sub', -2, -3, 1);
            });

            describe('COLORS_TO_COLOR', () => {

            });

            describe('IMAGES_TO_IMAGE', () => {

            });
        });

        describe('mod', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                testValue('mod', 0, 1, 0);
                testValue('mod', 2, 1, 0);
                testValue('mod', 2, 2, 0);
                testValue('mod', 6, 4, 2);
                testValue('mod', -6, 4, -2);
            });
        });

        describe('pow', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                testValue('pow', 0, 0, 1);
                testValue('pow', 0, 1, 0);
                testValue('pow', 2, 2, 4);
                testValue('pow', -2, 2, 4);
                testValue('pow', -2, -3, -0.125);
            });
        });

        describe('or', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                testValue('or', 0, 0, 0);
                testValue('or', 0, 1, 1);
                testValue('or', 1, 1, 1);
                testValue('or', 0.5, 1, 1);
            });
        });

        describe('and', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                testValue('and', s.TRUE, s.TRUE, 1);
                testValue('and', s.TRUE, s.FALSE, 0);
                testValue('and', s.FALSE, s.FALSE, 0);
                testValue('and', 0.5, s.TRUE, 0.5);
                testValue('and', 0.5, 0.5, 0.25);
            });
        });

        describe('greaterThan', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                testValue('gt', 0, 0, 0);
                testValue('gt', 0, 1, 0);
                testValue('gt', 1, 0, 1);
                testValue('gt', 2, 2, 0);
                testValue('gt', 2, 3, 0);
                testValue('gt', 3, 2, 1);
                testValue('gt', -3, 2, 0);
            });
        });

        describe('greaterThanOrEqualTo', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                testValue('gte', 0, 0, 1);
                testValue('gte', 0, 1, 0);
                testValue('gte', 1, 0, 1);
                testValue('gte', 2, 2, 1);
                testValue('gte', 2, 3, 0);
                testValue('gte', 3, 2, 1);
                testValue('gte', -3, 2, 0);
            });
        });

        describe('lessThan', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                testValue('lt', 0, 0, 0);
                testValue('lt', 0, 1, 1);
                testValue('lt', 1, 0, 0);
                testValue('lt', 2, 2, 0);
                testValue('lt', 2, 3, 1);
                testValue('lt', 3, 2, 0);
                testValue('lt', -3, 2, 1);
            });
        });

        describe('lessThanOrEqualTo', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                testValue('lte', 0, 0, 1);
                testValue('lte', 0, 1, 1);
                testValue('lte', 1, 0, 0);
                testValue('lte', 2, 2, 1);
                testValue('lte', 2, 3, 1);
                testValue('lte', 3, 2, 0);
                testValue('lte', -3, 2, 1);
            });
        });

        describe('equals', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                testValue('eq', 0, 0, 1);
                testValue('eq', 0, 1, 0);
                testValue('eq', 1, 0, 0);
                testValue('eq', 2, 2, 1);
                testValue('eq', 2, 3, 0);
            });

            describe('CATEGORIES_TO_NUMBER', () => {

            });
        });

        describe('notEquals', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                testValue('neq', 0, 0, 0);
                testValue('neq', 0, 1, 1);
                testValue('neq', 1, 0, 1);
                testValue('neq', 2, 2, 0);
                testValue('neq', 2, 3, 1);
            });

            describe('CATEGORIES_TO_NUMBER', () => {

            });
        });
    });

    function testValue (fn, param1, param2, expected) {
        it(`${fn}(${param1}, ${param2}) should return ${expected}`, () => {
            const actual = s[fn](param1, param2).value;
            expect(actual).toEqual(expected);
        });
    }

    function testEval (fn, param1, param2, expected, featureA, featureB) {
        it(`${fn}(${param1}, ${param2}).eval(featureA, featureB) should return ${expected}`, () => {
            const actual = s[fn](param1, param2).eval(featureA, featureB);
            expect(actual).toEqual(expected);
        });
    }
});
