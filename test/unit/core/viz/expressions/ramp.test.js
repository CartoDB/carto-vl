import { validateStaticType, validateStaticTypeErrors } from './utils';
import { ramp, buckets } from '../../../../../src/core/viz/functions';

describe('src/core/viz/expressions/ramp', () => {
    describe('error control', () => {
        validateStaticTypeErrors('ramp', []);
        validateStaticTypeErrors('ramp', ['number']);
        validateStaticTypeErrors('ramp', ['category']);
    });

    describe('type', () => {
        validateStaticType('ramp', ['number', 'palette'], 'color');
        validateStaticType('ramp', ['category', 'palette'], 'color');
        validateStaticType('ramp', ['category', 'customPalette'], 'color');
        validateStaticType('ramp', ['category', 'customPaletteNumber'], 'number');
    });

    describe('eval', () => {
        it('should work with numeric palettes', () => {
            const r = ramp(buckets(0, 10), [31, 57]);
            r._compile();
            expect(r.eval()).toEqual(31);

            const r2 = ramp(buckets(11, 10), [31, 57]);
            r2._compile();
            console.log(r2.pixel);
            expect(r2.eval()).toEqual(57);
        });
        // TODO colors
    });
});


