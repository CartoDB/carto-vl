import { validateMaxArgumentsError, validateTypeErrors, validateDynamicType } from '../utils';
import { opacity, rgba, mul, variable, rgb } from '../../../../../../src/renderer/viz/expressions';

describe('src/renderer/viz/expressions/opacity', () => {
    describe('error control', () => {
        validateTypeErrors('opacity', []);
        validateTypeErrors('opacity', ['number']);
        validateTypeErrors('opacity', ['number', 'number']);
        validateTypeErrors('opacity', ['color', 'category']);
        validateMaxArgumentsError('opacity', ['red', 'number', 'number']);
    });

    describe('type', () => {
        validateDynamicType('opacity', ['color', 'number'], 'color');
        validateDynamicType('opacity', ['image', 'number'], 'image');
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

    describe('regression', () => {
        it('should work with binary operations and variables', () => {
            expect(() =>
                opacity(mul(variable('wadus'), rgb(0, 0, 0)), 0.5)
            ).not.toThrow();
        });
    });
});
