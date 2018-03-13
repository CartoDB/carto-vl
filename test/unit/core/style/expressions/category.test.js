import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/category', () => {
    describe('error control', () => {
        it('category of undefined should throw', () => {
            expect(() => s.category(undefined)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*categoryName[\s\S]*/g);
        });
        it('category of numbers should throw', () => {
            expect(() => s.category(123)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*categoryName[\s\S]*/g);
        });
    });

    describe('compiled type', () => {
        it('category(\'red\') should be of type category', () => {
            expect(s.category('red').type).toEqual('category');
        });
        it('category(\'123\') should be of type category', () => {
            expect(s.category('123').type).toEqual('category');
        });
    });

    describe('.eval()', () => {
        const fakeMetadata = {
            columns: [{
                type: 'category',
                name: 'category',
                categoryNames: ['cat0', 'cat1', 'cat2']
            }],
            categoryIDs: {
                'cat0': 0,
                'cat1': 1,
                'cat2': 2,
            }
        };
        it('should return the value from the metadata', () => {
            const categoryExpresion = s.category('cat0');
            categoryExpresion._compile(fakeMetadata);
            const actual = categoryExpresion.eval();

            expect(actual).toEqual(0);
        });
    });
});


