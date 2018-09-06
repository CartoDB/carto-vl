import {
    validateTypeErrors,
    validateStaticType,
    validateMaxArgumentsError
} from './utils';

import {
    globalQuantiles,
    property,
    globalEqIntervals,
    viewportEqIntervals,
    viewportQuantiles
} from '../../../../../src/renderer/viz/expressions';

import Metadata from '../../../../../src/renderer/Metadata';

describe('src/renderer/viz/expressions/classifier', () => {
    describe('error control', () => {
        validateTypeErrors('viewportQuantiles', []);
        validateTypeErrors('viewportQuantiles', ['number', 'category']);
        validateTypeErrors('viewportQuantiles', ['category', 2]);
        validateTypeErrors('viewportQuantiles', ['color', 2]);
        validateTypeErrors('viewportQuantiles', ['number', 'color']);
        validateMaxArgumentsError('viewportQuantiles', ['number', 'number-array', 'number']);

        validateTypeErrors('viewportEqIntervals', []);
        validateTypeErrors('viewportEqIntervals', ['number', 'category']);
        validateTypeErrors('viewportEqIntervals', ['category', 2]);
        validateTypeErrors('viewportEqIntervals', ['color', 2]);
        validateTypeErrors('viewportEqIntervals', ['number', 'color']);
        validateMaxArgumentsError('viewportEqIntervals', ['number', 'number-array', 'number']);

        validateTypeErrors('globalQuantiles', []);
        validateTypeErrors('globalQuantiles', ['number', 'category']);
        validateTypeErrors('globalQuantiles', ['category', 2]);
        validateTypeErrors('globalQuantiles', ['color', 2]);
        validateTypeErrors('globalQuantiles', ['number', 'color']);
        validateMaxArgumentsError('globalQuantiles', ['number', 'number-array', 'number']);

        validateTypeErrors('globalEqIntervals', []);
        validateTypeErrors('globalEqIntervals', ['number', 'category']);
        validateTypeErrors('globalEqIntervals', ['category', 2]);
        validateTypeErrors('globalEqIntervals', ['color', 2]);
        validateTypeErrors('globalEqIntervals', ['number', 'color']);
        validateMaxArgumentsError('globalEqIntervals', ['number', 'number-array', 'number']);
    });

    describe('type', () => {
        validateStaticType('viewportQuantiles', ['number-property', 2], 'category');
    });

    describe('eval', () => {
        const $price = property('price');
        const METADATA = new Metadata({
            properties: {
                price: {
                    type: 'number',
                    min: 0,
                    max: 5
                }
            },
            sample: [{
                price: 0
            },
            {
                price: 1
            },
            {
                price: 2
            },
            {
                price: 3
            },
            {
                price: 4
            },
            {
                price: 5
            }
            ]
        });

        function prepare (expr) {
            expr._bindMetadata(METADATA);
            expr._resetViewportAgg(METADATA);
            expr.accumViewportAgg({
                price: 0
            });
            expr.accumViewportAgg({
                price: 1
            });

            expr.accumViewportAgg({
                price: 2
            });
            expr.accumViewportAgg({
                price: 3
            });

            expr.accumViewportAgg({
                price: 4
            });
            expr.accumViewportAgg({
                price: 5
            });
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
