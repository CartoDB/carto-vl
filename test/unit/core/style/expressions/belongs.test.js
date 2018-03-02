import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/belongs', () => {
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
    const $category = s.property('category');
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


