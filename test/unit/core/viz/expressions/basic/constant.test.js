import * as s from '../../../../../../src/core/viz/functions';
import { validateStaticType, validateStaticTypeErrors } from '../utils';

describe('src/core/viz/expressions/constant', () => {
    describe('error control', () => {
        validateStaticTypeErrors('number', [undefined]);
        validateStaticTypeErrors('number', ['123']);
        validateStaticTypeErrors('number', ['color', 'number']);
    });

    describe('type', () => {
        validateStaticType('number', [123], 'number');
    });

    describe('.eval()', () => {
        it('should return the float value', () => {
            const actual = s.constant(101).eval();

            expect(actual).toEqual(101);
        });
    });
});
