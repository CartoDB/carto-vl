import * as s from '../../../../../src/core/style/functions';


// Add custom toString function to improve test output.
s.TRUE.toString = () => 's.TRUE';
s.FALSE.toString = () => 's.FALSE';

describe('src/core/style/expressions/belongs', () => {
    describe('in', () => {
        it('in("cat0", "cat1", "cat2") should return 0', () => {
            const fakeFeature = { category: 'cat0' };
            const $category = s.property('category');
            const actual = s.in($category, 'cat1', 'cat2').eval(fakeFeature);

            expect(actual).toEqual(0);
        });

        it('in("cat1", "cat1", "cat2") sould return 1', () => {
            const fakeFeature = { category: 'cat1' };
            const $category = s.property('category');
            const actual = s.in($category, 'cat1', 'cat2').eval(fakeFeature);

            expect(actual).toEqual(1);
        });
    });

    describe('nin', () => {
        it('nin("cat0", "cat1", "cat2") should return 1', () => {
            const fakeFeature = { category: 'cat0' };
            const $category = s.property('category');
            const actual = s.nin($category, 'cat1', 'cat2').eval(fakeFeature);

            expect(actual).toEqual(1);
        });

        it('nin("cat1", "cat1", "cat2") sould return 0', () => {
            const fakeFeature = { category: 'cat1' };
            const $category = s.property('category');
            const actual = s.nin($category, 'cat1', 'cat2').eval(fakeFeature);

            expect(actual).toEqual(0);
        });
    });

});


