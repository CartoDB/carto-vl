import Style from '../../../src/api/style';
import * as s from '../../../src/core/style/functions';

describe('api/style', () => {
    describe('constructor', () => {
        describe('when parameter is a styleSpect object', () => {
            it('should set default style values when no parameters are given', () => {
                const actual = new Style();

                // Check returned object inherits from Style
                expect(actual).toEqual(jasmine.any(Style));
                // Check returned object properties
                expect(actual.getColor()).toEqual(s.rgba(0, 1, 0, 0.5));
                expect(actual.getWidth()).toEqual(s.float(5));
                expect(actual.getStrokeColor()).toEqual(s.rgba(0, 1, 0, 0.5));
                expect(actual.getStrokeWidth()).toEqual(s.float(0));
            });

            it('should set default style values when an empty object is given', () => {
                const actual = new Style({});

                expect(actual).toEqual(jasmine.any(Style));
                expect(actual.getColor()).toEqual(s.rgba(0, 1, 0, 0.5));
                expect(actual.getWidth()).toEqual(s.float(5));
                expect(actual.getStrokeColor()).toEqual(s.rgba(0, 1, 0, 0.5));
                expect(actual.getStrokeWidth()).toEqual(s.float(0));
            });

            it('should set the style properties when defined in the styleSpec object', () => {
                const styleSpec = {
                    color: s.rgba(1, 0, 0, 1),
                    width: s.float(10),
                    strokeColor: s.rgba(0, 0, 1, 1),
                    strokeWidth: s.float(15)
                };

                const actual = new Style(styleSpec);

                expect(actual).toEqual(jasmine.any(Style));
                expect(actual.getColor()).toEqual(styleSpec.color);
                expect(actual.getWidth()).toEqual(styleSpec.width);
                expect(actual.getStrokeColor()).toEqual(styleSpec.strokeColor);
                expect(actual.getStrokeWidth()).toEqual(styleSpec.strokeWidth);
            });

            it('should throw an error when styleSpec object is not valid', function () {
                expect(function () {
                    new Style(1234);
                }).toThrowError('style definition should be a styleSpec object or a valid style string.');
            });
        });

        describe('when parameter is a string', () => {
            pending('Implement and test');
        });

    });
});



