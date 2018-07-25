import * as s from '../../../../../../src/renderer/viz/expressions';
import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from '../utils';

describe('src/renderer/viz/expressions/clusterAggregation', () => {
    const fakeFeature = {
        _cdb_agg_max_price: 1,
        _cdb_agg_min_price: 2,
        _cdb_agg_avg_price: 3,
        _cdb_agg_sum_price: 4,
        _cdb_agg_mode_price: 5
    };

    let $price = null;

    beforeEach(() => {
        // Needed a beforeEach to avoid testing against already compiled properties
        $price = s.property('price');
    });

    describe('error control', () => {
        validateStaticTypeErrors('clusterMax', []);
        validateStaticTypeErrors('clusterMax', ['color']);
        validateStaticTypeErrors('clusterMax', [0]);
        validateDynamicTypeErrors('clusterMax', ['category']);
        validateDynamicTypeErrors('clusterMode', ['number']);
    });

    describe('type', () => {
        validateStaticType('clusterMax', ['number-property'], 'number');
        validateStaticType('clusterMode', ['category-property'], 'category');
    });

    describe('eval', () => {
        it('clusterAvg($price) should return fakeFeature._cdb_agg_avg_price', () => {
            const actual = s.clusterAvg($price).eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_avg_price);
        });

        it('clusterMax($price) should return fakeFeature._cdb_agg_max_price', () => {
            const actual = s.clusterMax($price).eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_max_price);
        });

        it('clusterMin($price) should return fakeFeature._cdb_agg_min_price', () => {
            const actual = s.clusterMin($price).eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_min_price);
        });

        it('clusterMode($price) should return fakeFeature._cdb_agg_mode_price', () => {
            const actual = s.clusterMode($price).eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_mode_price);
        });

        it('clusterSum($price) should return fakeFeature._cdb_agg_sum_price', () => {
            const actual = s.clusterSum($price).eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_sum_price);
        });
    });
});
