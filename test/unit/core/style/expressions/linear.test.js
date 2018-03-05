import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/linear', () => {
    describe('.eval()', () => {
        it('should return value linearly interpolated to min-max range (100%)', () => {
            const actual = s.linear(100, 0, 100).eval();

            expect(actual).toEqual(1);
        });

        it('should return value linearly interpolated to min-max range (10%)', () => {
            const actual = s.linear(100, 0, 1000).eval();

            expect(actual).toEqual(0.1);
        });
    });
});

