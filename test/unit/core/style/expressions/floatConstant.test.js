import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/floatConstant', () => {
    describe('.eval()', () => {
        it('should return the float value', () => {
            const actual = s.floatConstant(101).eval();

            expect(actual).toEqual(101);
        });
    });
});


