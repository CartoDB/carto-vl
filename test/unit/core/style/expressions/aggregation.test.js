import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/aggregation', () => {
    const fakeFeature = {
        _cdb_agg_max_price: 1,
        _cdb_agg_min_price: 2,
        _cdb_agg_avg_price: 3,
        _cdb_agg_sum_price: 4,
        _cdb_agg_mode_price: 5,
    };
    const $price = s.property('price');
    const $cat = s.property('cat');

    const metadata = {
        columns: [
            {
                name: 'price',
                type: 'float'
            },
            {
                name: 'cat',
                type: 'category',
                categoryNames: ['red', 'blue']
            }
        ],
    };

    describe('eval', () => {
        it('max($price) should return fakeFeature._cdb_agg_max_price', () => {
            const actual = s.max($price).eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_max_price);
        });

        it('min($price) should return fakeFeature._cdb_agg_min_price', () => {
            const actual = s.min($price).eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_min_price);
        });

        it('avg($price) should return fakeFeature._cdb_agg_avg_price', () => {
            const actual = s.avg($price).eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_avg_price);
        });

        it('sum($price) should return fakeFeature._cdb_agg_sum_price', () => {
            const actual = s.sum($price).eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_sum_price);
        });

        it('mode($price) should return fakeFeature._cdb_agg_mode_price', () => {
            const actual = s.mode($price).eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_mode_price);
        });
    });

    describe('error control', () => {
        it('max(0) should throw at constructor time', () => {
            expect(() => s.max(0)).toThrow();
        });

        it('max($categoryProperty) should throw at compile time', () => {
            expect(() => s.max($cat)._compile(metadata)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*type[\s\S]*/g);
        });

        it('mode($numericProperty) should throw at compile time', () => {
            expect(() => s.mode($price)._compile(metadata)).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*type[\s\S]*/g);
        });
    });

    describe('compile with correct parameters', ()=>{
        it('max($numericProperty) should not throw', () => {
            expect(() => s.max($price)._compile(metadata)).not.toThrow();
        });

        it('mode($categoryProperty) should not throw', () => {
            expect(() => s.mode($cat)._compile(metadata)).not.toThrow();
        });

        it('max($numericProperty) should not throw', () => {
            expect(() => s.max($price)._compile(metadata)).not.toThrow();
        });
    });
});


