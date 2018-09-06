import { validateStaticType, validateTypeErrors, validateMaxArgumentsError } from '../utils';
import { hsv, hsva } from '../../../../../../src/renderer/viz/expressions';

describe('src/renderer/viz/expressions/hsv', () => {
    describe('error control', () => {
        validateTypeErrors('hsv', []);
        validateTypeErrors('hsv', ['number']);
        validateTypeErrors('hsv', ['number', 'category']);
        validateTypeErrors('hsv', ['number', 'number', 'color']);
        validateTypeErrors('hsva', ['number', 'number', 'number']);
        validateMaxArgumentsError('hsv', ['number', 'number', 'number', 'number', 'number']);
        validateMaxArgumentsError('hsva', ['number', 'number', 'number', 'number', 'number']);
    });

    describe('type', () => {
        validateStaticType('hsv', ['number', 'number', 'number'], 'color');
        validateStaticType('hsv', ['category', 'number', 'number'], 'color');
        validateStaticType('hsv', ['number', 'category', 'number'], 'color');
        validateStaticType('hsv', ['number', 'number', 'category'], 'color');
        validateStaticType('hsv', ['category', 'category', 'category'], 'color');

        validateStaticType('hsva', ['number', 'number', 'number', 'number'], 'color');
        validateStaticType('hsva', ['category', 'number', 'number', 'number'], 'color');
        validateStaticType('hsva', ['number', 'category', 'number', 'number'], 'color');
        validateStaticType('hsva', ['number', 'number', 'category', 'number'], 'color');
        validateStaticType('hsva', ['category', 'category', 'category', 'number'], 'color');
    });

    describe('.value', () => {
        it('should work without alpha', () => {
            expect(hsv(0, 1, 1).value).toEqual({ r: 255, g: 0, b: 0, a: 1 });
        });

        it('should work with alpha', () => {
            expect(hsva(0, 1, 1, 0.5).value).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
        });
    });

    describe('.eval', () => {
        it('should work without alpha', () => {
            expect(hsv(0, 1, 1).eval()).toEqual({ r: 255, g: 0, b: 0, a: 1 });
            expect(hsv(0.2596, 0.675, 0.812).eval()).toEqual({ r: 129.12675720000004, g: 207.06, b: 67.29449999999999, a: 1 });
        });
        it('should work with alpha', () => {
            expect(hsva(0, 1, 1, 1).eval()).toEqual({ r: 255, g: 0, b: 0, a: 1 });
            expect(hsva(0, 1, 1, 0.5).eval()).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
        });
    });
});
