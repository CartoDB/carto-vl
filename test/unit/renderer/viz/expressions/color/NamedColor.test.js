import { validateStaticType, validateTypeErrors, validateMaxArgumentsError } from '../utils';
import { namedColor } from '../../../../../../src/renderer/viz/expressions';

describe('src/core/viz/expressions/NamedColor', () => {
    describe('error control', () => {
        validateTypeErrors('namedColor', [undefined]);
    });

    describe('type', () => {
        validateStaticType('namedColor', ['blue'], 'color');
        validateStaticType('namedColor', ['AliceBlue'], 'color');
        validateStaticType('namedColor', ['BLACK'], 'color');
        validateStaticType('namedColor', ['transparent'], 'color');
        validateMaxArgumentsError('namedColor', ['blue', 'red']);
    });

    describe('.value', () => {
        it('should work with blue', () => {
            expect(namedColor('blue').value).toEqual({ r: 0, g: 0, b: 255, a: 1 });
        });
        it('should work with red', () => {
            expect(namedColor('red').value).toEqual({ r: 255, g: 0, b: 0, a: 1 });
        });
        it('should work with transparent', () => {
            expect(namedColor('transparent').value).toEqual({ r: 0, g: 0, b: 0, a: 0 });
        });
    });

    describe('.eval', () => {
        it('should work with blue', () => {
            expect(namedColor('blue').eval()).toEqual({ r: 0, g: 0, b: 255, a: 1 });
        });
        it('should work with red', () => {
            expect(namedColor('red').eval()).toEqual({ r: 255, g: 0, b: 0, a: 1 });
        });
        it('should work with transparent', () => {
            expect(namedColor('transparent').eval()).toEqual({ r: 0, g: 0, b: 0, a: 0 });
        });
    });
});
