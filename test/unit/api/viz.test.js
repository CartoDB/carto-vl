import Viz from '../../../src/api/viz';
import * as e from '../../../src/core/viz/functions';

// Generic Style defaults

const DEFAULT_COLOR_EXPRESSION = e.rgb(0, 0, 0);
const DEFAULT_WIDTH_EXPRESSION = e.number(1);
const DEFAULT_STROKE_COLOR_EXPRESSION = e.rgb(0, 0, 0);
const DEFAULT_STROKE_WIDTH_EXPRESSION = e.number(0);
const DEFAULT_FILTER_EXPRESSION = e.constant(1);
const DEFAULT_ORDER_EXPRESSION = e.noOrder();
const DEFAULT_RESOLUTION = 1;

describe('api/viz', () => {

    describe('constructor', () => {
        describe('when parameter is a vizSpec object', () => {
            it('should set default viz values when no parameters are given', () => {
                const actual = new Viz();

                // Check returned object inherits from Viz
                expect(actual).toEqual(jasmine.any(Viz));
                // Check returned object properties
                expect(actual.getColor().eval()).toEqual(DEFAULT_COLOR_EXPRESSION.eval());
                expect(actual.getWidth().eval()).toEqual(DEFAULT_WIDTH_EXPRESSION.eval());
                expect(actual.getStrokeColor().eval()).toEqual(DEFAULT_STROKE_COLOR_EXPRESSION.eval());
                expect(actual.getStrokeWidth().eval()).toEqual(DEFAULT_STROKE_WIDTH_EXPRESSION.eval());
                expect(actual.getFilter().eval()).toEqual(DEFAULT_FILTER_EXPRESSION.eval());
                expect(actual.getOrder().expr).toEqual(DEFAULT_ORDER_EXPRESSION.expr);
                expect(actual.getResolution()).toEqual(DEFAULT_RESOLUTION);
            });

            it('should set default viz values when an empty object is given', () => {
                const actual = new Viz({});

                expect(actual).toEqual(jasmine.any(Viz));
                expect(actual.getColor().eval()).toEqual(DEFAULT_COLOR_EXPRESSION.eval());
                expect(actual.getWidth().eval()).toEqual(DEFAULT_WIDTH_EXPRESSION.eval());
                expect(actual.getStrokeColor().eval()).toEqual(DEFAULT_STROKE_COLOR_EXPRESSION.eval());
                expect(actual.getStrokeWidth().eval()).toEqual(DEFAULT_STROKE_WIDTH_EXPRESSION.eval());
                expect(actual.getFilter().eval()).toEqual(DEFAULT_FILTER_EXPRESSION.eval());
                expect(actual.getOrder().expr).toEqual(DEFAULT_ORDER_EXPRESSION.expr);
                expect(actual.getResolution()).toEqual(DEFAULT_RESOLUTION);
            });

            it('should set the viz properties defined in the vizSpec object', () => {
                const vizSpec = {
                    color: e.rgba(255, 0, 0, 1),
                    width: e.number(10),
                    strokeColor: e.rgba(0, 0, 255, 1),
                    strokeWidth: e.number(15),
                    filter: e.number(0.5),
                    order: e.asc(e.width()),
                    resolution: 2
                };
                const actual = new Viz(vizSpec);

                expect(actual).toEqual(jasmine.any(Viz));
                expect(actual.getColor().eval()).toEqual(e.rgba(255, 0, 0, 1).eval());
                expect(actual.getWidth().eval()).toEqual(e.number(10).eval());
                expect(actual.getStrokeColor().eval()).toEqual(e.rgba(0, 0, 255, 1).eval());
                expect(actual.getStrokeWidth().eval()).toEqual(e.number(15).eval());
                expect(actual.getFilter().eval()).toEqual(e.number(0.5).eval());
                expect(actual.getOrder().expr).toEqual(e.asc(e.width()).expr);
                expect(actual.getResolution()).toEqual(2);
            });

            it('should allow the viz properties `width` and `strokeWidth` to be numbers', () => {
                const actual = new Viz({
                    width: 1,
                    strokeWidth: 10
                });

                expect(actual).toEqual(jasmine.any(Viz));
                expect(actual.getWidth().eval()).toEqual(e.number(1).eval());
                expect(actual.getStrokeWidth().eval()).toEqual(e.number(10).eval());
            });
        });

        describe('when parameter is invalid', () => {
            it('should throw an error when parameter is not an object neither a string', function () {
                expect(function () {
                    new Viz(1234);
                }).toThrowError('viz definition should be a vizSpec object or a valid viz string.');
            });

            it('should throw an error when resolution is not a number', () => {
                const vizSpec = {
                    resolution: false // wrong type!
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError('`resolution` must be a number.');
            });

            it('should throw an error when resolution is too small', () => {
                const vizSpec = {
                    resolution: 0
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError('`resolution` must be greater than 0.');
            });

            it('should throw an error when resolution is too big', () => {
                const vizSpec = {
                    resolution: 10000
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError('`resolution` must be less than 256.');
            });

            it('should throw an error when color is not a valid expression', () => {
                const vizSpec = {
                    color: 'red' // wrong type!
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError('`color` parameter is not a valid viz Expresion.');
            });

            it('should throw an error when width is not a valid expression', () => {
                const vizSpec = {
                    width: true // wrong type!
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError('`width` parameter is not a valid viz Expresion.');
            });

            it('should throw an error when strokeColor is not a valid expression', () => {
                const vizSpec = {
                    strokeColor: 'red' // wrong type!
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError('`strokeColor` parameter is not a valid viz Expresion.');
            });

            it('should throw an error when strokeWidth is not a valid expression', () => {
                const vizSpec = {
                    strokeWidth: true // wrong type!
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError('`strokeWidth` parameter is not a valid viz Expresion.');
            });

            it('should throw an error when order is not a valid expression', () => {
                const vizSpec = {
                    order: 10 // wrong type!
                };
                expect(function () {
                    new Viz(vizSpec);
                }).toThrowError('`order` parameter is not a valid viz Expresion.');
            });

            it('should add a console.warn when non supported properties are included', () => {
                const vizSpec = {
                    notSupported: e.number(5)
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
                expect(actual.getColor().eval()).toEqual(e.rgba(255, 0, 0, 1).eval());
                expect(actual.getWidth().eval()).toEqual(e.number(10).eval());
                expect(actual.getStrokeColor().eval()).toEqual(e.rgba(0, 0, 255, 1).eval());
                expect(actual.getStrokeWidth().eval()).toEqual(e.number(15).eval());
                expect(actual.getFilter().eval()).toEqual(e.number(0.5).eval());
                expect(actual.getOrder().expr).toEqual(e.asc(e.width()).expr);
                expect(actual.getResolution()).toEqual(1);
            });
        });
    });

    describe('expression.blendTo()', () => {
        const dateNow = Date.now;
        afterEach(function () {
            Date.now = dateNow;
        });
        it('should return the new/final expression', () => {
            const numberA = e.number(1);
            const numberB = e.number(2);
            const expected = e.gt(e.property('fake_property'), numberA);
            new Viz({
                filter: expected,
            });

            const final = numberA.blendTo(numberB, 10);
            expect(final).toBe(numberB);
        });
        it('should notify the viz on change', done => {
            const numberA = e.number(1);
            const numberB = e.number(2);
            const expected = e.gt(e.property('fake_property'), numberA);
            const viz = new Viz({
                filter: expected,
            });
            viz.onChange(done);
            numberA.blendTo(numberB, 10);
        }, 10);
        it('should notify the viz after the final blending', done => {
            const numberA = e.number(1);
            const numberB = e.number(2);
            const expected = e.gt(7, numberA);
            const viz = new Viz({
                filter: expected,
            });
            numberA.blendTo(numberB, 999);
            viz.onChange(done);
            const t = Date.now() + 1000;
            Date.now = () => t;
            viz.filter._preDraw(null, {}, { uniform1f: () => { } });
        }, 10);
    });

    describe('.getFilter()', () => {
        it('should return the current filter', () => {
            const expected = e.gt(e.property('fake_property'), 1000);
            const viz = new Viz({
                filter: expected,
            });

            const actual = viz.getFilter();

            expect(actual).toEqual(expected);
        });
    });

    describe('resolution changes', () => {
        it('should be effective and notify observers', done => {
            const viz = new Viz();
            viz.onChange(done);
            viz.resolution = 8;
            expect(viz.resolution).toEqual(8);
        });
    });

    fdescribe('variables', () => {
        it('should work with numbers', () => {
            let viz = new Viz('@a: 1');
            expect(viz.variables.a.eval()).toEqual(1);
            viz = new Viz({ variables: { a: e.number(1) } });
            expect(viz.variables.a.eval()).toEqual(1);
        });

        it('should work with arrays of numbers', () => {
            let viz = new Viz('@a: [1,2,3]');
            expect(viz.variables.a.eval()).toEqual([1,2,3]);
            viz = new Viz({ variables: { a: e.array([1,2,3]) } });
            expect(viz.variables.a.eval()).toEqual([1,2,3]);
        });

        it('should work with numeric expressions', () => {
            let viz = new Viz('@a: sin(PI / (1 + log(E)))');
            expect(viz.variables.a.eval()).toEqual(1);
            viz = new Viz({ variables: { a: e.sin(e.div(e.PI, e.add(1, e.log(e.E)))) } });
            expect(viz.variables.a.eval()).toEqual(1);
        });

        it('should work with strings', () => {
            let viz = new Viz('@a: "Hello"');
            expect(viz.variables.a.eval()).toEqual('Hello');
            viz = new Viz({ variables: { a: e.string('Hello') } });
            expect(viz.variables.a.eval()).toEqual('Hello');
        });

        it('should work with colors', () => {
            let viz = new Viz('@a: red');
            expect(viz.variables.a.eval()).toEqual({r: 255, g: 0, b: 0, a: 1});
            viz = new Viz({ variables: { a: e.namedColor('red') } });
            expect(viz.variables.a.eval()).toEqual({r: 255, g: 0, b: 0, a: 1});
        });

        it('should work with dates', () => {
            let viz = new Viz('@a: date("2022-03-09T00:00:00Z")');
            expect(viz.variables.a.eval()).toEqual(new Date('2022-03-09T00:00:00Z'));
            viz = new Viz({ variables: { a: e.date('2022-03-09T00:00:00Z') } });
            expect(viz.variables.a.eval()).toEqual(new Date('2022-03-09T00:00:00Z'));
        });

        it('should throw an error when the graph is not a DAG', () => {
            expect(() => new Viz(`width: ramp(linear($numeric, 0, 10), [0.10,0.20,0.30]) * __cartovl_variable_ten
                __cartovl_variable_oneHundred: __cartovl_variable_ten * __cartovl_variable_ten
                __cartovl_variable_ten: __cartovl_variable_oneHundred / 10
            `)).toThrowError('Viz contains a circular dependency');
        });
    });
});
