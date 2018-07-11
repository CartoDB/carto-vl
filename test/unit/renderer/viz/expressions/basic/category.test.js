import * as s from '../../../../../../src/renderer/viz/expressions';
import { validateStaticType, validateStaticTypeErrors } from '../utils';
import Metadata from '../../../../../../src/renderer/Metadata';

describe('src/renderer/viz/expressions/basic/category', () => {
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
        const fakeMetadata = new Metadata({
            properties: {
                category: {
                    type: 'category',
                    categories: [
                        { category: 'cat0' }, 
                        { category: 'cat1' },
                        { category: 'cat2' }
                    ]
                }
            }
        });
        
        it('should return the value from the metadata', () => {
            const categoryExpresion = s.category('cat0');
            categoryExpresion._compile(fakeMetadata);
            const actual = categoryExpresion.eval();

            expect(actual).toEqual('cat0');
        });
    });
});
