import * as s from '../../../../../src/renderer/viz/expressions';
import { validateStaticType, validateStaticTypeErrors, validateMaxArgumentsError } from './utils';

describe('src/renderer/viz/expressions/transition', () => {
    describe('error control', () => {
        validateStaticTypeErrors('transition', [undefined]);
        validateStaticTypeErrors('transition', ['123']);
        validateStaticTypeErrors('transition', [-4]);
        validateStaticTypeErrors('transition', ['number']);
        validateStaticTypeErrors('transition', ['color']);
        validateStaticTypeErrors('transition', ['category']);
        validateMaxArgumentsError('transition', ['number', 'number']);
    });

    describe('type', () => {
        validateStaticType('transition', [100], 'number');
    });

    describe('eval', () => {
        it('transition(100) should return the elapsed time % since instantiation (100%)', () => {
            const dateSpy = spyOn(Date, 'now').and.returnValue(10000);
            const transition = s.transition(100);

            dateSpy.and.returnValue(10100);
            const actual = transition.eval();
            expect(actual).toEqual(1);
        });

        it('transition(100) should return the elapsed time % since instantiation (50%)', () => {
            const dateSpy = spyOn(Date, 'now').and.returnValue(10000);
            const transition = s.transition(100);

            dateSpy.and.returnValue(10050);
            const actual = transition.eval();
            expect(actual).toEqual(0.5);
        });

        it('transition(100) should return the elapsed time % since instantiation (0%)', () => {
            const dateSpy = spyOn(Date, 'now').and.returnValue(10000);
            const transition = s.transition(100);

            dateSpy.and.returnValue(10000);
            const actual = transition.eval();
            expect(actual).toEqual(0);
        });
    });
});
