import * as s from '../../../../../src/core/style/functions';
import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/category', () => {
    describe('error control', () => {
        validateStaticTypeErrors('category', []);
        validateStaticTypeErrors('category', [undefined]);
        validateStaticTypeErrors('category', [123]);
        validateStaticTypeErrors('category', ['float']);
    });

    describe('type', () => {
        validateStaticType('category', ['red'], 'category');
        validateStaticType('category', ['123'], 'category');
    });

    describe('.eval()', () => {
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
            }],
            categoryIDs: {
                'cat0': 0,
                'cat1': 1,
                'cat2': 2,
            }
        };
        it('should return the value from the metadata', () => {
            const categoryExpresion = s.category('cat0');
            categoryExpresion._compile(fakeMetadata);
            const actual = categoryExpresion.eval();

            expect(actual).toEqual(0);
        });
    });
});
