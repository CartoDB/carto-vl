import { validateStaticType, validateStaticTypeErrors, validateDynamicTypeErrors } from './utils';
import { ramp, buckets } from '../../../../../src/core/viz/functions';
import * as s from '../../../../../src/core/viz/functions';

describe('src/core/viz/expressions/ramp', () => {
    describe('error control', () => {
        validateStaticTypeErrors('ramp', []);
        validateStaticTypeErrors('ramp', ['number']);
        validateStaticTypeErrors('ramp', ['category']);
        validateDynamicTypeErrors('ramp', ['number', 'sprites']);
    });

    describe('type', () => {
        validateStaticType('ramp', ['number', 'palette'], 'color');
        validateStaticType('ramp', ['category', 'palette'], 'color');
        validateStaticType('ramp', ['category', 'color-array'], 'color');
        validateStaticType('ramp', ['category', 'number-array'], 'number');
        validateStaticType('ramp', ['category', 'sprites'], 'color');
    });

    describe('.eval', () => {
        it('should work with numeric palettes', () => {
            const r = ramp(buckets(0, [10]), [31, 57]);
            r._compile();
            expect(r.eval()).toEqual(31);

            const r2 = ramp(buckets(11, [10]), [31, 57]);
            r2._compile();
            expect(r2.eval()).toEqual(57);
        });

        it('should work with color palettes', () => {
            const firstColor = s.namedColor('red');
            const secondColor = s.namedColor('blue');

            const r = ramp(buckets(0, [10]), [firstColor, secondColor]);
            r._compile();
            expect(r.eval()).toEqual(firstColor._nameToRGBA());

            const r2 = ramp(buckets(11, [10]), [firstColor, secondColor]);
            r2._compile();
            expect(r2.eval()).toEqual(secondColor._nameToRGBA());
        });
    });
});
