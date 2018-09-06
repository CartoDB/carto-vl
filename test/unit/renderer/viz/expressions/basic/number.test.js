import * as s from '../../../../../../src/renderer/viz/expressions';
import { validateStaticType, validateTypeErrors, validateMaxArgumentsError } from '../utils';

describe('src/renderer/viz/expressions/basic/number', () => {
    describe('error control', () => {
        validateTypeErrors('number', [undefined]);
        validateTypeErrors('number', ['123']);
        validateMaxArgumentsError('number', ['123', '123']);
    });

    describe('type', () => {
        validateStaticType('number', [123], 'number');
    });

    describe('.value', () => {
        it('should return the float value', () => {
            const actual = s.number(101).value;

            expect(actual).toEqual(101);
        });
    });

    describe('.eval', () => {
        it('should return the float value', () => {
            const actual = s.number(101).eval();

            expect(actual).toEqual(101);
        });
    });
});
