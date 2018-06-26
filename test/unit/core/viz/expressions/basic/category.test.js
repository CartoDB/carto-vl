import * as s from '../../../../../../src/core/viz/functions';
import { validateStaticType, validateStaticTypeErrors } from '../utils';

describe('src/core/viz/expressions/basic/category', () => {
    describe('error control', () => {
        validateStaticTypeErrors('category', []);
        validateStaticTypeErrors('category', [undefined]);
        validateStaticTypeErrors('category', [123]);
        validateStaticTypeErrors('category', ['number']);
    });

    describe('type', () => {
        validateStaticType('category', ['red'], 'category');
        validateStaticType('category', ['123'], 'category');
    });

    describe('.value', () => {
        it('should return the value of the string', () => {
            const actual = s.category('cat0').value;

            expect(actual).toEqual('cat0');
        });
    });

    describe('.eval', () => {
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
        
        it('should return the value from the metadata', () => {
            const categoryExpresion = s.category('cat0');
            categoryExpresion._compile(fakeMetadata);
            const actual = categoryExpresion.eval();

            expect(actual).toEqual('cat0');
        });
    });
});
