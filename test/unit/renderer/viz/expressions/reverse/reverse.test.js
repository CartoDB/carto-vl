import { validateStaticType, validateMaxArgumentsError, validateTypeErrors } from '../utils';
import reverse from '../../../../../../src/renderer/viz/expressions/reverse/reverse';
import { palettes, namedColor } from '../../../../../../src/renderer/viz/expressions';
import Time from '../../../../../../src/renderer/viz/expressions/time';

describe('src/renderer/viz/expressions/reverse', () => {
    describe('type', () => {
        validateStaticType('reverse', [[1, 2]], 'number-list');
        validateStaticType('reverse', [['A', 'B']], 'category-list');
        validateStaticType('reverse', ['color-list'], 'color-list');
        validateStaticType('reverse', ['palette'], 'palette');
    });
    describe('error control', () => {
        validateTypeErrors('reverse', ['number']);
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

    describe('list', () => {
        describe('eval', () => {
            it('should reverse a number-list', () => {
                const list = [0, 1, 2];
                const reversed = reverse(list).eval();
                expect(reversed[0]).toEqual(2);
                expect(reversed[2]).toEqual(0);
            });

            it('should reverse a category-list', () => {
                const list = ['A', 'B', 'C'];
                const reversed = reverse(list).eval();
                expect(reversed[0]).toEqual('C');
                expect(reversed[2]).toEqual('A');
            });

            it('should reverse a color-list', () => {
                const red = namedColor('red');
                const blue = namedColor('blue');
                const reversed = reverse([red, blue]).eval();
                expect(reversed[0]).toEqual(blue.eval());
                expect(reversed[1]).toEqual(red.eval());
            });

            it('should reverse a time-list', () => {
                const firstDay = new Time('2018-08-01');
                const lastDay = new Time('2018-08-31');

                const list = [firstDay, lastDay];
                const reversed = reverse(list).eval();
                expect(reversed[0]).toEqual(lastDay.eval());
                expect(reversed[1]).toEqual(firstDay.eval());
            });
        });
    });
});
