import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/between', () => {
    const metadata = {
        columns: [
            {
                name: 'price',
                type: 'float'
            },
            {
                name: 'cat',
                type: 'category',
                categoryNames: ['red', 'blue']
            }
        ],
    };


    let $cat = null;
    let $price = null;

    beforeEach(() => {
        // Needed a beforeEach to avoid testing against already compiled properties
        $cat = s.property('cat');
        $price = s.property('price');
    });

    describe('error control', () => {
        it('between(\'asd\', 3, 4) should throw at constructor time', () => {
            expect(() => s.between('asd', 3, 4)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });
        it('between(3, \'asd\', 4) should throw at constructor time', () => {
            expect(() => s.between(3, 'asd', 4)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });

        it('between($cat, 3, 4) should throw at compile time', () => {
            expect(() => s.between($cat, 3, 4)._compile(metadata)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });
        it('between(3, $cat, 4) should throw at compile time', () => {
            expect(() => s.between(3, $cat, 4)._compile(metadata)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });
    });

    describe('compile with correct parameters', () => {
        it('between($price, 3, 4) should not throw', () => {
            expect(() => s.between($price, 3, 4)._compile(metadata)).not.toThrow();
        });
        it('between(3, $price, 4) should not throw', () => {
            expect(() => s.between(3, $price, 4)._compile(metadata)).not.toThrow();
        });
    });

    describe('compiled type', () => {
        it('between($price, 3, 4) should be of type float', () => {
            expect(s.between($price, 3, 4).type).toEqual('float');
        });
    });

    describe('eval', () => {
        testEval(9, 0);
        testEval(10, 1);
        testEval(15, 1);
        testEval(20, 1);
        testEval(21, 0);
    });

    function testEval(price, expected) {
        it(`between($price, 10, 20) should return 0 when $price is ${price}`, () => {
            const fakeFeature = { price };
            const $price = s.property('price');
            const actual = s.between($price, 10, 20).eval(fakeFeature);

            expect(actual).toEqual(expected);
        });
    }
});


