import { validateStaticType, validateStaticTypeErrors } from './utils';
import { hsv, hsva } from '../../../../../src/core/viz/functions';

describe('src/core/viz/expressions/hsv', () => {
    describe('error control', () => {
        validateStaticTypeErrors('hsv', []);
        validateStaticTypeErrors('hsv', ['number']);
        validateStaticTypeErrors('hsv', ['number', 'string']);
        validateStaticTypeErrors('hsv', ['number', 'number', 'color']);

        validateStaticTypeErrors('hsva', ['number', 'number', 'number']);
    });

    describe('type', () => {
        validateStaticType('hsv', ['number', 'number', 'number'], 'color');
        validateStaticType('hsv', ['string', 'number', 'number'], 'color');
        validateStaticType('hsv', ['number', 'string', 'number'], 'color');
        validateStaticType('hsv', ['number', 'number', 'string'], 'color');
        validateStaticType('hsv', ['string', 'string', 'string'], 'color');

        validateStaticType('hsva', ['number', 'number', 'number', 'number'], 'color');
        validateStaticType('hsva', ['string', 'number', 'number', 'number'], 'color');
        validateStaticType('hsva', ['number', 'string', 'number', 'number'], 'color');
        validateStaticType('hsva', ['number', 'number', 'string', 'number'], 'color');
        validateStaticType('hsva', ['string', 'string', 'string', 'number'], 'color');
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
