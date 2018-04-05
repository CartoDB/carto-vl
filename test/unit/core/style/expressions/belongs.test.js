import * as s from '../../../../../src/core/style/functions';
import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/belongs', () => {
    const fakeMetadata = {
        columns: [{
            type: 'category',
            name: 'category',
            categories: {
                0: {
                    name: 'cat0',
                    counts: 1
                },
                1: {
                    name: 'cat1',
                    counts: 1
                },
                2: {
                    name: 'cat2',
                    counts: 1
                }
            }
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

    beforeEach(() => {
        // Needed a beforeEach to avoid testing against already compiled properties
        $category = s.property('category');
    });

    describe('error control', () => {
        validateStaticTypeErrors('in', []);
        validateStaticTypeErrors('in', ['color']);
        validateDynamicTypeErrors('in', ['float', 'category']);
        validateDynamicTypeErrors('in', ['category', 'float']);
    });

    describe('type', () => {
        validateStaticType('in', ['category', 'category'], 'float');
        validateStaticType('in', ['category', 'category', 'category'], 'float');
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
            it('in($category) should return 0', () => {
                const fakeFeature = { category: 0 };
                const sIn = s.in($category);
                sIn._compile(fakeMetadata);
                const actual = sIn.eval(fakeFeature);
                expect(actual).toEqual(0);
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

        it('nin($category) should return 1', () => {
            const fakeFeature = { category: 1 };
            const nin = s.nin($category);
            nin._compile(fakeMetadata);
            const actual = nin.eval(fakeFeature);
            expect(actual).toEqual(1);
        });
    });
});
