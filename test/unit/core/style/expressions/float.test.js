import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/float', () => {
    describe('error control', () => {
        it('float of undefined should throw', () => {
            expect(() => s.float(undefined)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*x[\s\S]*/g);
        });
        it('float of strings should throw', () => {
            expect(() => s.float('123')).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*x[\s\S]*/g);
        });
    });

    describe('compiled type', ()=>{
        it('float(100) should be of type float', () => {
            expect(s.float(100).type).toEqual('float');
        });
    });

    describe('eval', () => {
        it('should return the float value', () => {
            const actual = s.float(101).eval();

            expect(actual).toEqual(101);
        });
    });
});


