import * as s from '../../../../../src/core/viz/functions';
import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/propertyAggregation', () => {
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
        validateStaticTypeErrors('propertyMax', []);
        validateStaticTypeErrors('propertyMax', ['color']);
        validateStaticTypeErrors('propertyMax', [0]);
        validateDynamicTypeErrors('propertyMax', ['category']);
        validateDynamicTypeErrors('propertyMode', ['number']);
    });

    describe('type', () => {
        validateStaticType('propertyMax', ['number-property'], 'number');
        validateStaticType('propertyMode', ['category-property'], 'category');
    });

    describe('eval', () => {
        it('propertyAvg($price) should return fakeFeature._cdb_agg_avg_price', () => {
            const actual = s.propertyAvg($price).eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_avg_price);
        });

        it('propertyMax($price) should return fakeFeature._cdb_agg_max_price', () => {
            const actual = s.propertyMax($price).eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_max_price);
        });

        it('propertyMin($price) should return fakeFeature._cdb_agg_min_price', () => {
            const actual = s.propertyMin($price).eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_min_price);
        });

        it('propertyMode($price) should return fakeFeature._cdb_agg_mode_price', () => {
            const actual = s.propertyMode($price).eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_mode_price);
        });

        it('propertySum($price) should return fakeFeature._cdb_agg_sum_price', () => {
            const actual = s.propertySum($price).eval(fakeFeature);
            expect(actual).toEqual(fakeFeature._cdb_agg_sum_price);
        });
    });
});
