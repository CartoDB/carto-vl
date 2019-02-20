import * as s from '../../../../../../src/renderer/viz/expressions';
import { validateMaxArgumentsError, validateTypeErrors, mockMetadata } from '../utils';

describe('src/renderer/viz/expressions/globalAggregation', () => {
    describe('error control', () => {
        validateMaxArgumentsError('globalMax', ['number', 'number']);
        validateMaxArgumentsError('globalMin', ['number', 'number']);
        validateMaxArgumentsError('globalSum', ['number', 'number']);
        validateMaxArgumentsError('globalAvg', ['number', 'number']);
        validateMaxArgumentsError('globalCount', ['number']);
        validateMaxArgumentsError('globalPercentile', ['number', 'number', 'number']);
        validateTypeErrors('globalPercentile', ['number-property', 'number-property'], () =>
            new RegExp('[\\s\\S]*\invalid second parameter \'percentile\'[\\s\\S]*parameter cannot be feature dependent', 'g'));
        validateTypeErrors('globalPercentile', ['category', 'number-property']);
    });

    const $price = s.property('price');
    describe('global filtering', () => {
        const fakeMetadata = mockMetadata({
            properties: {
                price: {
                    type: 'number',
                    min: 0,
                    avg: 1,
                    max: 2,
                    sum: 3
                }
            },
            featureCount: 4
        });

        const fakeAliases = {};

        it('globalMin($price) should return the metadata min', () => {
            const globalMin = s.globalMin($price);
            globalMin._bindMetadata(fakeMetadata);
            globalMin._resolveAliases(fakeAliases);
            expect(globalMin.value).toEqual(0);
        });

        it('globalAvg($price) should return the metadata avg', () => {
            const globalAvg = s.globalAvg($price);
            globalAvg._bindMetadata(fakeMetadata);
            globalAvg._resolveAliases(fakeAliases);
            expect(globalAvg.value).toEqual(1);
        });

        it('globalMax($price) should return the metadata max', () => {
            const globalMax = s.globalMax($price);
            globalMax._bindMetadata(fakeMetadata);
            globalMax._resolveAliases(fakeAliases);
            expect(globalMax.value).toEqual(2);
        });

        it('globalSum($price) should return the metadata sum', () => {
            const globalSum = s.globalSum($price);
            globalSum._bindMetadata(fakeMetadata);
            globalSum._resolveAliases(fakeAliases);
            expect(globalSum.value).toEqual(3);
        });

        it('globalCount() should return the metadata count', () => {
            const globalCount = s.globalCount();
            globalCount._bindMetadata(fakeMetadata);
            globalCount._resolveAliases(fakeAliases);
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
            globalPercentile._resolveAliases(fakeAliases);
            expect(globalPercentile.value).toBeCloseTo(
                0.3 * (fakeMetadata.properties.price.max - fakeMetadata.properties.price.min) + fakeMetadata.properties.price.min,
                2);
        });

        it('globalMin(clusterMin($price)) should return the metadata min', () => {
            const globalMin = s.globalMin(s.clusterMin($price));
            globalMin._bindMetadata(fakeMetadata);
            expect(globalMin.value).toEqual(0);
        });

        it('globalMax(clusterMax($price)) should return the metadata max', () => {
            const globalMin = s.globalMax(s.clusterMax($price));
            globalMin._bindMetadata(fakeMetadata);
            expect(globalMin.value).toEqual(2);
        });

        it('globalSum(cluserSum($price)) should return the metadata sum', () => {
            const globalSum = s.globalSum(s.clusterSum($price));
            globalSum._bindMetadata(fakeMetadata);
            expect(globalSum.value).toEqual(3);
        });

        it('globalSum(clusterCount()) should return the metadata count', () => {
            const globalCount = s.globalSum(s.clusterCount());
            globalCount._bindMetadata(fakeMetadata);
            expect(globalCount.value).toEqual(4);
        });
    });
});
