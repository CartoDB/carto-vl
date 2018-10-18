import * as s from '../../../../../src/renderer/viz/expressions';
import { validateTypeErrors, validateStaticType, validateMaxArgumentsError } from './utils';

// Add custom toString function to improve test output.
s.TRUE.toString = () => 's.TRUE';
s.FALSE.toString = () => 's.FALSE';

describe('src/renderer/viz/expressions/unary', () => {
    describe('error control', () => {
        describe('Signature NUMBERS_TO_NUMBER', () => {
            validateTypeErrors('sin', ['category']);
            validateTypeErrors('sin', ['color']);

            validateMaxArgumentsError('sin', ['number', 'number']);
            validateMaxArgumentsError('ceil', ['number', 'number']);
            validateMaxArgumentsError('log', ['number', 'number']);
            validateMaxArgumentsError('cos', ['number', 'number']);
            validateMaxArgumentsError('sqrt', ['number', 'number']);
            validateMaxArgumentsError('tan', ['number', 'number']);
            validateMaxArgumentsError('sign', ['number', 'number']);
            validateMaxArgumentsError('abs', ['number', 'number']);
            validateMaxArgumentsError('isNull', ['number', 'number']);
            validateMaxArgumentsError('not', ['number', 'number']);
            validateMaxArgumentsError('floor', ['number', 'number']);
        });
    });

    describe('type', () => {
        describe('Signature NUMBERS_TO_NUMBER', () => {
            validateStaticType('sin', ['number'], 'number');
        });
    });

    describe('log', () => {
        test('log', 1, 0);
        test('log', Math.E, 1);
    });

    describe('sqrt', () => {
        test('sqrt', 1, 1);
        test('sqrt', 256, 16);
        test('sqrt', -256, NaN);
    });

    describe('sin', () => {
        test('sin', 0, 0);
        test('sin', Math.PI / 2, 1);
        test('sin', 3 * Math.PI / 2, -1);
    });

    describe('cos', () => {
        test('cos', 0, 1);
        test('cos', Math.PI, -1);
        test('cos', Math.PI / 2, 6.123233995736766e-17);
        test('cos', 3 * Math.PI / 2, -1.8369701987210297e-16);
    });

    describe('tan', () => {
        test('tan', Math.PI / 4, 0.9999999999999999);
    });

    describe('sign', () => {
        test('sign', 10, 1);
        test('sign', -10, -1);
        test('sign', 0, 0);
        test('sign', -0, -0);
    });

    describe('abs', () => {
        test('abs', 10, 10);
        test('abs', -10, 10);
        test('abs', 0, 0);
    });

    describe('not', () => {
        test('not', 0, 1);
        test('not', 1, 0);
        test('not', s.TRUE, 0);
        test('not', s.FALSE, 1);
    });

    describe('isNull', () => {
        test('isNull', 0, 0);
        test('isNull', 1.23, 0);
        test('isNull', s.TRUE, 0);
        test('isNull', s.FALSE, 0);
        test('isNull', { eval: () => null }, 1);
    });

    // Helper function to test binary expressions
    function test (fn, param1, expected) {
        it(`${fn}(${param1}) should return ${expected}`, () => {
            let actual = s[fn](param1).eval();
            expect(actual).toEqual(expected);
            actual = s[fn](param1).value;
            expect(actual).toEqual(expected);
        });
    }
});
