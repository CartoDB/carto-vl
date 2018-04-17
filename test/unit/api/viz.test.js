import Viz from '../../../src/api/viz';
import * as s from '../../../src/core/viz/functions';

describe('api/viz', () => {

    describe('constructor', () => {
        describe('when parameter is a vizSpec object', () => {
            it('should set default viz values when no parameters are given', () => {
                const actual = new Viz();

                // Check returned object inherits from Viz
                expect(actual).toEqual(jasmine.any(Viz));
                // Check returned object properties
                expect(actual.getResolution()).toEqual(1);
                expect(actual.getColor().eval()).toEqual(s.rgba(0, 255, 0, 0.5).eval());
                expect(actual.getWidth().eval()).toEqual(s.float(5).eval());
                expect(actual.getStrokeColor().eval()).toEqual(s.rgba(0, 255, 0, 0.5).eval());
                expect(actual.getStrokeWidth().eval()).toEqual(s.float(0).eval());
                expect(actual.getOrder().expr).toEqual(s.noOrder().expr);
            });

            it('should set default viz values when an empty object is given', () => {
                const actual = new Viz({});

                expect(actual).toEqual(jasmine.any(Viz));
                expect(actual.getResolution()).toEqual(1);
                expect(actual.getColor().eval()).toEqual(s.rgba(0, 255, 0, 0.5).eval());
                expect(actual.getWidth().eval()).toEqual(s.float(5).eval());
                expect(actual.getStrokeColor().eval()).toEqual(s.rgba(0, 255, 0, 0.5).eval());
                expect(actual.getStrokeWidth().eval()).toEqual(s.float(0).eval());
                expect(actual.getOrder().expr).toEqual(s.noOrder().expr);
            });

            it('should set the viz properties defined in the vizSpec object', () => {
                const vizSpec = {
                    resolution: 2,
                    color: s.rgba(255, 0, 0, 1),
                    width: s.float(10),
                    strokeColor: s.rgba(0, 0, 255, 1),
                    strokeWidth: s.float(15),
                    order: s.asc(s.width())
                };
                const actual = new Viz(vizSpec);

                expect(actual).toEqual(jasmine.any(Viz));
                expect(actual.getResolution()).toEqual(2);
                expect(actual.getColor().eval()).toEqual(s.rgba(255, 0, 0, 1).eval());
                expect(actual.getWidth().eval()).toEqual(s.float(10).eval());
                expect(actual.getStrokeColor().eval()).toEqual(s.rgba(0, 0, 255, 1).eval());
                expect(actual.getStrokeWidth().eval()).toEqual(s.float(15).eval());
                expect(actual.getOrder().expr).toEqual(s.asc(s.width()).expr);
            });

            it('should allow the viz properties `width` and `strokeWidth` to be numbers', () => {
                const actual = new Viz({
                    width: 1,
                    strokeWidth: 10
                });

                expect(actual).toEqual(jasmine.any(Viz));
                expect(actual.getWidth().eval()).toEqual(s.float(1).eval());
                expect(actual.getStrokeWidth().eval()).toEqual(s.float(10).eval());
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
                    notSupported: s.float(5)
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
                    width: float(10)
                    strokeColor: rgba(0, 0, 255, 1)
                    strokeWidth: float(15)
                    order: asc(width())
                `;
                const actual = new Viz(vizSpec);

                expect(actual).toEqual(jasmine.any(Viz));
                expect(actual.getResolution()).toEqual(1);
                expect(actual.getColor().eval()).toEqual(s.rgba(255, 0, 0, 1).eval());
                expect(actual.getWidth().eval()).toEqual(s.float(10).eval());
                expect(actual.getStrokeColor().eval()).toEqual(s.rgba(0, 0, 255, 1).eval());
                expect(actual.getStrokeWidth().eval()).toEqual(s.float(15).eval());
                expect(actual.getOrder().expr).toEqual(s.asc(s.width()).expr);
            });
        });
    });

    describe('expression.blendTo()', () => {
        const dateNow = Date.now;
        afterEach(function () {
            Date.now = dateNow;
        });
        it('should return the new/final expression', () => {
            const float = s.float(1);
            const floatB = s.float(2);
            const expected = s.gt(s.property('fake_property'), float);
            new Viz({
                filter: expected,
            });

            const final = float.blendTo(floatB, 10);
            expect(final).toBe(floatB);
        });
        it('should notify the viz on change', done => {
            const float = s.float(1);
            const floatB = s.float(2);
            const expected = s.gt(s.property('fake_property'), float);
            const viz = new Viz({
                filter: expected,
            });
            viz.onChange(done);
            float.blendTo(floatB, 10);
        }, 10);
        it('should notify the viz after the final blending', done => {
            const float = s.float(1);
            const floatB = s.float(2);
            const expected = s.gt(7, float);
            const viz = new Viz({
                filter: expected,
            });
            float.blendTo(floatB, 999);
            viz.onChange(done);
            const t = Date.now() + 1000;
            Date.now = () => t;
            viz.filter._preDraw(null, {}, { uniform1f: () => { } });
        }, 10);
    });

    describe('.getFilter()', () => {
        it('should return the current filter', () => {
            const expected = s.gt(s.property('fake_property'), 1000);
            const viz = new Viz({
                filter: expected,
            });

            const actual = viz.getFilter();

            expect(actual).toEqual(expected);
        });
    });

    describe('aliases', () => {
        it('should throw an error when the graph is not a DAG', () => {
            expect(()=>new Viz(`width: ramp(linear($numeric, 0, 10), [0.10,0.20,0.30]) * __cartovl_variable_ten
                __cartovl_variable_oneHundred: __cartovl_variable_ten * __cartovl_variable_ten
                __cartovl_variable_ten: __cartovl_variable_oneHundred / 10
            `)).toThrowError('Viz contains a circular dependency');
        });
    });
});
