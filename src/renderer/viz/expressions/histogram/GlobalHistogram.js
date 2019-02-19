import Histogram from './Histogram';
import Property from '../basic/property';
import { checkMaxArguments, implicitCast } from '../utils';

/**
 * Generates a histogram.
 *
 * The histogram can be based on a categorical expression, in which case each category will correspond to a histogram bar.
 *
 * The histogram can be based on a numeric expression, the buckets for the histogram is controllable through the `sizeOrBuckets` parameter.
 * For numeric values of sizeOrBuckets, the minimum and maximum will be computed automatically and bars will be generated at regular intervals between the minimum and maximum.
 * When providing sizeOrBuckets as a list of buckets, the values will get assigned to the first bucket matching the criteria [bucketMin <= value < bucketMax].
 *
 * The histogram can also be based on the result of a classifier expression such as `top()` or `buckets()`.
 *
 * Histograms are useful to get insights and create widgets outside the scope of CARTO VL, see the following example for more info.
 *
 * @param {Number} input - expression to base the histogram
 * @param {Number|Array} sizeOrBuckets - Optional (defaults to 20). Number of bars to use if `x` is a numeric expression; or user-defined buckets for numeric expressions.
 * @return {GlobalHistogram} GlobalHistogram
 *
 * @example <caption>Create and use an histogram. (String)</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz(`
 *          \@categoryHistogram:    globalHistogram($type)
 *          \@numericHistogram:     globalHistogram($amount, 3, 1)
 *          \@userDefinedHistogram: globalHistogram($amount, [[0, 10], [10, 20], [20, 30]], 1)
 *          \@topCategoryHistogram: globalHistogram(top($type, 3))
 * `);
 * ...
 * console.log(viz.variables.categoryHistogram.eval());
 * // [{x: 'typeA', y: 10}, {x: 'typeB', y: 20}]
 * // There are 10 features of type A and 20 of type B
 *
 * console.log(viz.variables.numericHistogram.eval());
 * // [{x: [0,10],  y: 20}, {x: [10,20],  y: 7}, {x: [20, 30], y: 3}]
 * // There are 20 features with an amount between 0 and 10, 7 features with an amount between 10 and 20, and 3 features with an amount between 20 and 30
 *
 * @memberof carto.expressions
 * @name GlobalHistogram
 * @function
 * @api
 */

/**
 * GlobalHistogram Class
 *
 * Generates a histogram based on the features in the viewport.
 * This class is instanced automatically by using the `globalHistogram` function. It is documented for its methods.
 * Read more about histogram expression at {@link carto.expressions.globalhistogram}.
 *
 * @name expressions.GlobalHistogram
 * @abstract
 * @hideconstructor
 * @class
 * @api
 */
export default class GlobalHistogram extends Histogram {
    constructor (input, sizeOrBuckets = 20) {
        checkMaxArguments(arguments, 3, 'globalHistogram');
        super({ input: implicitCast(input) });

        this._sizeOrBuckets = sizeOrBuckets;
        this._hasBuckets = Array.isArray(sizeOrBuckets);
        this._histogram = new Map();
    }

    eval () {
        return this.input.type === 'number'
            ? (this._hasBuckets ? this._getBucketsValue(this._histogram, this._sizeOrBuckets) : this._getNumericValue(this._histogram, this._sizeOrBuckets))
            : this._getCategoryValue(this._histogram);
    }

