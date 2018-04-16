import { validateStaticType, validateStaticTypeErrors } from './utils';
import { hsl, hsla } from '../../../../../src/core/viz/functions';

describe('src/core/viz/expressions/hsl', () => {
    describe('error control', () => {
        validateStaticTypeErrors('hsl', []);
        validateStaticTypeErrors('hsl', ['float']);
        validateStaticTypeErrors('hsl', ['float', 'category']);
        validateStaticTypeErrors('hsl', ['float', 'float', 'color']);

        validateStaticTypeErrors('hsla', ['float', 'float', 'float']);
    });

    describe('type', () => {
        validateStaticType('hsl', ['float', 'float', 'float'], 'color');
        validateStaticType('hsl', ['category', 'float', 'float'], 'color');
        validateStaticType('hsl', ['float', 'category', 'float'], 'color');
        validateStaticType('hsl', ['float', 'float', 'category'], 'color');
        validateStaticType('hsl', ['category', 'category', 'category'], 'color');

        validateStaticType('hsla', ['float', 'float', 'float', 'float'], 'color');
        validateStaticType('hsla', ['category', 'float', 'float', 'float'], 'color');
        validateStaticType('hsla', ['float', 'category', 'float', 'float'], 'color');
        validateStaticType('hsla', ['float', 'float', 'category', 'float'], 'color');
        validateStaticType('hsla', ['category', 'category', 'category', 'float'], 'color');
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
