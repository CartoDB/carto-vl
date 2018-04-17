import * as s from '../../../../../src/core/viz/functions';

describe('src/core/viz/expressions/near', () => {
    describe('.eval()', () => {
        it('should return 1 when the value is equal to the center', () => {
            const actual = s.near(100, 100, 10, 10).eval();

            expect(actual).toEqual(1);
        });

        it('should return 1 when the value is equivalent to the center', () => {
            const actual = s.near(100, 110, 10, 10).eval();

            expect(actual).toEqual(1);
        });

        it('should return 0 when the value is outside  the center', () => {
            const actual = s.near(100, 120, 10, 10).eval();

            expect(actual).toEqual(0);
        });

        it('should return % when the value is outside the center and inside the falloff range', () => {
            const actual = s.near(100, 111, 10, 10).eval();

            expect(actual).toEqual(0.9);
        });
    });
});

