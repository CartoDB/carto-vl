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
                expect(actual.getColor().expr).toEqual(s.rgba(0, 1, 0, 0.5).expr);
                expect(actual.getWidth().expr).toEqual(s.float(5).expr);
                expect(actual.getStrokeColor().expr).toEqual(s.rgba(0, 1, 0, 0.5).expr);
                expect(actual.getStrokeWidth().expr).toEqual(s.float(0).expr);
                expect(actual.getOrder().expr).toEqual(s.noOrder().expr);
            });

            it('should set default style values when an empty object is given', () => {
                const actual = new Style({});

                expect(actual).toEqual(jasmine.any(Style));
                expect(actual.getResolution()).toEqual(1);
                expect(actual.getColor().expr).toEqual(s.rgba(0, 1, 0, 0.5).expr);
                expect(actual.getWidth().expr).toEqual(s.float(5).expr);
                expect(actual.getStrokeColor().expr).toEqual(s.rgba(0, 1, 0, 0.5).expr);
                expect(actual.getStrokeWidth().expr).toEqual(s.float(0).expr);
                expect(actual.getOrder().expr).toEqual(s.noOrder().expr);
            });

            it('should set the style properties defined in the styleSpec object', () => {
                const styleSpec = {
                    resolution: 2,
                    color: s.rgba(1, 0, 0, 1),
                    width: s.float(10),
                    strokeColor: s.rgba(0, 0, 1, 1),
                    strokeWidth: s.float(15),
                    order: s.asc(s.width())
                };
                const actual = new Style(styleSpec);

                expect(actual).toEqual(jasmine.any(Style));
                expect(actual.getResolution()).toEqual(2);
                expect(actual.getColor().expr).toEqual(s.rgba(1, 0, 0, 1).expr);
                expect(actual.getWidth().expr).toEqual(s.float(10).expr);
                expect(actual.getStrokeColor().expr).toEqual(s.rgba(0, 0, 1, 1).expr);
                expect(actual.getStrokeWidth().expr).toEqual(s.float(15).expr);
                expect(actual.getOrder().expr).toEqual(s.asc(s.width()).expr);
            });

            it('should allow the style properties `width` and `strokeWidth` to be numbers', () => {
                const actual = new Style({
                    width: 1,
                    strokeWidth: 10
                });

                expect(actual).toEqual(jasmine.any(Style));
                expect(actual.getWidth().expr).toEqual(s.float(1).expr);
                expect(actual.getStrokeWidth().expr).toEqual(s.float(10).expr);
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
            xit('should set the style properties defined in the string', () => {
                const styleSpec = `
                    color: rgba(1, 0, 0, 1),
                    width: float(10),
                    strokeColor: rgba(0, 0, 1, 1),
                    strokeWidth: float(15),
                    order: asc(width())
                `;
                const actual = new Style(styleSpec);

                expect(actual).toEqual(jasmine.any(Style));
                expect(actual.getResolution()).toEqual(1);
                expect(actual.getColor()).toEqual(s.rgba(1, 0, 0, 1));
                expect(actual.getWidth()).toEqual(s.float(10));
                expect(actual.getStrokeColor()).toEqual(s.rgba(0, 0, 1, 1));
                expect(actual.getStrokeWidth()).toEqual(s.float(15));
                expect(actual.getOrder()).toEqual(s.asc(s.width()));
            });
        });
    });

    describe('expression.blendTo()', () => {
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
        }, 1);
        it('should notify the style after the final blending', done => {
            const float = s.float(1);
            const floatB = s.float(2);
            const expected = s.gt(7, float);
            const style = new Style({
                filter: expected,
            });
            float.blendTo(floatB, 1);
            style.onChange(done);
            setTimeout(() => {
                style._styleSpec.filter._preDraw({}, { uniform1f: () => { } });
            }, 3);
        }, 5);
    });

    describe('.filter', () => {
        it('should return the current filter', () => {
            const expected = s.gt(s.property('fake_property'), 1000);
            const style = new Style({
                filter: expected,
            });

            const actual = style.filter;

            expect(actual).toEqual(expected);
        });
    });
});
