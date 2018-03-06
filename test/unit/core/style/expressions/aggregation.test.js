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


