import * as s from '../../../../../src/renderer/viz/expressions';
import { validateTypeErrors, validateStaticType, validateMaxArgumentsError } from './utils';

describe('src/renderer/viz/expressions/Fade', () => {
    describe('error control', () => {
        validateTypeErrors('fade', ['color']);
        validateTypeErrors('fade', [undefined, 'color']);
        validateMaxArgumentsError('fade', ['number', 'number', 'number']);
    });

    describe('type', () => {
        validateStaticType('fade', ['number'], 'fade');
        validateStaticType('fade', [], 'fade');
    });

    describe('.eval', () => {
        it('should set the default value to 0.15 when there is no params', () => {
            expect(s.fade().fadeIn.eval()).toEqual(0.15);
            expect(s.fade().fadeOut.eval()).toEqual(0.15);
        });

        it('should have the same fadeOut than fadeIn value if only one parameter is sent', () => {
            expect(s.fade(1).fadeIn.eval()).toEqual(1);
            expect(s.fade(1).fadeOut.eval()).toEqual(1);
        });

        it('should set fadeIn and fadeOut parameters', () => {
            expect(s.fade(1, 2).fadeIn.eval()).toEqual(1);
            expect(s.fade(1, 2).fadeOut.eval()).toEqual(2);
        });
    });
});
