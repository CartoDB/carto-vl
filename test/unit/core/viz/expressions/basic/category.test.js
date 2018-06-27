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

});
