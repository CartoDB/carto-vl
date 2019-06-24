import * as s from '../../../../../src/renderer/viz/expressions';
import { validateDynamicType, validateMaxArgumentsError, validateTypeErrors } from './utils';
import Metadata from '../../../../../src/renderer/Metadata';

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

    describe('.value', () => {
        function testValue (fn, param1, param2, expected) {
            it(`${fn}(${param1}, ${param2}) should return ${expected}`, () => {
                const actual = s[fn](param1, param2).value;
                expect(actual).toEqual(expected);
            });
        }

        describe('mul', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                testValue('mul', 0, 0, 0);
                testValue('mul', 1, 0, 0);
                testValue('mul', 1, 1, 1);
                testValue('mul', 1, 2, 2);
                testValue('mul', -1, 2, -2);
            });

            describe('NUMBER_AND_COLOR_TO_COLOR', () => {
                testValue('mul', 10, s.rgba(255, 15, 12, 1), { r: 10, g: 1, b: 0, a: 1 });
                testValue('mul', s.rgba(255, 15, 12, 1), 10, { r: 10, g: 1, b: 0, a: 1 });
            });

            describe('COLORS_TO_COLOR', () => {
                testValue('mul', s.rgba(255, 15, 12, 1), s.rgba(35, 20, 240, 1), { r: 35, g: 1, b: 11, a: 1 });
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
                testValue('add', s.rgba(255, 15, 12, 1), s.rgba(35, 20, 240, 1), { r: 255, g: 35, b: 252, a: 1 });
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
                testValue('sub', s.rgba(255, 15, 12, 1), s.rgba(35, 20, 240, 1), { r: 220, g: 0, b: 0, a: 1 });
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
                testValue('eq', '0', '0', 1);
                testValue('eq', '0', '1', 0);
                testValue('eq', '1', '0', 0);
                testValue('eq', '2', '2', 1);
                testValue('eq', '2', '3', 0);
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
                testValue('neq', '0', '0', 0);
                testValue('neq', '0', '1', 1);
                testValue('neq', '1', '0', 1);
                testValue('neq', '2', '2', 0);
                testValue('neq', '2', '3', 1);
            });
        });
    });

    describe('.eval', () => {
        const METADATA = new Metadata({
            properties: {
                color: {
                    type: 'category',
                    categories: [
                        { name: 'red' },
                        { name: 'blue' }
                    ]
                }
            }
        });

        function testEval (fn, param1, param2, features, expected) {
            it(`${fn}(${param1}, ${param2}).eval(featureA, featureB) should return ${expected}`, () => {
                const actual = s[fn](param1, param2).eval(...features);
                expect(actual).toEqual(expected);
            });
        }

        describe('mul', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                const featureA = { a: 1 };
                const featureB = { b: 2 };
                const featureC = { a: 2, c: 5 };

                testEval('mul', s.prop('a'), s.prop('b'), [featureA, featureB], 2);
                testEval('mul', 2, s.prop('b'), [featureB], 4);
                testEval('mul', s.prop('b'), 2, [featureB], 4);
                testEval('mul', s.prop('a'), s.prop('c'), [featureC], 10);
            });

            describe('NUMBER_AND_COLOR_TO_COLOR', () => {
                const featureA = { color: 'red' };
                const ramp = s.ramp(s.buckets(s.prop('color'), ['red']), [s.rgba(255, 15, 12, 1)]);

                ramp._bindMetadata(METADATA);

                testEval('mul', 10, ramp, [featureA], { r: 10, g: 1, b: 0, a: 1 });
                testEval('mul', ramp, 10, [featureA], { r: 10, g: 1, b: 0, a: 1 });
            });

            describe('COLORS_TO_COLOR', () => {
                const featureA = { color: 'red' };
                const featureB = { color: 'blue' };
                const rampA = s.ramp(s.buckets(s.prop('color'), ['red']), [s.rgba(255, 15, 12, 1)]);
                const rampB = s.ramp(s.buckets(s.prop('color'), ['blue']), [s.rgba(35, 20, 240, 1)]);

                rampA._bindMetadata(METADATA);
                rampB._bindMetadata(METADATA);

                testEval('mul', rampA, rampB, [featureA, featureB], { r: 35, g: 1, b: 11, a: 1 });
            });
        });

        describe('div', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                const featureA = { a: 1 };
                const featureB = { b: 2 };
                const featureC = { a: 8, c: 4 };

                testEval('div', s.prop('a'), s.prop('b'), [featureA, featureB], 0.5);
                testEval('div', 2, s.prop('b'), [featureB], 1);
                testEval('div', s.prop('b'), 2, [featureB], 1);
                testEval('div', s.prop('a'), s.prop('c'), [featureC], 2);
            });

            describe('NUMBER_AND_COLOR_TO_COLOR', () => {
                const featureA = { color: 'red' };
                const ramp = s.ramp(s.buckets(s.prop('color'), ['red']), [s.rgba(255, 15, 12, 1)]);

                ramp._bindMetadata(METADATA);

                testEval('div', 10, ramp, [featureA], { r: 26, g: 2, b: 1, a: 1 });
                testEval('div', ramp, 10, [featureA], { r: 26, g: 2, b: 1, a: 1 });
            });

            describe('COLORS_TO_COLOR', () => {
                const featureA = { color: 'red' };
                const featureB = { color: 'blue' };
                const rampA = s.ramp(s.buckets(s.prop('color'), ['red']), [s.rgba(255, 15, 12, 1)]);
                const rampB = s.ramp(s.buckets(s.prop('color'), ['blue']), [s.rgba(35, 20, 240, 1)]);

                rampA._bindMetadata(METADATA);
                rampB._bindMetadata(METADATA);

                testEval('div', rampA, rampB, [featureA, featureB], { r: 7, g: 1, b: 0, a: 1 });
            });
        });

        describe('add', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                const featureA = { a: 1 };
                const featureB = { b: 2 };
                const featureC = { a: 8, c: 4 };

                testEval('add', s.prop('a'), s.prop('b'), [featureA, featureB], 3);
                testEval('add', 2, s.prop('b'), [featureB], 4);
                testEval('add', s.prop('b'), 2, [featureB], 4);
                testEval('add', s.prop('a'), s.prop('c'), [featureC], 12);
            });

            describe('COLORS_TO_COLOR', () => {
                const featureA = { color: 'red' };
                const featureB = { color: 'blue' };

                const rampA = s.ramp(s.buckets(s.prop('color'), ['red']), [s.rgba(255, 15, 12, 1)]);
                const rampB = s.ramp(s.buckets(s.prop('color'), ['blue']), [s.rgba(35, 20, 240, 1)]);

                rampA._bindMetadata(METADATA);
                rampB._bindMetadata(METADATA);

                testEval('add', rampA, rampB, [featureA, featureB], { r: 255, g: 35, b: 252, a: 1 });
            });
        });

        describe('sub', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                const featureA = { a: 1 };
                const featureB = { b: 2 };
                const featureC = { a: 8, c: 4 };

                testEval('sub', s.prop('a'), s.prop('b'), [featureA, featureB], -1);
                testEval('sub', 2, s.prop('b'), [featureB], 0);
                testEval('sub', s.prop('b'), 2, [featureB], 0);
                testEval('sub', s.prop('a'), s.prop('c'), [featureC], 4);
            });

            describe('COLORS_TO_COLOR', () => {
                const featureA = { color: 'red' };
                const featureB = { color: 'blue' };

                const rampA = s.ramp(s.buckets(s.prop('color'), ['red']), [s.rgba(255, 15, 12, 1)]);
                const rampB = s.ramp(s.buckets(s.prop('color'), ['blue']), [s.rgba(35, 20, 240, 1)]);

                rampA._bindMetadata(METADATA);
                rampB._bindMetadata(METADATA);

                testEval('sub', rampA, rampB, [featureA, featureB], { r: 220, g: 0, b: 0, a: 1 });
            });
        });

        describe('mod', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                const featureA = { a: 1 };
                const featureB = { b: 2 };
                const featureC = { a: 8, c: 4 };

                testEval('mod', s.prop('a'), s.prop('b'), [featureA, featureB], 1);
                testEval('mod', 2, s.prop('b'), [featureB], 0);
                testEval('mod', s.prop('b'), 2, [featureB], 0);
                testEval('mod', s.prop('a'), s.prop('c'), [featureC], 0);
            });
        });

        describe('pow', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                const featureA = { a: 1 };
                const featureB = { b: 2 };
                const featureC = { a: 8, c: 4 };

                testEval('pow', s.prop('a'), s.prop('b'), [featureA, featureB], 1);
                testEval('pow', 2, s.prop('b'), [featureB], 4);
                testEval('pow', s.prop('b'), 2, [featureB], 4);
                testEval('pow', s.prop('a'), s.prop('c'), [featureC], 4096);
            });
        });

        describe('or', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                const featureA = { a: 0 };
                const featureB = { b: 1 };
                const featureC = { a: 0.5, c: 4 };

                testEval('or', s.prop('a'), s.prop('b'), [featureA, featureB], 1);
                testEval('or', 2, s.prop('b'), [featureB], 1);
                testEval('or', s.prop('b'), 2, [featureB], 1);
                testEval('or', s.prop('a'), s.prop('c'), [featureC], 1);
            });
        });

        describe('and', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                const featureA = { a: true };
                const featureB = { b: false };
                const featureC = { a: true, c: true };

                testEval('and', s.prop('a'), s.prop('b'), [featureA, featureB], 0);
                testEval('and', s.FALSE, s.prop('b'), [featureB], 0);
                testEval('and', s.prop('b'), s.TRUE, [featureB], 0);
                testEval('and', s.prop('a'), s.prop('c'), [featureC], 1);
            });
        });

        describe('greaterThan', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                const featureA = { a: 0 };
                const featureB = { b: 10 };
                const featureC = { a: 5, c: 20 };

                testEval('gt', s.prop('a'), s.prop('b'), [featureA, featureB], 0);
                testEval('gt', 15, s.prop('b'), [featureB], 1);
                testEval('gt', s.prop('b'), 10, [featureB], 0);
                testEval('gt', s.prop('c'), s.prop('a'), [featureC], 1);
            });
        });

        describe('greaterThanOrEqualTo', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                const featureA = { a: 0 };
                const featureB = { b: 10 };
                const featureC = { a: 5, c: 5 };

                testEval('gte', s.prop('a'), s.prop('b'), [featureA, featureB], 0);
                testEval('gte', 15, s.prop('b'), [featureB], 1);
                testEval('gte', s.prop('b'), 10, [featureB], 1);
                testEval('gte', s.prop('c'), s.prop('a'), [featureC], 1);
            });
        });

        describe('lessThan', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                const featureA = { a: 0 };
                const featureB = { b: 10 };
                const featureC = { a: 5, c: 20 };

                testEval('lt', s.prop('a'), s.prop('b'), [featureA, featureB], 1);
                testEval('lt', 15, s.prop('b'), [featureB], 0);
                testEval('lt', s.prop('b'), 10, [featureB], 0);
                testEval('lt', s.prop('c'), s.prop('a'), [featureC], 0);
            });
        });

        describe('lessThanOrEqualTo', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                const featureA = { a: 0 };
                const featureB = { b: 10 };
                const featureC = { a: 5, c: 20 };

                testEval('lte', s.prop('a'), s.prop('b'), [featureA, featureB], 1);
                testEval('lte', 15, s.prop('b'), [featureB], 0);
                testEval('lte', s.prop('b'), 10, [featureB], 1);
                testEval('lte', s.prop('c'), s.prop('a'), [featureC], 0);
            });
        });

        describe('equals', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                const featureA = { a: 0 };
                const featureB = { b: 10 };
                const featureC = { a: 5, c: 5 };

                testEval('eq', s.prop('a'), s.prop('b'), [featureA, featureB], 0);
                testEval('eq', 15, s.prop('b'), [featureB], 0);
                testEval('eq', s.prop('b'), 10, [featureB], 1);
                testEval('eq', s.prop('c'), s.prop('a'), [featureC], 1);
            });

            describe('CATEGORIES_TO_NUMBER', () => {
                const featureA = { a: 'a' };
                const featureB = { b: 'b' };
                const featureC = { a: 'a', c: 'c' };

                testEval('eq', s.prop('a'), s.prop('b'), [featureA, featureB], 0);
                testEval('eq', 'c', s.prop('b'), [featureB], 0);
                testEval('eq', s.prop('b'), 'b', [featureB], 1);
                testEval('eq', s.prop('c'), s.prop('a'), [featureC], 0);
            });
        });

        describe('notEquals', () => {
            describe('NUMBERS_TO_NUMBER', () => {
                const featureA = { a: 0 };
                const featureB = { b: 10 };
                const featureC = { a: 5, c: 5 };

                testEval('neq', s.prop('a'), s.prop('b'), [featureA, featureB], 1);
                testEval('neq', 15, s.prop('b'), [featureB], 1);
                testEval('neq', s.prop('b'), 10, [featureB], 0);
                testEval('neq', s.prop('c'), s.prop('a'), [featureC], 0);
            });

            describe('CATEGORIES_TO_NUMBER', () => {
                const featureA = { a: 'a' };
                const featureB = { b: 'b' };
                const featureC = { a: 'a', c: 'c' };

                testEval('neq', s.prop('a'), s.prop('b'), [featureA, featureB], 1);
                testEval('neq', 'c', s.prop('b'), [featureB], 1);
                testEval('neq', s.prop('b'), 'b', [featureB], 0);
                testEval('neq', s.prop('c'), s.prop('a'), [featureC], 1);
            });
        });
    });
});
