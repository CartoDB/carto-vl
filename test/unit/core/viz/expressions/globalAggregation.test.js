import * as s from '../../../../../src/core/viz/functions';

describe('src/core/viz/expressions/viewportAggregation', () => {
    const $price = s.property('price');
    describe('global filtering', () => {
        const fakeMetadata = {
            columns: [{
                type: 'number',
                name: 'price',
                min: 0,
                avg: 1,
                max: 2,
                sum: 3,
                count: 4,

            }],
        };
        it('globalMin($price) should return the metadata min', () => {
            const globalMin = s.globalMin($price);
            globalMin._compile(fakeMetadata);
            expect(globalMin.eval()).toEqual(0);
        });

        it('globalAvg($price) should return the metadata avg', () => {
            const globalAvg = s.globalAvg($price);
            globalAvg._compile(fakeMetadata);
            expect(globalAvg.eval()).toEqual(1);
        });

        it('globalMax($price) should return the metadata max', () => {
            const globalMax = s.globalMax($price);
            globalMax._compile(fakeMetadata);
            expect(globalMax.eval()).toEqual(2);
        });

        it('globalSum($price) should return the metadata sum', () => {
            const globalSum = s.globalSum($price);
            globalSum._compile(fakeMetadata);
            expect(globalSum.eval()).toEqual(3);
        });

        it('globalCount($price) should return the metadata count', () => {
            const globalCount = s.globalCount($price);
            globalCount._compile(fakeMetadata);
            expect(globalCount.eval()).toEqual(4);
        });

        it('globalPercentile($price, 30) should return the metadata count', () => {
            fakeMetadata.sample = [];
            for (let i = 0; i <= 1000; i++) {
                fakeMetadata.sample.push({
                    'price': i / 1000 * (fakeMetadata.columns[0].max - fakeMetadata.columns[0].min) + fakeMetadata.columns[0].min,
                });
            }
            const globalPercentile = s.globalPercentile($price, 30);
            globalPercentile._compile(fakeMetadata);
            expect(globalPercentile.eval()).toBeCloseTo(0.3 * (fakeMetadata.columns[0].max - fakeMetadata.columns[0].min) + fakeMetadata.columns[0].min, 2);
        });
    });
});
