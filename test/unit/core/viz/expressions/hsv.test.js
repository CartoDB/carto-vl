import { validateStaticType, validateStaticTypeErrors } from './utils';
import { hsv, hsva } from '../../../../../src/core/viz/functions';

describe('src/core/viz/expressions/hsv', () => {
    describe('error control', () => {
        validateStaticTypeErrors('hsv', []);
        validateStaticTypeErrors('hsv', ['number']);
        validateStaticTypeErrors('hsv', ['number', 'category']);
        validateStaticTypeErrors('hsv', ['number', 'number', 'color']);

        validateStaticTypeErrors('hsva', ['number', 'number', 'number']);
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

    describe('eval', () => {
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


