import { Viz, expressions as s } from '../../src/index';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../src/errors/carto-validation-error';
import { regExpThatContains as thatContains } from '../../src/utils/util';

// Generic Style defaults
const DEFAULT_COLOR_EXPRESSION = s.rgb(0, 0, 0);
const DEFAULT_WIDTH_EXPRESSION = s.number(1);
const DEFAULT_STROKE_COLOR_EXPRESSION = s.rgb(0, 0, 0);
const DEFAULT_STROKE_WIDTH_EXPRESSION = s.number(0);
const DEFAULT_FILTER_EXPRESSION = s.constant(1);
const DEFAULT_ORDER_EXPRESSION = s.noOrder();
const DEFAULT_RESOLUTION = 1;

describe('api/viz', () => {
    describe('constructor', () => {
        describe('when parameter is a vizSpec object', () => {
            it('should set default viz values when no parameters are given', () => {
                const actual = new Viz();

                // Check returned object inherits from Viz
                expect(actual).toEqual(jasmine.any(Viz));
                // Check returned object properties
                expect(actual.color.eval()).toEqual(DEFAULT_COLOR_EXPRESSION.eval());
                expect(actual.width.eval()).toEqual(DEFAULT_WIDTH_EXPRESSION.eval());
                expect(actual.strokeColor.eval()).toEqual(DEFAULT_STROKE_COLOR_EXPRESSION.eval());
                expect(actual.strokeWidth.eval()).toEqual(DEFAULT_STROKE_WIDTH_EXPRESSION.eval());
                expect(actual.filter.eval()).toEqual(DEFAULT_FILTER_EXPRESSION.eval());
                expect(actual.order.expr).toEqual(DEFAULT_ORDER_EXPRESSION.expr);
                expect(actual.resolution).toEqual(DEFAULT_RESOLUTION);
            });

            it('should set default viz values when an empty object is given', () => {
                const actual = new Viz({});

                expect(actual).toEqual(jasmine.any(Viz));
                expect(actual.color.eval()).toEqual(DEFAULT_COLOR_EXPRESSION.eval());
                expect(actual.width.eval()).toEqual(DEFAULT_WIDTH_EXPRESSION.eval());
                expect(actual.strokeColor.eval()).toEqual(DEFAULT_STROKE_COLOR_EXPRESSION.eval());
                expect(actual.strokeWidth.eval()).toEqual(DEFAULT_STROKE_WIDTH_EXPRESSION.eval());
                expect(actual.filter.eval()).toEqual(DEFAULT_FILTER_EXPRESSION.eval());
                expect(actual.order.expr).toEqual(DEFAULT_ORDER_EXPRESSION.expr);
                expect(actual.resolution).toEqual(DEFAULT_RESOLUTION);
            });

            it('should set the viz properties defined in the vizSpec object', () => {
                const vizSpec = {
                    color: s.rgba(255, 0, 0, 1),
                    width: s.number(10),
                    strokeColor: s.rgba(0, 0, 255, 1),
                    strokeWidth: s.number(15),
                    filter: s.number(0.5),
                    order: s.asc(s.width()),
                    resolution: 2
                };
                const actual = new Viz(vizSpec);

                expect(actual).toEqual(jasmine.any(Viz));
                expect(actual.color.eval()).toEqual(s.rgba(255, 0, 0, 1).eval());
                expect(actual.width.eval()).toEqual(s.number(10).eval());
                expect(actual.strokeColor.eval()).toEqual(s.rgba(0, 0, 255, 1).eval());
                expect(actual.strokeWidth.eval()).toEqual(s.number(15).eval());
                expect(actual.filter.eval()).toEqual(s.number(0.5).eval());
                expect(actual.order.expr).toEqual(s.asc(s.width()).expr);
                expect(actual.resolution).toEqual(2);
            });

            it('should allow the viz properties `width` and `strokeWidth` to be numbers', () => {
                const actual = new Viz({
                    width: 1,
                    strokeWidth: 10
                });

                expect(actual).toEqual(jasmine.any(Viz));
                expect(actual.width.eval()).toEqual(s.number(1).eval());
                expect(actual.strokeWidth.eval()).toEqual(s.number(10).eval());
            });
        });

        describe('when parameter is invalid', () => {
            it('should throw an error when parameter is not an object neither a string', function () {
                expect(function () {
                    new Viz(1234);
                }).toThrowError(CartoValidationError, thatContains(cvt.INCORRECT_VALUE + ' viz \'definition\' should be a vizSpec object or a valid viz string.'));
            });

            it('should throw an error when resolution is not a number', () => {
                const vizSpec = {
                    resolution: false // wrong type!
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError(CartoValidationError, cvt.INCORRECT_TYPE + ' \'resolution\' property must be a number.');
            });

            it('should throw an error when resolution is too small', () => {
                const vizSpec = {
                    resolution: 0
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError(CartoValidationError, cvt.INCORRECT_VALUE + ' \'resolution\' must be greater than 0.');
            });

            it('should throw an error when resolution is too big', () => {
                const vizSpec = {
                    resolution: 10000
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError(CartoValidationError, cvt.INCORRECT_VALUE + ' \'resolution\' must be less than 256.');
            });

            it('should throw an error when color is not a valid expression', () => {
                const vizSpec = {
                    color: 'red' // wrong type!
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError(CartoValidationError, thatContains(cvt.INCORRECT_TYPE + ' \'color\''));
            });

            it('should throw an error when width is not a valid expression', () => {
                const vizSpec = {
                    width: true // wrong type!
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError(CartoValidationError, thatContains(cvt.INCORRECT_TYPE + ' \'width\''));
            });

            it('should throw an error when strokeColor is not a valid expression', () => {
                const vizSpec = {
                    strokeColor: 'red' // wrong type!
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError(CartoValidationError, thatContains(cvt.INCORRECT_TYPE + ' \'strokeColor\''));
            });

            it('should throw an error when strokeWidth is not a valid expression', () => {
                const vizSpec = {
                    strokeWidth: true // wrong type!
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError(CartoValidationError, thatContains(cvt.INCORRECT_TYPE + ' \'strokeWidth\''));
            });

            it('should throw an error when order is not a valid expression', () => {
                const vizSpec = {
                    order: 10 // wrong type!
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError(CartoValidationError, thatContains(cvt.INCORRECT_TYPE + ' \'order\''));
            });

            it('should add a console.warn when non supported properties are included', () => {
                const vizSpec = {
                    notSupported: s.number(5)
                };
                spyOn(console, 'warn');
                new Viz(vizSpec);
                expect(console.warn).toHaveBeenCalledWith('Property \'notSupported\' is not supported');
            });
        });

        describe('when parameter is a string', () => {
            it('should set the viz properties defined in the string', () => {
                const vizSpec = `
                    color: rgba(255, 0, 0, 1)
                    width: number(10)
                    strokeColor: rgba(0, 0, 255, 1)
                    strokeWidth: number(15)
                    filter: 0.5
                    order: asc(width())
                    resolution: 1
                `;
                const actual = new Viz(vizSpec);

                expect(actual).toEqual(jasmine.any(Viz));
                expect(actual.color.eval()).toEqual(s.rgba(255, 0, 0, 1).eval());
                expect(actual.width.eval()).toEqual(s.number(10).eval());
                expect(actual.strokeColor.eval()).toEqual(s.rgba(0, 0, 255, 1).eval());
                expect(actual.strokeWidth.eval()).toEqual(s.number(15).eval());
                expect(actual.filter.eval()).toEqual(s.number(0.5).eval());
                expect(actual.order.expr).toEqual(s.asc(s.width()).expr);
                expect(actual.resolution).toEqual(1);
            });
        });
    });

    describe('expression.blendTo()', () => {
        const dateNow = Date.now;
        afterEach(function () {
            Date.now = dateNow;
        });
        it('should notify the viz on change', done => {
            const numberA = s.number(1);
            const numberB = s.number(2);
            const expected = s.gt(s.property('fake_property'), numberA);
            const viz = new Viz({
                filter: expected
            });
            viz.onChange(done);
            numberA.blendTo(numberB, 10);
        }, 10);
        it('should notify the viz after the final blending', done => {
            const numberA = s.number(1);
            const numberB = s.number(2);
            const expected = s.gt(7, numberA);
            const viz = new Viz({
                filter: expected
            });
            numberA.blendTo(numberB, 999);
            viz.onChange(() => {
                done();
                return Promise.resolve(null);
            });
            const t = Date.now() + 1000;
            Date.now = () => t;
            viz.filter._preDraw(null, {}, { uniform1f: () => { } });
        }, 10);
    });

    describe('resolution changes', () => {
        it('should be effective and notify observers', done => {
            const viz = new Viz();
            viz.onChange(() => {
                done();
                return Promise.resolve(null);
            });
            viz.resolution = 8;
            expect(viz.resolution).toEqual(8);
        });
    });

    describe('variables', () => {
        it('should work with numbers', () => {
            let viz = new Viz('@a: 1');
            expect(viz.variables.a.value).toEqual(1);
            viz = new Viz({ variables: { a: s.number(1) } });
            expect(viz.variables.a.value).toEqual(1);
            viz = new Viz({ variables: { a: 1 } }); // Implicit cast
            expect(viz.variables.a.value).toEqual(1);
        });

        it('should work with arrays of numbers', () => {
            let viz = new Viz('@a: [1,2,3]');
            viz._getRootExpressions().forEach(expr => expr._bindMetadata({}));
            expect(viz.variables.a.value).toEqual([1, 2, 3]);

            viz = new Viz({ variables: { a: s.list([1, 2, 3]) } });
            viz._getRootExpressions().forEach(expr => expr._bindMetadata({}));
            expect(viz.variables.a.value).toEqual([1, 2, 3]);

            viz = new Viz({ variables: { a: [1, 2, 3] } }); // Implicit cast
            viz._getRootExpressions().forEach(expr => expr._bindMetadata({}));
            expect(viz.variables.a.value).toEqual([1, 2, 3]);
        });

        it('should work with numeric expressions', () => {
            let viz = new Viz('@a: sin(PI / (1 + log(E)))');
            expect(viz.variables.a.value).toEqual(1);
            viz = new Viz({ variables: { a: s.sin(s.div(s.PI, s.add(1, s.log(s.E)))) } });
            expect(viz.variables.a.value).toEqual(1);
        });

        it('should work with other variables', () => {
            let viz = new Viz('@a: [@v, 2, 3] @v: 1');
            viz._getRootExpressions().forEach(expr => expr._bindMetadata({}));
            expect(viz.variables.v.value).toEqual(1);
            expect(viz.variables.a.value).toEqual([1, 2, 3]);

            viz = new Viz({ variables: { a: s.list([s.var('v'), 2, 3]), v: s.number(1) } });
            viz._getRootExpressions().forEach(expr => expr._bindMetadata({}));
            expect(viz.variables.v.value).toEqual(1);
            expect(viz.variables.a.value).toEqual([1, 2, 3]);

            viz = new Viz({ variables: { a: [1, 2, 3], v: 1 } });
            viz._getRootExpressions().forEach(expr => expr._bindMetadata({}));
            expect(viz.variables.v.value).toEqual(1);
            expect(viz.variables.a.value).toEqual([1, 2, 3]);
        });

        it('should work with strings', () => {
            let viz = new Viz('@a: "Hello"');
            expect(viz.variables.a.value).toEqual('Hello');
            viz = new Viz({ variables: { a: s.category('Hello') } });
            expect(viz.variables.a.value).toEqual('Hello');
            viz = new Viz({ variables: { a: 'Hello' } }); // Implicit cast
            expect(viz.variables.a.value).toEqual('Hello');
        });

        it('should work with arrays of strings', () => {
            let viz = new Viz('@a: ["a","b","c"]');
            viz._getRootExpressions().forEach(expr => expr._bindMetadata({}));
            expect(viz.variables.a.value).toEqual(['a', 'b', 'c']);

            viz = new Viz({ variables: { a: s.list(['a', 'b', 'c']) } });
            viz._getRootExpressions().forEach(expr => expr._bindMetadata({}));
            expect(viz.variables.a.value).toEqual(['a', 'b', 'c']);

            viz = new Viz({ variables: { a: ['a', 'b', 'c'] } }); // Implicit cast
            viz._getRootExpressions().forEach(expr => expr._bindMetadata({}));
            expect(viz.variables.a.value).toEqual(['a', 'b', 'c']);
        });

        it('should work with colors', () => {
            let viz = new Viz('@a: red');
            expect(viz.variables.a.value).toEqual({ r: 255, g: 0, b: 0, a: 1 });
            viz = new Viz({ variables: { a: s.namedColor('red') } });
            expect(viz.variables.a.value).toEqual({ r: 255, g: 0, b: 0, a: 1 });
        });

        it('should work with arrays of colors', () => {
            let viz = new Viz('@a: [red, lime, blue]');
            viz._getRootExpressions().forEach(expr => expr._bindMetadata({}));
            expect(viz.variables.a.value).toEqual([
                { r: 255, g: 0, b: 0, a: 1 },
                { r: 0, g: 255, b: 0, a: 1 },
                { r: 0, g: 0, b: 255, a: 1 }]);

            viz = new Viz({
                variables: {
                    a: s.list([
                        s.namedColor('red'),
                        s.namedColor('lime'),
                        s.namedColor('blue')])
                }
            });
            viz._getRootExpressions().forEach(expr => expr._bindMetadata({}));
            expect(viz.variables.a.value).toEqual([
                { r: 255, g: 0, b: 0, a: 1 },
                { r: 0, g: 255, b: 0, a: 1 },
                { r: 0, g: 0, b: 255, a: 1 }]);

            viz = new Viz({
                variables: {
                    a: [
                        s.namedColor('red'),
                        s.namedColor('lime'),
                        s.namedColor('blue')]
                }
            }); // Implicit cast
            viz._getRootExpressions().forEach(expr => expr._bindMetadata({}));
            expect(viz.variables.a.value).toEqual([
                { r: 255, g: 0, b: 0, a: 1 },
                { r: 0, g: 255, b: 0, a: 1 },
                { r: 0, g: 0, b: 255, a: 1 }]);
        });

        it('should work with dates', () => {
            let viz = new Viz('@a: date("2022-03-09T00:00:00Z")');
            expect(viz.variables.a.value).toEqual(new Date('2022-03-09T00:00:00Z'));
            viz = new Viz({ variables: { a: s.date('2022-03-09T00:00:00Z') } });
            expect(viz.variables.a.value).toEqual(new Date('2022-03-09T00:00:00Z'));
        });

        it('should work with arrays of dates', () => {
            let viz = new Viz('@a: [date("2022-03-09T00:00:00Z")]');
            viz._getRootExpressions().forEach(expr => expr._bindMetadata({}));
            expect(viz.variables.a.value).toEqual([new Date('2022-03-09T00:00:00Z')]);

            viz = new Viz({ variables: { a: s.list(s.date('2022-03-09T00:00:00Z')) } });
            viz._getRootExpressions().forEach(expr => expr._bindMetadata({}));
            expect(viz.variables.a.value).toEqual([new Date('2022-03-09T00:00:00Z')]);
        });

        it('should throw an error when the graph is not a DAG', () => {
            expect(() => new Viz(`width: ramp(linear($numeric, 0, 10), [0.10,0.20,0.30]) * __cartovl_variable_ten
                __cartovl_variable_oneHundred: __cartovl_variable_ten * __cartovl_variable_ten
                __cartovl_variable_ten: __cartovl_variable_oneHundred / 10
            `)).toThrowError('Viz contains a circular dependency');
        });
    });
});
