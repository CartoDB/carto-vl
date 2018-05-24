import { validateStaticType, validateStaticTypeErrors } from '../utils';
import { hsl, hsla } from '../../../../../../src/core/viz/functions';

describe('src/core/viz/expressions/hsl', () => {
    describe('error control', () => {
        validateStaticTypeErrors('hsl', []);
        validateStaticTypeErrors('hsl', ['number']);
        validateStaticTypeErrors('hsl', ['number', 'string']);
        validateStaticTypeErrors('hsl', ['number', 'number', 'color']);

        validateStaticTypeErrors('hsla', ['number', 'number', 'number']);
    });

    describe('type', () => {
        validateStaticType('hsl', ['number', 'number', 'number'], 'color');
        validateStaticType('hsl', ['string', 'number', 'number'], 'color');
        validateStaticType('hsl', ['number', 'string', 'number'], 'color');
        validateStaticType('hsl', ['number', 'number', 'string'], 'color');
        validateStaticType('hsl', ['string', 'string', 'string'], 'color');

        validateStaticType('hsla', ['number', 'number', 'number', 'number'], 'color');
        validateStaticType('hsla', ['string', 'number', 'number', 'number'], 'color');
        validateStaticType('hsla', ['number', 'string', 'number', 'number'], 'color');
        validateStaticType('hsla', ['number', 'number', 'string', 'number'], 'color');
        validateStaticType('hsla', ['string', 'string', 'string', 'number'], 'color');
    });

    describe('eval', () => {
        it('should work without alpha', () => {
            expect(hsl(0, 1, 0.5).eval()).toEqual({ r: 255, g: 0, b: 0, a: 1 });
            expect(hsl(93/360, 0.59, 0.54).eval()).toEqual({ r: 130.77929999999998, g: 206.907, b: 68.49300000000001, a: 1 });
        });
        it('should work with alpha', () => {
            expect(hsla(0, 1, 0.5, 1).eval()).toEqual({ r: 255, g: 0, b: 0, a: 1 });
            expect(hsla(0, 1, 0.5, 0.5).eval()).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
        });
    });
});
