import ViewportAggregation from './ViewportAggregation';
import { implicitCast, clamp, checkMaxArguments, checkType, checkExpression } from '../../utils';
import { CLUSTER_FEATURE_COUNT } from '../../../../schema';
/**
 * Return the Nth percentile of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {Number} input - Numeric expression
 * @param {Number} percentile - Numeric expression [0, 100]
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the percentile of the `amount` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_percentile: s.viewportPercentile(s.prop('amount'), 90)
 *   }
 * });
 *
 * @example <caption>Assign the percentile of the `amount` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_percentile: viewportPercentile($amount, 90)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportPercentile
 * @function
 * @api
 */
export default class ViewportPercentile extends ViewportAggregation {
    /**
     * @param {*} property
     * @param {*} percentile
     */
    constructor (property, percentile) {
        property = implicitCast(property);
        percentile = implicitCast(percentile);

        checkExpression('viewportPercentile', 'property', 0, property);
        checkExpression('viewportPercentile', 'percentile', 0, percentile);
        checkMaxArguments(arguments, 2, 'viewportPercentile');

        super({ property });
        this.percentile = percentile;
        this.childrenNames.push('percentile');
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkType('viewportPercentile', 'property', 0, 'number', this.property);
        checkType('viewportPercentile', 'percentile', 1, 'number', this.percentile);
    }

    eval (feature) {
        if (this._value === null) {
            // See Nearest rank method: https://en.wikipedia.org/wiki/Percentile
            const unclampedIndex = Math.ceil(this.percentile.eval(feature) / 100 * this._total) - 1;
            const index = clamp(unclampedIndex, 0, this._total - 1);
            const array = [...this._map.entries()];
            array.sort((a, b) => a[0] - b[0]);
            let accum = 0;
            for (let i = 0; i < array.length; i++) {
                accum += array[i][1];
                array[i][1] = accum;
            }
            this._value = binarySearch(array, index, 0, array.length - 1);
        }

        return this._value;
    }

    _resetViewportAgg () {
        this._value = null;
        this._map = new Map();
        this._total = 0;
    }

    accumViewportAgg (feature) {
        const v = this.property.eval(feature);
        const clusterCount = feature[CLUSTER_FEATURE_COUNT] || 1;
        this._map.set(v, (this._map.get(v) || 0) + clusterCount);
        this._total += clusterCount;
    }
}

function binarySearch (array, index, begin, end) {
    const m = Math.round((begin + end) / 2);
    const upper = array[m][1];
    const lower = (array[m - 1] || [array[m][0] - 1, 0])[1];
    if (index >= lower && index < upper) {
        return array[m][0];
    } else if (index < lower) {
        return binarySearch(array, index, begin, m - 1);
    } else {
        return binarySearch(array, index, m + 1, end);
    }
}
