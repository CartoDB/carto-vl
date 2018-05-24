import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from '../utils';
import { rgb, rgba } from '../../../../../../src/core/viz/functions';

describe('src/core/viz/expressions/rgb', () => {
    describe('error control', () => {
        validateStaticTypeErrors('rgba', []);
        validateStaticTypeErrors('rgba', ['number', 'number', 'number']);
        validateDynamicTypeErrors('rgba', ['number', 'number', 'string', 'number']);

        validateStaticTypeErrors('rgb', []);
        validateStaticTypeErrors('rgb', ['number', 'number']);
        validateDynamicTypeErrors('rgb', ['number', 'number', 'string']);
    });

    describe('type', () => {
        validateStaticType('rgb', ['number', 'number', 'number'], 'color');
        validateStaticType('rgba', ['number', 'number', 'number', 'number'], 'color');
    });

    describe('.value', () => {
        it('should work without alpha', () => {
            expect(rgb(255, 255, 255).value).toEqual({ r: 255, g: 255, b: 255, a: 1 });
        });

        it('should work with alpha', () => {
            expect(rgba(255, 255, 255, 0.5).value).toEqual({ r: 255, g: 255, b: 255, a: 0.5 });
        });
    });

    describe('.eval', () => {
        it('should work without alpha', () => {
            expect(rgb(255, 255, 255).eval()).toEqual({ r: 255, g: 255, b: 255, a: 1 });
        });

        it('should work with alpha', () => {
            expect(rgba(255, 255, 255, 0.5).eval()).toEqual({ r: 255, g: 255, b: 255, a: 0.5 });
        });
    });
});
