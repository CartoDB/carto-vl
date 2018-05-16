import * as s from '../../../../../src/core/viz/functions';

fdescribe('src/core/viz/expressions/viewportAggregation', () => {
    const $price = s.property('price');
    const $cat = s.property('cat');
    describe('viewport filtering', () => {
        function fakeDrawMetadata(expr) {
            expr._compile({
                columns: [
                    { name: 'price', type: 'number' },
                    { name: 'cat', type: 'category', categoryNames: ['a', 'b', 'c'] }
                ],
                categoryIDsToName: {
                    0: 'a',
                    1: 'b',
                    2: 'c',
                }
            });
            expr._resetViewportAgg();
            expr._accumViewportAgg({ price: 0, cat: 0 });
            expr._accumViewportAgg({ price: 0.5, cat: 1 });
            expr._accumViewportAgg({ price: 1.5, cat: 1 });
            expr._accumViewportAgg({ price: 2, cat: 2 });
        }
        it('viewportMin($price) should return the metadata min', () => {
            const viewportMin = s.viewportMin($price);
            fakeDrawMetadata(viewportMin);
            expect(viewportMin.value).toEqual(0);
        });

        it('viewportAvg($price) should return the metadata avg', () => {
            const viewportAvg = s.viewportAvg($price);
            fakeDrawMetadata(viewportAvg);
            expect(viewportAvg.value).toEqual(1);
        });

        it('viewportMax($price) should return the metadata max', () => {
            const viewportMax = s.viewportMax($price);
            fakeDrawMetadata(viewportMax);
            expect(viewportMax.value).toEqual(2);
        });

        it('viewportSum($price) should return the metadata sum', () => {
            const viewportSum = s.viewportSum($price);
            fakeDrawMetadata(viewportSum);
            expect(viewportSum.value).toEqual(4);
        });

        it('viewportCount($price) should return the metadata count', () => {
            const viewportCount = s.viewportCount($price);
            fakeDrawMetadata(viewportCount);
            expect(viewportCount.value).toEqual(4);
        });

        it('viewportPercentile($price) should return the metadata count', () => {
            let viewportPercentile;

            viewportPercentile = s.viewportPercentile($price, 0);
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

        });

        it('viewportHistogram($price, 1, 3) should eval to the correct histogram', () => {
            const viewportHistogram = s.viewportHistogram($price, 1, 3);
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

        it('viewportHistogram($cat) should eval to the correct histogram', () => {
            const viewportHistogram = s.viewportHistogram($cat);
            fakeDrawMetadata(viewportHistogram);
            expect(viewportHistogram.value).toEqual([
                {
                    x: 'a',
                    y: 1
                },
                {
                    x: 'b',
                    y: 2
                },
                {
                    x: 'c',
                    y: 1
                }
            ]);
        });

    });
});
