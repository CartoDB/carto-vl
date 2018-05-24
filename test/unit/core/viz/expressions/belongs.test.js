import * as e from '../../../../../src/core/viz/functions';
import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/belongs', () => {
    const fakeMetadata = {
        columns: [{
            type: 'category',
            name: 'category',
            categoryNames: ['category0', 'category1', 'category2']
        }],
        categoryIDs: {
            'category0': 0,
            'category1': 1,
            'category2': 2
        }
    };

    let $category = null;

    beforeEach(() => {
        // Needed a beforeEach to avoid testing against already compiled properties
        $category = e.property('category');
    });

    describe('error control', () => {
        validateStaticTypeErrors('in', []);
        validateStaticTypeErrors('in', ['category']);
        validateStaticTypeErrors('in', ['number']);
        validateStaticTypeErrors('in', ['color']);
        validateDynamicTypeErrors('in', ['number', 'category-array']);
        validateDynamicTypeErrors('in', ['category', 'number-array']);
    });

    describe('type', () => {
        validateStaticType('in', ['category', 'category-array'], 'number');
    });

    describe('eval', () => {
        describe('in', () => {
            it('in($category, ["category1", "category2"]) should return 0', () => {
                const fakeFeature = { category: 0 };
                const sIn = e.in($category, ['category1', 'category2']);
                sIn._compile(fakeMetadata);
                const actual = sIn.eval(fakeFeature);
                expect(actual).toEqual(0);
            });

            it('in($category, ["category1", "category2"]) should return 1', () => {
                const fakeFeature = { category: 1 };
                const sIn = e.in($category, ['category1', 'category2']);
                sIn._compile(fakeMetadata);
                const actual = sIn.eval(fakeFeature);
                expect(actual).toEqual(1);
            });
        });

        describe('nin', () => {
            it('nin($category, ["category1", "category2"]) should return 1', () => {
                const fakeFeature = { category: 0 };
                const nin = e.nin($category, ['category1', 'category2']);
                nin._compile(fakeMetadata);
                const actual = nin.eval(fakeFeature);
                expect(actual).toEqual(1);
            });

            it('nin($category, ["category1", "category2"]) should return 0', () => {
                const fakeFeature = { category: 1 };
                const nin = e.nin($category, ['category1', 'category2']);
                nin._compile(fakeMetadata);
                const actual = nin.eval(fakeFeature);
                expect(actual).toEqual(0);
            });
        });
    });
});
