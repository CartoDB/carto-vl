import Style from '../../../src/api/style';
import * as s from '../../../src/core/style/functions';

describe('api/style', () => {

    describe('constructor', () => {
        describe('when parameter is a styleSpec object', () => {
            it('should set default style values when no parameters are given', () => {
                const actual = new Style();

                // Check returned object inherits from Style
                expect(actual).toEqual(jasmine.any(Style));
                // Check returned object properties
                expect(actual.getResolution()).toEqual(1);
                expect(actual.getColor().eval()).toEqual(s.rgba(0, 255, 0, 0.5).eval());
                expect(actual.getWidth().eval()).toEqual(s.float(5).eval());
                expect(actual.getStrokeColor().eval()).toEqual(s.rgba(0, 255, 0, 0.5).eval());
                expect(actual.getStrokeWidth().eval()).toEqual(s.float(0).eval());
                expect(actual.getOrder().expr).toEqual(s.noOrder().expr);
            });

            it('should set default style values when an empty object is given', () => {
                const actual = new Style({});

                expect(actual).toEqual(jasmine.any(Style));
                expect(actual.getResolution()).toEqual(1);
                expect(actual.getColor().eval()).toEqual(s.rgba(0, 255, 0, 0.5).eval());
                expect(actual.getWidth().eval()).toEqual(s.float(5).eval());
                expect(actual.getStrokeColor().eval()).toEqual(s.rgba(0, 255, 0, 0.5).eval());
                expect(actual.getStrokeWidth().eval()).toEqual(s.float(0).eval());
                expect(actual.getOrder().expr).toEqual(s.noOrder().expr);
            });

            it('should set the style properties defined in the styleSpec object', () => {
                const styleSpec = {
                    resolution: 2,
                    color: s.rgba(255, 0, 0, 1),
                    width: s.float(10),
                    strokeColor: s.rgba(0, 0, 255, 1),
                    strokeWidth: s.float(15),
                    order: s.asc(s.width())
                };
                const actual = new Style(styleSpec);

                expect(actual).toEqual(jasmine.any(Style));
                expect(actual.getResolution()).toEqual(2);
                expect(actual.getColor().eval()).toEqual(s.rgba(255, 0, 0, 1).eval());
                expect(actual.getWidth().eval()).toEqual(s.float(10).eval());
                expect(actual.getStrokeColor().eval()).toEqual(s.rgba(0, 0, 255, 1).eval());
                expect(actual.getStrokeWidth().eval()).toEqual(s.float(15).eval());
                expect(actual.getOrder().expr).toEqual(s.asc(s.width()).expr);
            });

            it('should allow the style properties `width` and `strokeWidth` to be numbers', () => {
                const actual = new Style({
                    width: 1,
                    strokeWidth: 10
                });

                expect(actual).toEqual(jasmine.any(Style));
                expect(actual.getWidth().eval()).toEqual(s.float(1).eval());
                expect(actual.getStrokeWidth().eval()).toEqual(s.float(10).eval());
            });
        });

        describe('when parameter is invalid', () => {
            it('should throw an error when parameter is not an object neither a string', function () {
                expect(function () {
                    new Style(1234);
                }).toThrowError('style definition should be a styleSpec object or a valid style string.');
            });

            it('should throw an error when resolution is not a number', () => {
                const styleSpec = {
                    resolution: false // wrong type!
                };
                expect(function () {
                    new Style(styleSpec);
                }).toThrowError('`resolution` must be a number.');
            });

            it('should throw an error when resolution is too small', () => {
                const styleSpec = {
                    resolution: 0
                };
                expect(function () {
                    new Style(styleSpec);
                }).toThrowError('`resolution` must be greater than 0.');
            });

            it('should throw an error when resolution is too big', () => {
                const styleSpec = {
                    resolution: 10000
                };
                expect(function () {
                    new Style(styleSpec);
                }).toThrowError('`resolution` must be less than 256.');
            });

            it('should throw an error when color is not a valid expression', () => {
                const styleSpec = {
                    color: 'red' // wrong type!
                };
                expect(function () {
                    new Style(styleSpec);
                }).toThrowError('`color` parameter is not a valid style Expresion.');
            });

            it('should throw an error when width is not a valid expression', () => {
                const styleSpec = {
                    width: true // wrong type!
                };
                expect(function () {
                    new Style(styleSpec);
                }).toThrowError('`width` parameter is not a valid style Expresion.');
            });

            it('should throw an error when strokeColor is not a valid expression', () => {
                const styleSpec = {
                    strokeColor: 'red' // wrong type!
                };
                expect(function () {
                    new Style(styleSpec);
                }).toThrowError('`strokeColor` parameter is not a valid style Expresion.');
            });

            it('should throw an error when strokeWidth is not a valid expression', () => {
                const styleSpec = {
                    strokeWidth: true // wrong type!
                };
                expect(function () {
                    new Style(styleSpec);
                }).toThrowError('`strokeWidth` parameter is not a valid style Expresion.');
            });

            it('should throw an error when order is not a valid expression', () => {
                const styleSpec = {
                    order: 10 // wrong type!
                };
                expect(function () {
                    new Style(styleSpec);
                }).toThrowError('`order` parameter is not a valid style Expresion.');
            });

            it('should add a console.warn when non supported properties are included', () => {
                const styleSpec = {
                    notSupported: s.float(5)
                };
                spyOn(console, 'warn');
                new Style(styleSpec);
                expect(console.warn).toHaveBeenCalledWith('Property \'notSupported\' is not supported');
            });
        });

        describe('when parameter is a string', () => {
            it('should set the style properties defined in the string', () => {
                const styleSpec = `
                    color: rgba(255, 0, 0, 1)
                    width: float(10)
                    strokeColor: rgba(0, 0, 255, 1)
                    strokeWidth: float(15)
                    order: asc(width())
                `;
                const actual = new Style(styleSpec);

                expect(actual).toEqual(jasmine.any(Style));
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
            new Style({
                filter: expected,
            });

            const final = float.blendTo(floatB, 10);
            expect(final).toBe(floatB);
        });
        it('should notify the style on change', done => {
            const float = s.float(1);
            const floatB = s.float(2);
            const expected = s.gt(s.property('fake_property'), float);
            const style = new Style({
                filter: expected,
            });
            style.onChange(done);
            float.blendTo(floatB, 10);
        }, 10);
        it('should notify the style after the final blending', done => {
            const float = s.float(1);
            const floatB = s.float(2);
            const expected = s.gt(7, float);
            const style = new Style({
                filter: expected,
            });
            float.blendTo(floatB, 999);
            style.onChange(done);
            const t = Date.now() + 1000;
            Date.now = () => t;
            style._styleSpec.filter._preDraw(null, {}, { uniform1f: () => { } });
        }, 10);
    });

    describe('.getFilter()', () => {
        it('should return the current filter', () => {
            const expected = s.gt(s.property('fake_property'), 1000);
            const style = new Style({
                filter: expected,
            });

            const actual = style.getFilter();

            expect(actual).toEqual(expected);
        });
    });

    describe('aliases', () => {
        it('should throw an error when the graph is not a DAG', () => {
            expect(()=>new Style(`width: ramp(linear($numeric, 0, 10), [0.10,0.20,0.30]) * $ten
            variables: [
                 oneHundred: $ten * $ten  
                 ten: $oneHundred / 10
            ]`)).toThrowError('Viz contains a circular dependency');
        });
    });
});