    /**
     * Get an array of joined data by key and sorted by frequency.
     *
     * Note: It can be combined with a `ramp.getLegendData()` method. Take a look at the examples to see how it works.
     *
     * @param {Array} values - Array of { key, value } pairs
     * @return {Array} - { frequency, key, value }
     * @memberof expressions.Histogram
     * @api
     * @example <caption>Get joined data for a categorical property sorted by frequency.</caption>
     * const numberOfWheels = [
     *  { key: 'car', value: 4 },
     *  { key: 'truck', value: 8 },
     *  { key: 'bike', value: 2 }
     * ];
     *
     * const s = carto.expressions;
     * const viz = new carto.Viz({
     *   @histogram: s.globalHistogram(s.prop('vehicles'))
     * });
     *
     * const data = viz.variables.histogram.getJoinedValues(numberOfWheels);
     * // returns an array with the following format:
     * // [
     * //   { frequency: 10, key: 'truck', value: 8 }
     * //   { frequency: 20, key: 'bike', value: 2 }
     * //   { frequency: 30, key: 'car', value: 4 }
     * // ]
     *
     * @example <caption>Get joined data for a categorical property sorted by frequency. (String)</caption>
     * const numberOfWheels = [
     *  { key: 'car', value: 4 },
     *  { key: 'truck', value: 8 },
     *  { key: 'bike', value: 2 }
     * ];
     *
     * const s = carto.expressions;
     * const viz = new carto.Viz(`
     *   @histogram: globalHistogram($vehicles)
     * `);
     *
     * const data = viz.variables.histogram.getJoinedValues(numberOfWheels);
     * // returns an array with the following format:
     * // [
     * //   { frequency: 10, key: 'truck', value: 8 }
     * //   { frequency: 20, key: 'bike', value: 2 }
     * //   { frequency: 30, key: 'car', value: 4 }
     * // ]
     *
     * @example <caption>Get color values for the histogram when using a ramp.</caption>
     * const s = carto.expressions;
     * const viz = new carto.Viz(`
     *   @histogram: s.globalHistogram(s.prop('vehicles'))
     *   color: ramp(s.prop('vehicles'), s.palettes.PRISM)
     * `);
     *
     * const legendData = viz.color.getLegendData();
     * const data = viz.variables.histogram.getJoinedValues(legendData);
     * // returns the following array
     * // [
     * //   { frequency: 10, key: 'truck', value: { r: 95, g: 70, b: 144, a: 1 } }
     * //   { frequency: 20, key: 'bike', value: { r: 29, g: 105, b: 150, a: 1 } }
     * //   { frequency: 30, key: 'car', value: { r: 56, g: 166, b: 165, a: 1 } }
     * // ]
     *
     * @example <caption>Get color values for the histogram when using a ramp. (String)</caption>
     *
     * const s = carto.expressions;
     * const viz = new carto.Viz(`
     *   @histogram: globalHistogram($vehicles)
     *   color: ramp($vehicles, Prism)
     * `);
     *
     * const legendData = viz.color.getLegendData();
     * const data = viz.variables.histogram.getJoinedValues(legendData);
     * // returns the following array
     * // [
     * //   { frequency: 10, key: 'truck', value: { r: 95, g: 70, b: 144, a: 1 } }
     * //   { frequency: 20, key: 'bike', value: { r: 29, g: 105, b: 150, a: 1 } }
     * //   { frequency: 30, key: 'car', value: { r: 56, g: 166, b: 165, a: 1 } }
     * // ]
     *
     */
    getJoinedValues (values) {
        super.getJoinedValues(values);
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        if (!this.input.isA(Property)) {
            this._setHistogramForExpression();
            return;
        }

        if (this.input.type === 'number') {
            this._setHistogramForNumericValues();
            return;
        }

        this._setHistogramForCategoryValues();
    }

    _setHistogramForExpression () {
        const data = this.input._getLegendData().data;

        this._categories.forEach(c => {
            const category = data.find(category => c.name === category.key);
            if (category) {
                this._histogram.set(c.name, c.frequency);
            } else {
                const frequency = this._histogram.get('CARTO_VL_OTHERS') || 0;
                this._histogram.set('CARTO_VL_OTHERS', c.frequency + parseInt(frequency));
            }
        });
    }

    _setHistogramForCategoryValues () {
        this._categories.forEach(category => {
            this._histogram.set(category.name, category.frequency);
        });
    }

    _setHistogramForNumericValues () {
        const name = this._propertyName;
        const histogram = this._metadata.sample
            .map((feature) => {
                return {
                    key: feature.cartodb_id ? feature.cartodb_id : feature.id,
                    value: feature[name]
                };
            });

        histogram.forEach(feature => {
            this._histogram.set(feature.value, feature.key);
        });
    }
}
