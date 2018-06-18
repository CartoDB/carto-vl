import * as s from '../../../../../src/core/viz/functions';
import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/animate', () => {
    describe('error control', () => {
        validateStaticTypeErrors('animate', [undefined]);
        validateStaticTypeErrors('animate', ['123']);
        validateStaticTypeErrors('animate', [-4]);
        validateStaticTypeErrors('animate', ['number']);
        validateStaticTypeErrors('animate', ['color']);
        validateStaticTypeErrors('animate', ['category']);
    });

    describe('type', () => {
        validateStaticType('animate', [100], 'number');
    });

    describe('eval', () => {
        it('animate(100) should return the elapsed time % since instantiation (100%)', () => {
            const dateSpy = spyOn(Date, 'now').and.returnValue(10000);
            const animate = s.animate(100);

            dateSpy.and.returnValue(10100);
            const actual = animate.eval();
            expect(actual).toEqual(1);
        });

        it('animate(100) should return the elapsed time % since instantiation (50%)', () => {
            const dateSpy = spyOn(Date, 'now').and.returnValue(10000);
            const animate = s.animate(100);

            dateSpy.and.returnValue(10050);
            const actual = animate.eval();
            expect(actual).toEqual(0.5);
        });

        it('animate(100) should return the elapsed time % since instantiation (0%)', () => {
            const dateSpy = spyOn(Date, 'now').and.returnValue(10000);
            const animate = s.animate(100);

            dateSpy.and.returnValue(10000);
            const actual = animate.eval();
            expect(actual).toEqual(0);
        });
    });

});


