import { validateTypeErrors, validateStaticType, validateMaxArgumentsError } from '../utils';
import { rgb, rgba } from '../../../../../../src/renderer/viz/expressions';

describe('src/renderer/viz/expressions/rgb', () => {
    describe('error control', () => {
        validateTypeErrors('rgba', []);
        validateTypeErrors('rgba', ['number', 'number', 'number']);
        validateTypeErrors('rgba', ['number', 'number', 'category', 'number']);

        validateTypeErrors('rgb', []);
        validateTypeErrors('rgb', ['number', 'number']);
        validateTypeErrors('rgb', ['number', 'number', 'category']);
        validateMaxArgumentsError('rgb', ['number', 'number', 'number', 'number', 'number']);
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
