import * as s from '../../../../../../src/renderer/viz/expressions';

describe('src/renderer/viz/expressions/globalAggregation', () => {
    const $price = s.property('price');
    describe('global filtering', () => {
        const fakeMetadata = {
            properties: {
                price: {
                    type: 'number',
                    min: 0,
                    avg: 1,
                    max: 2,
                    sum: 3,
                    count: 4
                }
            }
        };

        it('globalMin($price) should return the metadata min', () => {
            const globalMin = s.globalMin($price);
            globalMin._bindMetadata(fakeMetadata);
            expect(globalMin.value).toEqual(0);
        });

        it('globalAvg($price) should return the metadata avg', () => {
            const globalAvg = s.globalAvg($price);
            globalAvg._bindMetadata(fakeMetadata);
            expect(globalAvg.value).toEqual(1);
        });

        it('globalMax($price) should return the metadata max', () => {
            const globalMax = s.globalMax($price);
            globalMax._bindMetadata(fakeMetadata);
            expect(globalMax.value).toEqual(2);
        });

        it('globalSum($price) should return the metadata sum', () => {
            const globalSum = s.globalSum($price);
            globalSum._bindMetadata(fakeMetadata);
            expect(globalSum.value).toEqual(3);
        });

        it('globalCount($price) should return the metadata count', () => {
            const globalCount = s.globalCount($price);
            globalCount._bindMetadata(fakeMetadata);
            expect(globalCount.value).toEqual(4);
        });

        it('globalPercentile($price, 30) should return the metadata count', () => {
            fakeMetadata.sample = [];
            for (let i = 0; i <= 1000; i++) {
                fakeMetadata.sample.push({
                    'price': i / 1000 * (fakeMetadata.properties.price.max - fakeMetadata.properties.price.min) + fakeMetadata.properties.price.min
                });
            }
            const globalPercentile = s.globalPercentile($price, 30);
            globalPercentile._bindMetadata(fakeMetadata);
            expect(globalPercentile.value).toBeCloseTo(
                0.3 * (fakeMetadata.properties.price.max - fakeMetadata.properties.price.min) + fakeMetadata.properties.price.min,
                2);
        });
    });
});
