import { validateStaticType, validateMaxArgumentsError, validateCompileTypeError } from '../utils';
import reverse from '../../../../../../src/renderer/viz/expressions/reverse/reverse';
import { palettes, namedColor } from '../../../../../../src/renderer/viz/expressions';
import Time from '../../../../../../src/renderer/viz/expressions/time';

describe('src/renderer/viz/expressions/reverse', () => {
    describe('type', () => {
        validateStaticType('reverse', [[1, 2]], 'number-array');
        validateStaticType('reverse', [['A', 'B']], 'category-array');
        validateStaticType('reverse', ['color-array'], 'color-array');
        validateStaticType('reverse', ['palette'], 'palette');
    });
    describe('error control', () => {
        validateCompileTypeError('reverse', ['number']);
        validateMaxArgumentsError('reverse', [[1, 2], 0]);
        validateMaxArgumentsError('reverse', ['palette', 0]);
    });

    describe('palette', () => {
        it('should reverse colors in a palette', () => {
            let { 0: firstColor, 2: lastColor } = palettes.PRISM.subPalettes[3];

            const reversed = reverse(palettes.PRISM).subPalettes[3];
            expect(reversed[0]).toEqual(lastColor);
            expect(reversed[2]).toEqual(firstColor);
        });
    });

    describe('array', () => {
        describe('eval', () => {
            it('should reverse a number-array', () => {
                const array = [0, 1, 2];
                const reversed = reverse(array).eval();
                expect(reversed[0]).toEqual(2);
                expect(reversed[2]).toEqual(0);
            });

            it('should reverse a category-array', () => {
                const array = ['A', 'B', 'C'];
                const reversed = reverse(array).eval();
                expect(reversed[0]).toEqual('C');
                expect(reversed[2]).toEqual('A');
            });

            it('should reverse a color-array', () => {
                const red = namedColor('red');
                const blue = namedColor('blue');
                const reversed = reverse([red, blue]).eval();
                expect(reversed[0]).toEqual(blue.eval());
                expect(reversed[1]).toEqual(red.eval());
            });

            it('should reverse a time-array', () => {
                const firstDay = new Time('2018-08-01');
                const lastDay = new Time('2018-08-31');

                const array = [firstDay, lastDay];
                const reversed = reverse(array).eval();
                expect(reversed[0]).toEqual(lastDay.eval());
                expect(reversed[1]).toEqual(firstDay.eval());
            });
        });
    });
});
