import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/floatConstant', () => {
    describe('error control', () => {
        it('floatConstant of undefined should throw', () => {
            expect(() => s.floatConstant(undefined)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*x[\s\S]*/g);
        });
        it('floatConstant of strings should throw', () => {
            expect(() => s.floatConstant('123')).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*x[\s\S]*/g);
        });
    });

    describe('compiled type', () => {
        it('floatConstant(100) should be of type float', () => {
            expect(s.floatConstant(100).type).toEqual('float');
        });
    });

    describe('.eval()', () => {
        it('should return the float value', () => {
            const actual = s.floatConstant(101).eval();

            expect(actual).toEqual(101);
        });
    });
});


