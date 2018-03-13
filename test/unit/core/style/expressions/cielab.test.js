import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/cielab', () => {
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
        it('cielab(\'asd\', 3, 4) should throw at constructor time', () => {
            expect(() => s.cielab('asd', 3, 4)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });
        it('cielab(3, \'asd\', 4) should throw at constructor time', () => {
            expect(() => s.cielab(3, 'asd', 4)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });

        it('cielab($cat, 3, 4) should throw at compile time', () => {
            expect(() => s.cielab($cat, 3, 4)._compile(metadata)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });
        it('cielab(3, $cat, 4) should throw at compile time', () => {
            expect(() => s.cielab(3, $cat, 4)._compile(metadata)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
        });
    });

    describe('compile with correct parameters', () => {
        it('cielab($price, 3, 4) should not throw', () => {
            expect(() => s.cielab($price, 3, 4)._compile(metadata)).not.toThrow();
        });
        it('cielab(3, $price, 4) should not throw', () => {
            expect(() => s.cielab(3, $price, 4)._compile(metadata)).not.toThrow();
        });
    });

    describe('compiled type', () => {
        it('cielab($price, 3, 4) should be of type color', () => {
            expect(s.cielab($price, 3, 4).type).toEqual('color');
        });
    });

    describe('eval', () => {
        // TODO
    });
});


