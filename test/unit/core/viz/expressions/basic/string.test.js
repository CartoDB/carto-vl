import * as s from '../../../../../../src/core/viz/functions';
import { validateStaticType, validateStaticTypeErrors } from '../utils';

describe('src/core/viz/expressions/string', () => {
    describe('error control', () => {
        validateStaticTypeErrors('string', []);
        validateStaticTypeErrors('string', [undefined]);
        validateStaticTypeErrors('string', [123]);
        validateStaticTypeErrors('string', ['number']);
    });

    describe('type', () => {
        validateStaticType('string', ['red'], 'string');
        validateStaticType('string', ['123'], 'string');
    });

    describe('.value', () => {
        it('should return the value of the string', () => {
            const actual = s.string('string0').value;

            expect(actual).toEqual('string0');
        });
    });

    describe('.eval', () => {
        const fakeMetadata = {
            columns: [{
                type: 'string',
                name: 'string',
                categoryNames: ['string0', 'string1', 'string2']
            }],
            categoryIDs: {
                'string0': 0,
                'string1': 1,
                'string2': 2,
            }
        };
        it('should return the value from the metadata', () => {
            const categoryExpresion = s.string('string0');
            categoryExpresion._compile(fakeMetadata);
            const actual = categoryExpresion.eval();

            expect(actual).toEqual(0);
        });
    });
});
