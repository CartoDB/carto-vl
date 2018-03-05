import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/blend', () => {
    describe('.eval()', () => {
        it('should interpolate a float value 0%', () => {
            const actual = s.blend(0, 100, 0).eval();
            expect(actual).toEqual(0);
        });

        it('should interpolate a float value 50%', () => {
            const actual = s.blend(0, 100, .5).eval();
            expect(actual).toEqual(50);
        });

        it('should interpolate a float value 100%', () => {
            const actual = s.blend(0, 100, 1).eval();
            expect(actual).toEqual(100);
        });
    });
});


