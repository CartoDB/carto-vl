import * as s from '../../../../../src/core/viz/functions';
import { validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/clusterAggregation', () => {
    const fakeFeature = {
        _cdb_agg_max_price: 1,
        _cdb_agg_min_price: 2,
        _cdb_agg_avg_price: 3,
        _cdb_agg_sum_price: 4,
        _cdb_agg_mode_price: 5,
    };

    describe('error control', () => {
        validateStaticTypeErrors('clusterMax', []);
        validateStaticTypeErrors('clusterMax', ['color']);
        validateStaticTypeErrors('clusterMax', [0]);
        validateStaticTypeErrors('clusterMax', ['number']);
        validateStaticTypeErrors('clusterMax', ['number-property']);
        validateStaticTypeErrors('clusterMax', ['category-property']);
    });

    describe('type', () => {
        // validateStaticType('clusterMode', ['category'], 'category');
    });

    describe('eval', () => {
        it('clusterAvg("price") should return fakeFeature._cdb_agg_avg_price', () => {
            const actual = s.clusterAvg('price').eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_avg_price);
        });

        it('clusterMax("price") should return fakeFeature._cdb_agg_max_price', () => {
            const actual = s.clusterMax('price').eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_max_price);
        });

        it('clusterMin("price") should return fakeFeature._cdb_agg_min_price', () => {
            const actual = s.clusterMin('price').eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_min_price);
        });

        it('clusterMode("price") should return fakeFeature._cdb_agg_mode_price', () => {
            const actual = s.clusterMode('price').eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_mode_price);
        });

        it('clusterSum("price") should return fakeFeature._cdb_agg_sum_price', () => {
            const actual = s.clusterSum('price').eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_sum_price);
        });
    });
});
