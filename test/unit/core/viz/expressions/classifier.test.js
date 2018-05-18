import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';
import { globalQuantiles, property, globalEqIntervals, viewportEqIntervals, viewportQuantiles } from '../../../../../src/core/viz/functions';

describe('src/core/viz/expressions/classifier', () => {
    describe('error control', () => {
        validateStaticTypeErrors('viewportQuantiles', []);
        validateStaticTypeErrors('viewportQuantiles', ['number']);
        validateStaticTypeErrors('viewportQuantiles', ['number', 'string']);
        validateDynamicTypeErrors('viewportQuantiles', ['string', 2]);
        validateStaticTypeErrors('viewportQuantiles', ['color', 2]);
        validateStaticTypeErrors('viewportQuantiles', ['number', 'color']);
    });

    describe('type', () => {
        validateStaticType('viewportQuantiles', ['number-property', 2], 'string');
    });

    describe('eval', () => {
        const $price = property('price');
        function prepare(expr) {
            expr._compile({
                columns: [
                    { name: 'price', type: 'number', min: 0, max: 5 },
                ],
                sample: [
                    { price: 0 },
                    { price: 1 },
                    { price: 2 },
                    { price: 3 },
                    { price: 4 },
                    { price: 5 },
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
            const q = viewportQuantiles($price, 2);
            prepare(q);
            expect(q.getBreakpointList()).toEqual([3]);
        });
        it('globalEqIntervals($price, 2)', () => {
            const q = globalEqIntervals($price, 2);
            prepare(q);
            expect(q.getBreakpointList()).toEqual([2.5]);
        });
        it('viewportEqIntervals($price, 2)', () => {
            const q = viewportEqIntervals($price, 2);
            prepare(q);
            expect(q.getBreakpointList()).toEqual([2.5]);
        });

        it('globalQuantiles($price, 3)', () => {
            const q = globalQuantiles($price, 3);
            prepare(q);
            expect(q.getBreakpointList()).toEqual([2, 4]);
        });
        it('viewportQuantiles($price, 3)', () => {
            const q = viewportQuantiles($price, 3);
            prepare(q);
            expect(q.getBreakpointList()).toEqual([2, 4]);
        });
        it('viewportEqIntervals($price, 3)', () => {
            const q = viewportEqIntervals($price, 3);
            prepare(q);
            expect(q.getBreakpointList()[0]).toBeCloseTo(5 / 3, 4);
            expect(q.getBreakpointList()[1]).toBeCloseTo(10 / 3, 4);
        });
    });
});
