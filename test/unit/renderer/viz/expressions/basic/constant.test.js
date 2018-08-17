import * as s from '../../../../../../src/renderer/viz/expressions';
import { validateStaticType, validateStaticTypeErrors, validateMaxArgumentsError } from '../utils';

describe('src/renderer/viz/expressions/basic/constant', () => {
    describe('error control', () => {
        validateStaticTypeErrors('number', [undefined]);
        validateStaticTypeErrors('number', ['123']);
        validateMaxArgumentsError('number', ['number', 'number']);
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
