import * as s from '../../../../../src/core/viz/functions';
import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/aggregation', () => {
    const fakeFeature = {
        _cdb_agg_max_price: 1,
        _cdb_agg_min_price: 2,
        _cdb_agg_avg_price: 3,
        _cdb_agg_sum_price: 4,
        _cdb_agg_mode_price: 5,
    };

    let $price = null;

    beforeEach(() => {
        // Needed a beforeEach to avoid testing against already compiled properties
        $price = s.property('price');
    });

    describe('error control', () => {
        validateStaticTypeErrors('max', []);
        validateStaticTypeErrors('max', ['color']);
        validateStaticTypeErrors('max', [0]);
        validateDynamicTypeErrors('max', ['category']);
        validateDynamicTypeErrors('mode', ['number']);
    });

    describe('type', () => {
        validateStaticType('max', ['number-property'], 'number');
        validateStaticType('mode', ['category-property'], 'category');
    });

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
});
