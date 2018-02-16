import Style from '../../../src/api/style';
import * as s from '../../../src/core/style/functions';

describe('api/style', () => {

    describe('constructor', () => {
        describe('when parameter is a styleSpec object', () => {
            xit('should set default style values when no parameters are given', () => {
                const actual = new Style();

                // Check returned object inherits from Style
                expect(actual).toEqual(jasmine.any(Style));
                // Check returned object properties
                expect(actual.getResolution()).toEqual(1);
                expect(actual.getColor()).toEqual(s.rgba(0, 1, 0, 0.5));
                expect(actual.getWidth()).toEqual(s.float(5));
                expect(actual.getStrokeColor()).toEqual(s.rgba(0, 1, 0, 0.5));
                expect(actual.getStrokeWidth()).toEqual(s.float(0));
                expect(actual.getOrder()).toEqual(s.noOrder());
            });

            xit('should set default style values when an empty object is given', () => {
                const actual = new Style({});

                expect(actual).toEqual(jasmine.any(Style));
                expect(actual.getResolution()).toEqual(1);
                expect(actual.getColor()).toEqual(s.rgba(0, 1, 0, 0.5));
                expect(actual.getWidth()).toEqual(s.float(5));
                expect(actual.getStrokeColor()).toEqual(s.rgba(0, 1, 0, 0.5));
                expect(actual.getStrokeWidth()).toEqual(s.float(0));
                expect(actual.getOrder()).toEqual(s.noOrder());
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
                expect(actual.getResolution()).toEqual(styleSpec.resolution);
                expect(actual.getColor()).toEqual(styleSpec.color);
                expect(actual.getWidth()).toEqual(styleSpec.width);
                expect(actual.getStrokeColor()).toEqual(styleSpec.strokeColor);
                expect(actual.getStrokeWidth()).toEqual(styleSpec.strokeWidth);
                expect(actual.getOrder()).toEqual(styleSpec.order);
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
                    width: 10 // wrong type!
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
                    strokeWidth: 5 // wrong type!
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
});
