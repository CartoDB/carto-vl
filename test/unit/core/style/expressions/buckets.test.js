import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/buckets', () => {
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

    function compile(expression) {
        expression._compile(metadata);
        return expression;
    }

    let $cat = null;
    let $price = null;

    beforeEach(() => {
        // Needed a beforeEach to avoid testing against already compiled properties
        $cat = s.property('cat');
        $price = s.property('price');
    });

    describe('error control', () => {
        it('buckets(0, \'asd\') should throw at constructor time', () => {
            expect(() => s.buckets(0, 'asd')).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*type[\s\S]*/g);
        });
        it('buckets(\'asd\', 0) should throw at constructor time', () => {
            expect(() => s.buckets('asd', 0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*type[\s\S]*/g);
        });
    });

    describe('for numerics', () => {
        describe('compile with correct parameters', () => {
            it('buckets(0, 0) should not throw', () => {
                expect(() => compile(s.buckets(0, 0))).not.toThrow();
            });
            it('buckets($price, 0) should not throw', () => {
                expect(() => compile(s.buckets($price, 0))).not.toThrow();
            });
            it('buckets(0, $price) should not throw', () => {
                expect(() => compile(s.buckets(0, $price))).not.toThrow();
            });
        });

        describe('compiled type', () => {
            it('buckets($price, 0) should be of type category at constructor time', () => {
                expect(s.buckets($price, 0).type).toEqual('category');
            });
        });

        describe('eval', () => {
        });
    });

    describe('for categories', () => {
        describe('compile with correct parameters', () => {
            it('buckets(\'red\', \'blue\') should not throw', () => {
                expect(() => compile(s.buckets('red', 'blue'))).not.toThrow();
            });
            it('buckets($cat, \'blue\') should not throw', () => {
                expect(() => compile(s.buckets($cat, 'blue'))).not.toThrow();
            });
            it('buckets(\'red\', $cat) should not throw', () => {
                expect(() => compile(s.buckets('red', $cat))).not.toThrow();
            });
        });

        describe('compiled type', () => {
            it('buckets($cat, 0) should be of type category at constructor time', () => {
                expect(s.buckets($cat, 0).type).toEqual('category');
            });
        });

        describe('eval', () => {
        });
    });
});


