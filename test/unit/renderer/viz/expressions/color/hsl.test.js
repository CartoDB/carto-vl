import { validateStaticType, validateTypeErrors, validateMaxArgumentsError } from '../utils';
import { hsl, hsla } from '../../../../../../src/renderer/viz/expressions';

describe('src/renderer/viz/expressions/hsl', () => {
    describe('error control', () => {
        validateTypeErrors('hsl', []);
        validateTypeErrors('hsl', ['number']);
        validateTypeErrors('hsl', ['number', 'category']);
        validateTypeErrors('hsl', ['number', 'number', 'color']);
        validateMaxArgumentsError('hsl', ['number', 'number', 'number', 'number', 'number']);
        validateMaxArgumentsError('hsla', ['number', 'number', 'number', 'number', 'number']);
    });

    describe('type', () => {
        validateStaticType('hsl', ['number', 'number', 'number'], 'color');
        validateStaticType('hsl', ['category', 'number', 'number'], 'color');
        validateStaticType('hsl', ['number', 'category', 'number'], 'color');
        validateStaticType('hsl', ['number', 'number', 'category'], 'color');
        validateStaticType('hsl', ['category', 'category', 'category'], 'color');

        validateStaticType('hsla', ['number', 'number', 'number', 'number'], 'color');
        validateStaticType('hsla', ['category', 'number', 'number', 'number'], 'color');
        validateStaticType('hsla', ['number', 'category', 'number', 'number'], 'color');
        validateStaticType('hsla', ['number', 'number', 'category', 'number'], 'color');
        validateStaticType('hsla', ['category', 'category', 'category', 'number'], 'color');
    });

    describe('.value', () => {
        it('should work without alpha', () => {
            expect(hsl(0, 1, 0.5).value).toEqual({ r: 255, g: 0, b: 0, a: 1 });
        });

        it('should work with alpha', () => {
            expect(hsla(0, 1, 0.5, 0.5).value).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
        });
    });

    describe('.eval', () => {
        it('should work without alpha', () => {
            expect(hsl(0, 1, 0.5).eval()).toEqual({ r: 255, g: 0, b: 0, a: 1 });
            expect(hsl(93 / 360, 0.59, 0.54).eval()).toEqual({ r: 130.77929999999998, g: 206.907, b: 68.49300000000001, a: 1 });
        });
        it('should work with alpha', () => {
            expect(hsla(0, 1, 0.5, 1).eval()).toEqual({ r: 255, g: 0, b: 0, a: 1 });
            expect(hsla(0, 1, 0.5, 0.5).eval()).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
        });
    });
});
