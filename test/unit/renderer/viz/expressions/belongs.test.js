import Metadata from '../../../../../src/renderer/Metadata';
import * as s from '../../../../../src/renderer/viz/expressions';
import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/renderer/viz/expressions/belongs', () => {
    const fakeMetadata = new Metadata({
        properties: {
            category: {
                type: 'category',
                categories: [{ name: 'category0' }, { name: 'category1' }, { name: 'category2' }]
            }
        }
    });

    let $category = null;

    beforeEach(() => {
        // Needed a beforeEach to avoid testing against already compiled properties
        $category = s.property('category');
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
                const fakeFeature = { category: 'category0' };
                const sIn = s.in($category, ['category1', 'category2']);
                sIn._compile(fakeMetadata);
                const actual = sIn.eval(fakeFeature);
                expect(actual).toEqual(0);
            });

            it('in($category, ["category1", "category2"]) should return 1', () => {
                const fakeFeature = { category: 'category1' };
                const sIn = s.in($category, ['category1', 'category2']);
                sIn._compile(fakeMetadata);
                const actual = sIn.eval(fakeFeature);
                expect(actual).toEqual(1);
            });
        });

        describe('nin', () => {
            it('nin($category, ["category1", "category2"]) should return 1', () => {
                const fakeFeature = { category: 'category0' };
                const nin = s.nin($category, ['category1', 'category2']);
                nin._compile(fakeMetadata);
                const actual = nin.eval(fakeFeature);
                expect(actual).toEqual(1);
            });

            it('nin($category, ["category1", "category2"]) should return 0', () => {
                const fakeFeature = { category: 'category1' };
                const nin = s.nin($category, ['category1', 'category2']);
                nin._compile(fakeMetadata);
                const actual = nin.eval(fakeFeature);
                expect(actual).toEqual(0);
            });
        });
    });
});
