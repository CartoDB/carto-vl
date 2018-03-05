import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/aggregation', () => {
    const $price = s.property('price');
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

    it('globalMax($price) should return the metadata sum', () => {
        const globalSum = s.globalSum($price);
        globalSum._compile(fakeMetadata);
        expect(globalSum.eval()).toEqual(3);
    });

    it('globalMax($price) should return the metadata count', () => {
        const globalCount = s.globalCount($price);
        globalCount._compile(fakeMetadata);
        expect(globalCount.eval()).toEqual(4);
    });
});


