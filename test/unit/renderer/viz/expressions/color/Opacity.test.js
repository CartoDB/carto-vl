import { validateMaxArgumentsError, validateTypeErrors, validateDynamicType } from '../utils';
import { opacity, rgba, mul, variable, rgb, hsl, hsv, cielab, namedColor, hex, property, ramp } from '../../../../../../src/renderer/viz/expressions';
import Metadata from '../../../../../../src/renderer/Metadata';

describe('src/renderer/viz/expressions/opacity', () => {
    describe('error control', () => {
        validateTypeErrors('opacity', []);
        validateTypeErrors('opacity', ['number']);
        validateTypeErrors('opacity', ['image']);
        validateTypeErrors('opacity', ['number', 'number']);
        validateTypeErrors('opacity', ['color', 'category']);
        validateMaxArgumentsError('opacity', ['red', 'number', 'number']);
    });

    describe('type', () => {
        validateDynamicType('opacity', ['color', 'number'], 'color');
    });

    describe('.value', () => {
        it('should override the alpha channel', () => {
            expect(opacity(rgba(255, 255, 255, 0.5), 0.7).value).toEqual({ r: 255, g: 255, b: 255, a: 0.7 });
        });
    });

    describe('.eval', () => {
        it('should override the alpha channel', () => {
            expect(opacity(rgba(255, 255, 255, 0.5), 0.7).eval()).toEqual({ r: 255, g: 255, b: 255, a: 0.7 });
        });
    });

    describe('.getLegendData', () => {
        it('should override the alpha channel when using a named color', () => {
            const actual = opacity(namedColor('blue'), 0.5).getLegendData();
            const expected = {
                name: 'color',
                data: [{
                    key: 'color',
                    value: {
                        r: 0,
                        g: 0,
                        b: 255,
                        a: 0.5
                    }
                }]
            };

            expect(actual).toEqual(expected);
        });

        it('should override the alpha channel when using a rgba color', () => {
            const actual = opacity(rgba(255, 1, 255, 0.5), 0.5).getLegendData();
            const expected = {
                name: 'color',
                data: [{
                    key: 'color',
                    value: {
                        r: 255,
                        g: 1,
                        b: 255,
                        a: 0.5
                    }
                }]
            };

            expect(actual).toEqual(expected);
        });

        it('should override the alpha channel when using a CIELab color', () => {
            const actual = opacity(cielab(87.73, -86.18, 83.18), 0.5).getLegendData();
            const expected = {
                name: 'color',
                data: [{
                    key: 'color',
                    value: {
                        r: 0,
                        g: 0.9999316244751483,
                        b: 0,
                        a: 0.5
                    }
                }]
            };

            expect(actual).toEqual(expected);
        });

        it('should override the alpha channel when using a hsv color', () => {
            const actual = opacity(hsv(0.66, 1, 1), 0.5).getLegendData();
            const expected = {
                name: 'color',
                data: [{
                    key: 'color',
                    value: {
                        r: 0,
                        g: 10.20000000000001,
                        b: 255,
                        a: 0.5
                    }
                }]
            };

            expect(actual).toEqual(expected);
        });

        it('should override the alpha channel when using a hsl color', () => {
            const actual = opacity(hsl(0.66, 1, 1), 0.5).getLegendData();
            const expected = {
                name: 'color',
                data: [{
                    key: 'color',
                    value: {
                        r: 255,
                        g: 255,
                        b: 255,
                        a: 0.5
                    }
                }]
            };

            expect(actual).toEqual(expected);
        });

        it('should override the alpha channel when using a hex color', () => {
            const actual = opacity(hex('#FABADA'), 0.5).getLegendData();
            const expected = {
                name: 'color',
                data: [{
                    key: 'color',
                    value: {
                        r: 250,
                        g: 186,
                        b: 218,
                        a: 0.5
                    }
                }]
            };

            expect(actual).toEqual(expected);
        });

        it('should override the alpha channel when using a color ramp', () => {
            const METADATA = new Metadata({
                properties: {
                    grade: {
                        type: 'category',
                        categories: [
                            { name: 'A' },
                            { name: 'B' }
                        ]
                    }
                }
            });

            const color = opacity(ramp(property('grade'), [namedColor('blue'), namedColor('red')]), 0.5);
            color._bindMetadata(METADATA);
            const actual = color.getLegendData();

            const expected = {
                type: 'category',
                data: [{
                    key: 'A',
                    value: {
                        r: 0,
                        g: 0,
                        b: 255,
                        a: 0.5
                    }
                }, {
                    key: 'B',
                    value: {
                        r: 255,
                        g: 0,
                        b: 0,
                        a: 0.5
                    }
                }]
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('regression', () => {
        it('should work with binary operations and variables', () => {
            expect(() =>
                opacity(mul(variable('wadus'), rgb(0, 0, 0)), 0.5)
            ).not.toThrow();
        });
    });
});
