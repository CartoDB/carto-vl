import {
    validateDynamicTypeErrors,
    validateStaticType,
    validateStaticTypeErrors,
    validateCompileTypeError,
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
            validateStaticTypeErrors('globalQuantiles', []);
            validateStaticTypeErrors('globalQuantiles', ['number', 'category']);
            validateDynamicTypeErrors('globalQuantiles', ['category', 2]);
            validateStaticTypeErrors('globalQuantiles', ['color', 2]);
            validateStaticTypeErrors('globalQuantiles', ['number', 'color']);
            validateMaxArgumentsError('globalQuantiles', ['number', 'number-array', 'number']);

            validateStaticTypeErrors('globalEqIntervals', []);
            validateStaticTypeErrors('globalEqIntervals', ['number', 'category']);
            validateDynamicTypeErrors('globalEqIntervals', ['category', 2]);
            validateStaticTypeErrors('globalEqIntervals', ['color', 2]);
            validateStaticTypeErrors('globalEqIntervals', ['number', 'color']);
            validateMaxArgumentsError('globalEqIntervals', ['number', 'number-array', 'number']);

            validateStaticTypeErrors('globalMeanStandardDev', []);
            validateStaticTypeErrors('globalMeanStandardDev', ['number', 'category']);
            validateDynamicTypeErrors('globalMeanStandardDev', ['category', 2]);
            validateStaticTypeErrors('globalMeanStandardDev', ['color', 2]);
            validateStaticTypeErrors('globalMeanStandardDev', ['number', 'color']);
            validateMaxArgumentsError('globalMeanStandardDev', ['number', 'number-array', 'number', 'number']);
        });

        describe('viewport', () => {
            validateCompileTypeError('viewportQuantiles', []);
            validateCompileTypeError('viewportQuantiles', ['number', 'category']);
            validateCompileTypeError('viewportQuantiles', ['category', 2]);
            validateCompileTypeError('viewportQuantiles', ['color', 2]);
            validateCompileTypeError('viewportQuantiles', ['number', 'color']);
            validateMaxArgumentsError('viewportQuantiles', ['number', 'number-array', 'number']);

            validateCompileTypeError('viewportEqIntervals', []);
            validateCompileTypeError('viewportEqIntervals', ['number', 'category']);
            validateCompileTypeError('viewportEqIntervals', ['category', 2]);
            validateCompileTypeError('viewportEqIntervals', ['color', 2]);
            validateCompileTypeError('viewportEqIntervals', ['number', 'color']);
            validateMaxArgumentsError('viewportEqIntervals', ['number', 'number-array', 'number']);

            validateStaticTypeErrors('viewportMeanStandardDev', []);
            validateStaticTypeErrors('viewportMeanStandardDev', ['number', 'category']);
            validateDynamicTypeErrors('viewportMeanStandardDev', ['category', 2]);
            validateStaticTypeErrors('viewportMeanStandardDev', ['color', 2]);
            validateStaticTypeErrors('viewportMeanStandardDev', ['number', 'color']);
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
            });
        });
    });
});
