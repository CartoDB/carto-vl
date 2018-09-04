import * as s from '../../../../../../src/renderer/viz/expressions';
import { validateTypeErrors, validateStaticType, validateMaxArgumentsError } from '../utils';

describe('src/renderer/viz/expressions/clusterAggregation', () => {
    const fakeFeature = {
        _cdb_agg_max_price: 1,
        _cdb_agg_min_price: 2,
        _cdb_agg_avg_price: 3,
        _cdb_agg_sum_price: 4,
        _cdb_agg_mode_price: 5,
        _cdb_feature_count: 1
    };

    let $price = null;

    beforeEach(() => {
        // Needed a beforeEach to avoid testing against already compiled properties
        $price = s.property('price');
    });

    describe('error control', () => {
        validateTypeErrors('clusterMax', []);
        validateTypeErrors('clusterMax', ['color']);
        validateTypeErrors('clusterMax', [0]);
        validateTypeErrors('clusterMax', ['category']);
        validateTypeErrors('clusterMode', ['number']);
        validateMaxArgumentsError('clusterMax', ['number', 'number']);
        validateMaxArgumentsError('clusterMin', ['number', 'number']);
        validateMaxArgumentsError('clusterSum', ['number', 'number']);
        validateMaxArgumentsError('clusterAvg', ['number', 'number']);
        validateMaxArgumentsError('clusterMode', ['number', 'number']);
        validateMaxArgumentsError('clusterCount', [0]);
    });

    describe('type', () => {
        validateStaticType('clusterMax', ['number-property'], 'number');
        validateStaticType('clusterMode', ['category-property'], 'category');
        validateStaticType('clusterCount', [], 'number');
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

        it('clusterCount() should return fakeFeature._cdb_feature_count if defined', () => {
            const actual = s.clusterCount().eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_feature_count);
        });

        it('clusterCount() should return 1 if _cdb_feature_count is undefined in the feature', () => {
            const actual = s.clusterCount().eval({});
            expect(actual).toEqual(1);
        });
    });
});
