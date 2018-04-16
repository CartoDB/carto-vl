import * as s from '../../../../../src/core/viz/functions';
import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/floatConstant', () => {
    describe('error control', () => {
        validateStaticTypeErrors('float', [undefined]);
        validateStaticTypeErrors('float', ['123']);
        validateStaticTypeErrors('float', ['color', 'float']);
    });

    describe('type', () => {
        validateStaticType('float', [123], 'float');
    });

    describe('.eval()', () => {
        it('should return the float value', () => {
            const actual = s.floatConstant(101).eval();

            expect(actual).toEqual(101);
        });
    });
});


