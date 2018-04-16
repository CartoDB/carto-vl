import { validateStaticType, validateStaticTypeErrors } from './utils';
import { hsv, hsva } from '../../../../../src/core/viz/functions';

describe('src/core/viz/expressions/hsv', () => {
    describe('error control', () => {
        validateStaticTypeErrors('hsv', []);
        validateStaticTypeErrors('hsv', ['float']);
        validateStaticTypeErrors('hsv', ['float', 'category']);
        validateStaticTypeErrors('hsv', ['float', 'float', 'color']);

        validateStaticTypeErrors('hsva', ['float', 'float', 'float']);
    });

    describe('type', () => {
        validateStaticType('hsv', ['float', 'float', 'float'], 'color');
        validateStaticType('hsv', ['category', 'float', 'float'], 'color');
        validateStaticType('hsv', ['float', 'category', 'float'], 'color');
        validateStaticType('hsv', ['float', 'float', 'category'], 'color');
        validateStaticType('hsv', ['category', 'category', 'category'], 'color');

        validateStaticType('hsva', ['float', 'float', 'float', 'float'], 'color');
        validateStaticType('hsva', ['category', 'float', 'float', 'float'], 'color');
        validateStaticType('hsva', ['float', 'category', 'float', 'float'], 'color');
        validateStaticType('hsva', ['float', 'float', 'category', 'float'], 'color');
        validateStaticType('hsva', ['category', 'category', 'category', 'float'], 'color');
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


