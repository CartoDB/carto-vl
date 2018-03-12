import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/animate', () => {
    describe('error control', () => {
        it('animate of undefined should throw', () => {
            expect(() => s.animate(undefined)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*duration[\s\S]*/g);
        });
        it('animate of strings should throw', () => {
            expect(() => s.animate('123')).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*duration[\s\S]*/g);
        });
        it('animate of negative durations should throw', () => {
            expect(() => s.animate(-4)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*duration[\s\S]*/g);
        });
    });

    describe('compiled type', ()=>{
        it('animate(100) should be of type float', () => {
            expect(s.animate(100).type).toEqual('float');
        });
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


