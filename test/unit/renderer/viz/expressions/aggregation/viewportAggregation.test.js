import * as s from '../../../../../../src/renderer/viz/expressions';
import Metadata from '../../../../../../src/renderer/Metadata';
import { validateMaxArgumentsError } from '../utils';

describe('src/renderer/viz/expressions/viewportAggregation', () => {
    describe('error control', () => {
        validateMaxArgumentsError('viewportMax', ['number', 'number']);
        validateMaxArgumentsError('viewportMin', ['number', 'number']);
        validateMaxArgumentsError('viewportSum', ['number', 'number']);
        validateMaxArgumentsError('viewportAvg', ['number', 'number']);
        validateMaxArgumentsError('viewportCount', ['number']);
        validateMaxArgumentsError('viewportPercentile', ['number', 'number', 'number']);
        validateMaxArgumentsError('viewportHistogram', ['number', 'number', 'number', 'number']);
    });

    const $price = s.property('price');
    const $nulls = s.property('numeric_with_nulls');
    const $cat = s.property('cat');

    describe('viewport filtering', () => {
        const METADATA = new Metadata({
            properties: {
                numeric_with_nulls: { type: 'number' },
                price: { type: 'number' },
                cat: {
                    type: 'category',
                    categories: [
                        { name: 'a' },
                        { name: 'b' },
                        { name: 'c' }
                    ]
                }
            }
        });

        function fakeDrawMetadata (expr) {
            expr._bindMetadata(METADATA);
            expr._resetViewportAgg(METADATA);
            expr.accumViewportAgg({ price: 1.5, cat: 'b', numeric_with_nulls: null });
            expr.accumViewportAgg({ price: 2, cat: 'c', numeric_with_nulls: 2 });
            expr.accumViewportAgg({ price: 0.5, cat: 'b', numeric_with_nulls: 1 });
            expr.accumViewportAgg({ price: 0, cat: 'a', numeric_with_nulls: 0 });
        }

        describe('viewportMin()', () => {
            it('($price) should return the metadata min', () => {
                const viewportMin = s.viewportMin($price);
                fakeDrawMetadata(viewportMin);
                expect(viewportMin.eval()).toEqual(0);
            });

            it('($nulls) should return the metadata min', () => {
                const viewportMin = s.viewportMin($nulls);
                fakeDrawMetadata(viewportMin);
                expect(viewportMin.eval()).toEqual(0);
            });
        });

        describe('viewportAvg()', () => {
            it('($price) should return the metadata avg', () => {
                const viewportAvg = s.viewportAvg($price);
                fakeDrawMetadata(viewportAvg);
                expect(viewportAvg.eval()).toEqual(1);
            });

            it('($nulls) should return the metadata avg', () => {
                const viewportAvg = s.viewportAvg($nulls);
                fakeDrawMetadata(viewportAvg);
                expect(viewportAvg.eval()).toEqual(1);
            });
        });

        describe('viewportMax', () => {
            it('($price) should return the metadata max', () => {
                const viewportMax = s.viewportMax($price);
                fakeDrawMetadata(viewportMax);
                expect(viewportMax.eval()).toEqual(2);
            });

            it('($nulls) should return the metadata max', () => {
                const viewportMax = s.viewportMax($nulls);
                fakeDrawMetadata(viewportMax);
                expect(viewportMax.eval()).toEqual(2);
            });
        });

        describe('viewportSum', () => {
            it('($price) should return the metadata sum', () => {
                const viewportSum = s.viewportSum($price);
                fakeDrawMetadata(viewportSum);
                expect(viewportSum.eval()).toEqual(4);
            });

            it('($nulls) should return the metadata sum', () => {
                const viewportSum = s.viewportSum($nulls);
                fakeDrawMetadata(viewportSum);
                expect(viewportSum.eval()).toEqual(3);
            });
        });

        describe('viewportCount', () => {
            it('() should return the metadata count', () => {
                const viewportCount = s.viewportCount();
                fakeDrawMetadata(viewportCount);
                expect(viewportCount.eval()).toEqual(4);
            });
        });

        it('viewportPercentile($price) should return the metadata count', () => {
            let viewportPercentile;

            viewportPercentile = s.viewportPercentile($price, 0);
            fakeDrawMetadata(viewportPercentile);
            expect(viewportPercentile.value).toEqual(0);

            viewportPercentile = s.viewportPercentile($price, 1);
            fakeDrawMetadata(viewportPercentile);
            expect(viewportPercentile.value).toEqual(0);

            viewportPercentile = s.viewportPercentile($price, 24);
            fakeDrawMetadata(viewportPercentile);
            expect(viewportPercentile.value).toEqual(0);
            viewportPercentile = s.viewportPercentile($price, 26);
            fakeDrawMetadata(viewportPercentile);
            expect(viewportPercentile.value).toEqual(0.5);
            viewportPercentile = s.viewportPercentile($price, 49);
            fakeDrawMetadata(viewportPercentile);
            expect(viewportPercentile.value).toEqual(0.5);
            viewportPercentile = s.viewportPercentile($price, 51);
            fakeDrawMetadata(viewportPercentile);
            expect(viewportPercentile.value).toEqual(1.5);

            viewportPercentile = s.viewportPercentile($price, 74);
            fakeDrawMetadata(viewportPercentile);
            expect(viewportPercentile.value).toEqual(1.5);

            viewportPercentile = s.viewportPercentile($price, 76);
            fakeDrawMetadata(viewportPercentile);
            expect(viewportPercentile.value).toEqual(2);

            viewportPercentile = s.viewportPercentile($price, 100);
            fakeDrawMetadata(viewportPercentile);
            expect(viewportPercentile.value).toEqual(2);

            viewportPercentile = s.viewportPercentile($price, 999);
            fakeDrawMetadata(viewportPercentile);
            expect(viewportPercentile.value).toEqual(2);
        });

        it('viewportHistogram($price, 3, 1) should eval to the correct histogram', () => {
            const viewportHistogram = s.viewportHistogram($price, 3, 1);
            fakeDrawMetadata(viewportHistogram);
            expect(viewportHistogram.value).toEqual([
                {
                    x: [0, 2 / 3],
                    y: 2
                },
                {
                    x: [2 / 3, 4 / 3],
                    y: 0
                },
                {
                    x: [4 / 3, 2],
                    y: 2
                }
            ]);
        });

        it('viewportHistogram($price, [[0, 1], [1, 2]], 1) should eval to the correct histogram', () => {
            const viewportHistogram = s.viewportHistogram($price, [[0, 1.5], [1.5, 3]], 1);
            fakeDrawMetadata(viewportHistogram);
            expect(viewportHistogram.value).toEqual([
                {
                    x: [0, 1.5],
                    y: 2
                },
                {
                    x: [1.5, 3],
                    y: 2
                }
            ]);
        });

        it('viewportHistogram($cat) should eval to the correct histogram', () => {
            const viewportHistogram = s.viewportHistogram($cat);
            fakeDrawMetadata(viewportHistogram);
            expect(viewportHistogram.value).toEqual([
                {
                    x: 'b',
                    y: 2
                },
                {
                    x: 'a',
                    y: 1
                },
                {
                    x: 'c',
                    y: 1
                }
            ]);
        });

        it('viewportHistogram.getJoinedValues should be able to join data sorted by frequency', () => {
            const viewportHistogram = s.viewportHistogram($cat);
            fakeDrawMetadata(viewportHistogram);
            const fakeValues = [
                {
                    key: 'b',
                    value: 10
                },
                {
                    key: 'c',
                    value: 20
                },
                {
                    key: 'a',
                    value: 30
                }
            ];

            const joinedValues = viewportHistogram.getJoinedValues(fakeValues);
            expect(joinedValues).toEqual(
                [
                    {
                        frequency: 2,
                        key: 'b',
                        value: 10
                    },
                    {
                        frequency: 1,
                        key: 'a',
                        value: 30
                    },
                    {
                        frequency: 1,
                        key: 'c',
                        value: 20
                    }
                ]
            );
        });

        it('viewportHistogram.getJoinedValues should be combined with ramp.getLegendData', () => {
            const viewportHistogram = s.viewportHistogram($cat);
            const ramp = s.ramp($cat, s.palettes.PRISM);
            ramp._bindMetadata(METADATA);
            fakeDrawMetadata(viewportHistogram);

            const values = ramp.getLegendData().data;
            const joinedValues = viewportHistogram.getJoinedValues(values);

            expect(joinedValues).toEqual(
                [
                    {
                        frequency: 2,
                        key: 'b',
                        value: { r: 29, g: 105, b: 150, a: 1 }
                    },
                    {
                        frequency: 1,
                        key: 'a',
                        value: { r: 95, g: 70, b: 144, a: 1 }
                    },
                    {
                        frequency: 1,
                        key: 'c',
                        value: { r: 56, g: 166, b: 165, a: 1 }
                    }
                ]
            );
        });
    });
});
