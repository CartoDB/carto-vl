import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';
import { globalQuantiles, property, quantiles } from '../../../../../src/core/viz/functions';

describe('src/core/viz/expressions/quantiles', () => {
    describe('error control', () => {
        validateStaticTypeErrors('quantiles', []);
        validateStaticTypeErrors('quantiles', ['number']);
        validateStaticTypeErrors('quantiles', ['number', 'category']);
        validateDynamicTypeErrors('quantiles', ['category', 2]);
        validateStaticTypeErrors('quantiles', ['color', 2]);
        validateStaticTypeErrors('quantiles', ['number', 'color']);
    });

    describe('type', () => {
        validateStaticType('quantiles', ['number-property', 2], 'category');
    });

    describe('eval', () => {
        const $price = property('price');
        function prepare(expr) {
            expr._compile({
                columns: [
                    { name: 'price', type: 'number' },
                ],
                sample: [
                    {price: 0},
                    {price: 1},
                    {price: 2},
                    {price: 3},
                    {price: 4},
                    {price: 5},
                    {price: 6},
                ]
            });
            expr._resetViewportAgg();
            expr._accumViewportAgg({ price: 0 });
            expr._accumViewportAgg({ price: 1 });

            expr._accumViewportAgg({ price: 2 });
            expr._accumViewportAgg({ price: 3 });

            expr._accumViewportAgg({ price: 4 });
            expr._accumViewportAgg({ price: 5 });
        }
        it('globalQuantiles($price, 2)', () => {
            const q = globalQuantiles($price, 2);
            prepare(q);
            expect(q.getBreakpointList()).toEqual([3]);
        });
        it('viewportQuantiles($price, 2)', () => {
            const q = quantiles($price, 2);
            prepare(q);
            expect(q.getBreakpointList()).toEqual([3]);
        });

        it('globalQuantiles($price, 3)', () => {
            const q = globalQuantiles($price, 3);
            prepare(q);
            expect(q.getBreakpointList()).toEqual([2, 4]);
        });
        it('viewportQuantiles($price, 3)', () => {
            const q = quantiles($price, 3);
            prepare(q);
            expect(q.getBreakpointList()).toEqual([2, 4]);
        });
    });
});
