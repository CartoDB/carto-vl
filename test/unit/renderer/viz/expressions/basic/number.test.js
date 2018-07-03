import * as s from '../../../../../../src/renderer/viz/expressions';
import { validateStaticType, validateStaticTypeErrors } from '../utils';

describe('src/renderer/viz/expressions/basic/number', () => {
    describe('error control', () => {
        validateStaticTypeErrors('number', [undefined]);
        validateStaticTypeErrors('number', ['123']);
        validateStaticTypeErrors('number', ['color', 'number']);
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
