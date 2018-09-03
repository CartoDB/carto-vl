import { validateStaticType, validateMaxArgumentsError, validateTypeErrors } from '../utils';
import { hex } from '../../../../../../src/renderer/viz/expressions';

describe('src/renderer/viz/expressions/hex', () => {
    describe('error control', () => {
        validateTypeErrors('hex', []);
        validateTypeErrors('hex', ['number']);
        validateTypeErrors('hex', ['category']);
        validateTypeErrors('hex', ['#Z08080'], expressionName =>
            new RegExp(`[\\s\\S]*${expressionName}[\\s\\S]*invalid.*parameter[\\s\\S]*Invalid hexadecimal[\\s\\S]*`, 'g'));
        validateMaxArgumentsError('hex', ['#Z08080', 'extraParam']);
    });

    describe('type', () => {
        validateStaticType('hex', ['#808080'], 'color');
        validateStaticType('hex', ['#AAA'], 'color');
    });

    describe('.value', () => {
        it('should work with #FFF forms', () => {
            expect(hex('#FFF').value).toEqual({ r: 255, g: 255, b: 255, a: 1 });
        });
    });

    describe('.eval', () => {
        it('should work with #FFF forms', () => {
            expect(hex('#FFF').eval()).toEqual({ r: 255, g: 255, b: 255, a: 1 });
        });
        it('should work with #FFF0 forms', () => {
            expect(hex('#FFF0').eval()).toEqual({ r: 255, g: 255, b: 255, a: 0 });
            expect(hex('#FFFF').eval()).toEqual({ r: 255, g: 255, b: 255, a: 1 });
        });
        it('should work with #FFFFFF forms', () => {
            expect(hex('#FFFFFF').eval()).toEqual({ r: 255, g: 255, b: 255, a: 1 });
        });
        it('should work with #FFFFFF00 forms', () => {
            expect(hex('#FFFFFF00').eval()).toEqual({ r: 255, g: 255, b: 255, a: 0 });
            expect(hex('#FFFFFFFF').eval()).toEqual({ r: 255, g: 255, b: 255, a: 1 });
        });
    });
});
