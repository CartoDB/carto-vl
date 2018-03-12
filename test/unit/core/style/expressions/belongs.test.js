import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/belongs', () => {
    const fakeMetadata = {
        columns: [{
            type: 'category',
            name: 'category',
            categoryNames: ['cat0', 'cat1', 'cat2']
        },
        {
            name: 'price',
            type: 'float',
        }
        ],
        categoryIDs: {
            'cat0': 0,
            'cat1': 1,
            'cat2': 2,
        }
    };

    let $category = null;
    let $price = null;

    beforeEach(() => {
        // Needed a beforeEach to avoid testing against already compiled properties
        $category = s.property('category');
        $price = s.property('price');
    });

    describe('error control', () => {
        it('in(0, \'asd\') should throw at constructor time', () => {
            expect(() => s.in(0, 'asd')).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*type[\s\S]*/g);
        });
        it('in(\'asd\', 0) should throw at constructor time', () => {
            expect(() => s.in('asd', 0)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*type[\s\S]*/g);
        });

        it('in($price, \'asd\') should throw at compile time', () => {
            const _in = s.in($price, 'asd');
            expect(() => _in._compile(fakeMetadata)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*type[\s\S]*/g);
        });
        it('in(\'asd\', $price) should throw at compile time', () => {
            const _in = s.in('asd', $price);
            expect(() => _in._compile(fakeMetadata)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*type[\s\S]*/g);
        });
    });

    describe('compile with correct parameters', () => {
        it('in($price, \'asd\', \'123\') should not throw at constructor time', () => {
            expect(() => s.in($price, 'asd', '123')._compile(fakeMetadata)).not.toThrow();
        });
        it('in(\'asd\', 0) should not throw at constructor time', () => {
            expect(() => s.in('asd', 'asd', '123')._compile(fakeMetadata)).not.toThrow();
        });
    });


    describe('compiled type', () => {
        it('nin($price, \'asd\', \'123\') should be of type float at constructor time', () => {
            const nin = s.nin($category, 'asd', 'qwe');
            expect(nin.type).toEqual('float');
        });
    });

    describe('eval', () => {
        describe('in', () => {
            it('in($category, "cat1", "cat2") should return 0', () => {
                const fakeFeature = { category: 0 };
                const sIn = s.in($category, 'cat1', 'cat2');
                sIn._compile(fakeMetadata);
                const actual = sIn.eval(fakeFeature);
                expect(actual).toEqual(0);
            });

            it('in($category, "cat1", "cat2") should return 1', () => {
                const fakeFeature = { category: 1 };
                const sIn = s.in($category, 'cat1', 'cat2');
                sIn._compile(fakeMetadata);
                const actual = sIn.eval(fakeFeature);
                expect(actual).toEqual(1);
            });
        });

        describe('nin', () => {
            it('nin($category,, "cat1", "cat2") should return 1', () => {
                const fakeFeature = { category: 0 };
                const nin = s.nin($category, 'cat1', 'cat2');
                nin._compile(fakeMetadata);
                const actual = nin.eval(fakeFeature);
                expect(actual).toEqual(1);
            });

            it('nin($category,, "cat1", "cat2") should return 0', () => {
                const fakeFeature = { category: 1 };
                const nin = s.nin($category, 'cat1', 'cat2');
                nin._compile(fakeMetadata);
                const actual = nin.eval(fakeFeature);
                expect(actual).toEqual(0);
            });
        });
    });
});


