import Metadata from '../../../../../src/renderer/Metadata';
import * as s from '../../../../../src/renderer/viz/expressions';
import { validateTypeErrors, validateStaticType, validateMaxArgumentsError } from './utils';

describe('src/renderer/viz/expressions/belongs', () => {
    const fakeMetadata = new Metadata({
        properties: {
            category: {
                type: 'category',
                categories: [{ name: 'category0' }, { name: 'category1' }, { name: 'category2' }]
            },
            number: {
                type: 'number'
            }
        }
    });

    let $category = null;
    let $number = null;

    beforeEach(() => {
        // Needed a beforeEach to avoid testing against already compiled properties
        $category = s.property('category');
        $number = s.property('number');
    });

    describe('error control', () => {
        validateTypeErrors('in', []);
        validateTypeErrors('in', ['category']);
        validateTypeErrors('in', ['number']);
        validateTypeErrors('in', ['color']);
        validateTypeErrors('in', ['number', 'category-list']);
        validateTypeErrors('in', ['category', 'number-list']);
        validateMaxArgumentsError('in', ['category', 'category-list', 'number']);
        validateMaxArgumentsError('nin', ['category', 'category-list', 'number']);
    });

    describe('type', () => {
        validateStaticType('in', ['category', 'category-list'], 'number');
        validateStaticType('in', ['number', 'number-list'], 'number');
    });

    describe('eval', () => {
        describe('in', () => {
            it('in($category, ["category1", "category2"]) should return 0', () => {
                const fakeFeature = { category: 'category0' };
                const sIn = s.in($category, ['category1', 'category2']);
                sIn._bindMetadata(fakeMetadata);
                const actual = sIn.eval(fakeFeature);
                expect(actual).toEqual(0);
            });

            it('in($category, ["category1", "category2"]) should return 1', () => {
                const fakeFeature = { category: 'category1' };
                const sIn = s.in($category, ['category1', 'category2']);
                sIn._bindMetadata(fakeMetadata);
                const actual = sIn.eval(fakeFeature);
                expect(actual).toEqual(1);
            });

            it('in($number, [1, 2]) should return 0', () => {
                const fakeFeature = { number: 0 };
                const sIn = s.in($number, [1, 2]);
                sIn._bindMetadata(fakeMetadata);
                const actual = sIn.eval(fakeFeature);
                expect(actual).toEqual(0);
            });

            it('in($number, [1, 2]) should return 1', () => {
                const fakeFeature = { number: 1 };
                const sIn = s.in($number, [1, 2]);
                sIn._bindMetadata(fakeMetadata);
                const actual = sIn.eval(fakeFeature);
                expect(actual).toEqual(1);
            });
        });

        describe('nin', () => {
            it('nin($category, ["category1", "category2"]) should return 1', () => {
                const fakeFeature = { category: 'category0' };
                const nin = s.nin($category, ['category1', 'category2']);
                nin._bindMetadata(fakeMetadata);
                const actual = nin.eval(fakeFeature);
                expect(actual).toEqual(1);
            });

            it('nin($category, ["category1", "category2"]) should return 0', () => {
                const fakeFeature = { category: 'category1' };
                const nin = s.nin($category, ['category1', 'category2']);
                nin._bindMetadata(fakeMetadata);
                const actual = nin.eval(fakeFeature);
                expect(actual).toEqual(0);
            });

            it('in($number, [1, 2]) should return 1', () => {
                const fakeFeature = { number: 0 };
                const sIn = s.nin($number, [1, 2]);
                sIn._bindMetadata(fakeMetadata);
                const actual = sIn.eval(fakeFeature);
                expect(actual).toEqual(1);
            });

            it('in($number, [1, 2]) should return 0', () => {
                const fakeFeature = { number: 1 };
                const sIn = s.nin($number, [1, 2]);
                sIn._bindMetadata(fakeMetadata);
                const actual = sIn.eval(fakeFeature);
                expect(actual).toEqual(0);
            });
        });
    });
});
