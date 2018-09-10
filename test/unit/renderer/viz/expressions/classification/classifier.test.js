import {
    validateStaticType,
    validateTypeErrors,
    validateMaxArgumentsError
} from '../utils';

import { average, standardDeviation } from '../../../../../../src/renderer/viz/expressions/stats';
import {
    property,
    globalQuantiles,
    globalEqIntervals,
    globalMeanStandardDev,
    viewportQuantiles,
    viewportEqIntervals,
    viewportMeanStandardDev
} from '../../../../../../src/renderer/viz/expressions';

import Metadata from '../../../../../../src/renderer/Metadata';

describe('src/renderer/viz/expressions/classifier', () => {
    describe('error control', () => {
        describe('global', () => {
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

            validateTypeErrors('globalMeanStandardDev', []);
            validateTypeErrors('globalMeanStandardDev', ['number', 'category']);
            validateTypeErrors('globalMeanStandardDev', ['category', 2]);
            validateTypeErrors('globalMeanStandardDev', ['color', 2]);
            validateTypeErrors('globalMeanStandardDev', ['number', 'color']);
            validateMaxArgumentsError('globalMeanStandardDev', ['number', 'number-array', 'number', 'number']);
        });

        describe('viewport', () => {
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

            validateTypeErrors('viewportMeanStandardDev', []);
            validateTypeErrors('viewportMeanStandardDev', ['number', 'category']);
            validateTypeErrors('viewportMeanStandardDev', ['category', 2]);
            validateTypeErrors('viewportMeanStandardDev', ['color', 2]);
            validateTypeErrors('viewportMeanStandardDev', ['number', 'color']);
            validateMaxArgumentsError('viewportMeanStandardDev', ['number', 'number-array', 'number', 'number']);
        });
    });

    describe('type', () => {
        validateStaticType('viewportQuantiles', ['number-property', 2], 'category');
        validateStaticType('viewportMeanStandardDev', ['number-property', 2, 0.5], 'category');
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

        function sampleValues () {
            return METADATA.sample.map(s => s.price);
        }

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

        describe('global', () => {
            // globalQuantiles ---
            it('globalQuantiles($price, 2)', () => {
                const q = globalQuantiles($price, 2);
                prepare(q);
                expect(q.getBreakpointList()).toEqual([3]);
            });
            it('globalQuantiles($price, 3)', () => {
                const q = globalQuantiles($price, 3);
                prepare(q);
                expect(q.getBreakpointList()).toEqual([2, 4]);
            });

            // globalEqIntervals ---
            it('globalEqIntervals($price, 2)', () => {
                const q = globalEqIntervals($price, 2);
                prepare(q);
                expect(q.getBreakpointList()).toEqual([2.5]);
            });

            // globalMeanStandardDev ---
            describe('.globalMeanStandardDev', () => {
                const avg = average(sampleValues());
                const std = standardDeviation(sampleValues());

                it('globalMeanStandardDev($price, 2)', () => {
                    const q = globalMeanStandardDev($price, 2);
                    prepare(q);
                    expect(q.getBreakpointList()).toEqual([avg]);
                });

                it('globalMeanStandardDev($price, 3)', () => {
                    const q = globalMeanStandardDev($price, 3);
                    prepare(q);
                    expect(q.getBreakpointList()).toEqual([avg - std, avg + std]);
                });

                it('globalMeanStandardDev($price, 4)', () => {
                    const q = globalMeanStandardDev($price, 4);
                    prepare(q);
                    expect(q.getBreakpointList()).toEqual([avg - std, avg, avg + std]);
                });

                it('globalMeanStandardDev($price, 5)', () => {
                    const q = globalMeanStandardDev($price, 5);
                    prepare(q);
                    expect(q.getBreakpointList()).toEqual([
                        avg - (2 * std), avg - std, avg + std, avg + (2 * std)
                    ]);
                });

                it('globalMeanStandardDev($price, 3, 0.5) --> using 1/2 standard deviation', () => {
                    const q = globalMeanStandardDev($price, 3, 0.5);
                    prepare(q);
                    expect(q.getBreakpointList()).toEqual([avg - 0.5 * std, avg + 0.5 * std]);
                });

                it('doesn\'t allow an invalid classSize (<=0)', () => {
                    expect(() => globalMeanStandardDev($price, 3, 0.0)).toThrow();
                    expect(() => globalMeanStandardDev($price, 3, -1.0)).toThrow();
                });

                it('doesn\'t allow an invalid number of buckets (<=2)', () => {
                    expect(() => globalMeanStandardDev($price, 0)).toThrow();
                    expect(() => globalMeanStandardDev($price, 1)).toThrow();
                });
            });
        });

        describe('viewport', () => {
            // viewportQuantiles ---
            it('viewportQuantiles($price, 2)', () => {
                const q = viewportQuantiles($price, 2);
                prepare(q);
                expect(q.getBreakpointList()).toEqual([3]);
            });
            it('viewportQuantiles($price, 3)', () => {
                const q = viewportQuantiles($price, 3);
                prepare(q);
                expect(q.getBreakpointList()).toEqual([2, 4]);
            });

            // viewportEqIntervals ---
            it('viewportEqIntervals($price, 2)', () => {
                const q = viewportEqIntervals($price, 2);
                prepare(q);
                expect(q.getBreakpointList()).toEqual([2.5]);
            });
            it('viewportEqIntervals($price, 3)', () => {
                const q = viewportEqIntervals($price, 3);
                prepare(q);
                expect(q.getBreakpointList()[0]).toBeCloseTo(5 / 3, 4);
                expect(q.getBreakpointList()[1]).toBeCloseTo(10 / 3, 4);
            });

            // viewportMeanStandardDev ---
            describe('.viewportMeanStandardDev', () => {
                const avg = average(sampleValues());
                const std = standardDeviation(sampleValues());

                it('viewportMeanStandardDev($price, 2)', () => {
                    const q = viewportMeanStandardDev($price, 2);
                    prepare(q);
                    expect(q.getBreakpointList()).toBeCloseTo([avg], 2);
                });

                it('viewportMeanStandardDev($price, 3)', () => {
                    const q = viewportMeanStandardDev($price, 3);
                    prepare(q);
                    expect(q.getBreakpointList()[0]).toBeCloseTo(avg - std, 2);
                    expect(q.getBreakpointList()[1]).toBeCloseTo(avg + std, 2);
                });

                it('viewportMeanStandardDev($price, 4)', () => {
                    const q = viewportMeanStandardDev($price, 4);
                    prepare(q);
                    expect(q.getBreakpointList()[0]).toBeCloseTo(avg - std, 2);
                    expect(q.getBreakpointList()[1]).toBeCloseTo(avg, 2);
                    expect(q.getBreakpointList()[2]).toBeCloseTo(avg + std, 2);
                });

                it('viewportMeanStandardDev($price, 5)', () => {
                    const q = viewportMeanStandardDev($price, 5);
                    prepare(q);
                    expect(q.getBreakpointList()[0]).toBeCloseTo(avg - (2 * std), 2);
                    expect(q.getBreakpointList()[1]).toBeCloseTo(avg - std, 2);
                    expect(q.getBreakpointList()[2]).toBeCloseTo(avg + std, 2);
                    expect(q.getBreakpointList()[3]).toBeCloseTo(avg + (2 * std), 2);
                });

                it('viewportMeanStandardDev($price, 3, 0.5) --> using 1/2 standard deviation', () => {
                    const q = viewportMeanStandardDev($price, 3, 0.5);
                    prepare(q);
                    expect(q.getBreakpointList()[0]).toBeCloseTo(avg - 0.5 * std, 2);
                    expect(q.getBreakpointList()[1]).toBeCloseTo(avg + 0.5 * std, 2);
                });

                it('doesn\'t allow an invalid classSize (<=0)', () => {
                    expect(() => viewportMeanStandardDev($price, 3, 0.0)).toThrow();
                    expect(() => viewportMeanStandardDev($price, 3, -1.0)).toThrow();
                });

                it('doesn\'t allow an invalid number of buckets (<=2)', () => {
                    expect(() => viewportMeanStandardDev($price, 0)).toThrow();
                    expect(() => viewportMeanStandardDev($price, 1)).toThrow();
                });
            });
        });
    });
});
