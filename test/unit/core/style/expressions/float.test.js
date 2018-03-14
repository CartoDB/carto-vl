import * as s from '../../../../../src/core/style/functions';
import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/float', () => {
    describe('error control', () => {
        validateStaticTypeErrors('float', [undefined]);
        validateStaticTypeErrors('float', ['123']);
        validateStaticTypeErrors('float', ['color', 'float']);
    });

    describe('type', () => {
        validateStaticType('float', [123], 'float');
    });

    describe('eval', () => {
        it('should return the float value', () => {
            const actual = s.float(101).eval();

            expect(actual).toEqual(101);
        });
    });
});


