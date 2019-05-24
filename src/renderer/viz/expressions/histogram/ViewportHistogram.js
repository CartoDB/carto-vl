import Histogram from './Histogram';
import { checkMaxArguments, implicitCast } from '../utils';
import { checkArray } from '../utils';
import { DEFAULT_OPTIONS } from '../constants';
import Top from '../top';
import { CLUSTER_FEATURE_COUNT } from '../../../../constants/metadata';

/**
 * Generates a histogram based on the data from the features present in the viewport.
 *
 * The histogram can be based on a categorical expression, in which case each category will correspond to a histogram bar.
 *
 * The histogram can be based on a numeric expression, the buckets for the histogram is controllable through the `sizeOrBuckets` parameter.
 * For numeric values of sizeOrBuckets, the minimum and maximum will be computed automatically and bars will be generated at regular intervals between the minimum and maximum.
 * When providing sizeOrBuckets as a list of buckets, the values will get assigned to the first bucket matching the criteria [bucketMin <= value < bucketMax].
 *
 * The viewportHistogram can also be combined with the `top()` expression.
 *
 * Histograms are useful to get insights and create widgets outside the scope of CARTO VL, see the following example for more info.
 *
 * @param {Number} input - expression to base the histogram
 * @param {Number|Array} sizeOrBuckets - Optional (defaults to 20). Number of bars to use if `x` is a numeric expression; or user-defined buckets for numeric expressions.
 * @param {Number} weight - Optional. Weight each occurrence differently based on this weight, defaults to `1`, which will generate a simple, non-weighted count.
 * @return {ViewportHistogram} ViewportHistogram
 *
 * @example <caption>Create and use an histogram.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz(
 *     variables: {
 *       categoryHistogram: s.viewportHistogram(s.prop('type')),
 *       numericHistogram: s.viewportHistogram(s.prop('amount'), 3, 1),
 *       userDefinedHistogram: s.viewportHistogram(s.prop('amount', [[0, 10], [10, 20], [20, 30]], 1),
 *       topCategoryHistogram: s.viewportHistogram(s.top(s.prop('type'), 3))
 *     }
 * );
 * // ...
 * console.log(viz.variables.categoryHistogram.value);
 * // [{x: 'typeA', y: 10}, {x: 'typeB', y: 20}]
 * // There are 10 features of type A and 20 of type B
 *
 * console.log(viz.variables.numericHistogram.value);
 * // [{x: [0,10],  y: 20}, {x: [10,20],  y: 7}, {x: [20, 30], y: 3}]
 * // There are 20 features with an amount between 0 and 10, 7 features with an amount between 10 and 20, and 3 features with an amount between 20 and 30
 *
 *
 * @example <caption>Create and use an histogram. (String)</caption>
 * const viz = new carto.Viz(`
 *    \@categoryHistogram:    viewportHistogram($type)
 *    \@numericHistogram:     viewportHistogram($amount, 3, 1)
 *    \@userDefinedHistogram: viewportHistogram($amount, [[0, 10], [10, 20], [20, 30]], 1)
 *    \@topCategoryHistogram: viewportHistogram(top($type, 3))
 * `);
 * // ...
 * console.log(viz.variables.categoryHistogram.value);
 * // [{x: 'typeA', y: 10}, {x: 'typeB', y: 20}]
 * // There are 10 features of type A and 20 of type B
 *
 * console.log(viz.variables.numericHistogram.value);
 * // [{x: [0,10],  y: 20}, {x: [10,20],  y: 7}, {x: [20, 30], y: 3}]
 * // There are 20 features with an amount between 0 and 10, 7 features with an amount between 10 and 20, and 3 features with an amount between 20 and 30
 *
 * @memberof carto.expressions
 * @name viewportHistogram
 * @function
 * @api
 */

/**
 * ViewportHistogram Class
 *
 * Generates a histogram based on the features in the viewport.
 * This class is instanced automatically by using the `viewportHistogram` function. It is documented for its methods.
 * Read more about histogram expression at {@link carto.expressions.viewporthistogram}.
 *
 * @name expressions.ViewportHistogram
 * @abstract
 * @hideconstructor
 * @class
 * @api
 */
export default class ViewportHistogram extends Histogram {
    constructor (input, sizeOrBuckets = 20, weight = 1) {
        checkMaxArguments(arguments, 3, 'viewportHistogram');
        super({ input: implicitCast(input), weight: implicitCast(weight) });

        this._sizeOrBuckets = sizeOrBuckets;
        this._isViewport = true;
        this._hasBuckets = Array.isArray(sizeOrBuckets);
        this._cached = null;
    }

    get value () {
        if (this._cached === null) {
            if (!this._histogram) {
                return null;
            }
            this._cached = super.value;
        }

        return this._cached;
    }

    eval () {
        return this.value;
    }

    /**
     * Get an array of joined data by key and sorted by frequency.
     *
     * Note: It can be combined with a `ramp.getLegendData()` method. Take a look at the examples to see how it works.
     *
     * @param {Array} values - Array of { key, value } pairs
     * @return {Array} - { frequency, key, value }
     * @memberof expressions.ViewportHistogram
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
     *   @histogram: s.viewportHistogram(s.prop('vehicles'))
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
     *   @histogram: viewportHistogram($vehicles)
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
     *   @histogram: s.viewportHistogram(s.prop('vehicles'))
     *   color: ramp(s.prop('vehicles'), s.palettes.PRISM)
     * `);
     *
     * const legend = viz.color.getLegendData();
     * const data = viz.variables.histogram.getJoinedValues(legend.data);
     * // returns the following array
     * // [
     * //   { frequency: 10, key: 'truck', value: { r: 95, g: 70, b: 144, a: 1 } }
     * //   { frequency: 20, key: 'bike', value: { r: 29, g: 105, b: 150, a: 1 } }
     * //   { frequency: 30, key: 'car', value: { r: 56, g: 166, b: 165, a: 1 } }
     * // ]
     *
     * @example <caption>Get color values for the histogram when using a ramp. (String)</caption>
     * const s = carto.expressions;
     * const viz = new carto.Viz(`
     *   @histogram: viewportHistogram($vehicles)
     *   color: ramp($vehicles, Prism)
     * `);
     *
     * const legend = viz.color.getLegendData();
     * const data = viz.variables.histogram.getJoinedValues(legend.data);
     * // returns the following array
     * // [
     * //   { frequency: 10, key: 'truck', value: { r: 95, g: 70, b: 144, a: 1 } }
     * //   { frequency: 20, key: 'bike', value: { r: 29, g: 105, b: 150, a: 1 } }
     * //   { frequency: 30, key: 'car', value: { r: 56, g: 166, b: 165, a: 1 } }
     * // ]
     * @example <caption>Get color values for the histogram using a ramp with classified data.</caption>
     * // Note: Both the ramp and the histogram expressions must use the same classification.
     *
     * const s = carto.expressions;
     * const viz = new carto.Viz(`
     *   @histogram: s.viewportHistogram(s.top(s.prop('vehicles'), 2))
     *   color: ramp(s.top(s.prop('vehicles'), 2)), s.palettes.PRISM, s.rgba(0, 128, 0, 1))
     * `);
     *
     * const options = { othersLabel: 'Others '};
     * const legend = viz.color.getLegendData(options);
     * const data = viz.variables.histogram.getJoinedValues(legend.data, options);
     * // returns the following array
     * // [
     * //   { frequency: 10, key: 'truck', value: { r: 95, g: 70, b: 144, a: 1 } }
     * //   { frequency: 20, key: 'bike', value: { r: 29, g: 105, b: 150, a: 1 } }
     * //   { frequency: 30, key: 'Others', value: { r: 0, g: 128, b: 0, a: 1 } }
     * // ]
     *
     * @example <caption>Get color values for the histogram using a ramp with classified data (String).</caption>
     * const s = carto.expressions;
     * const viz = new carto.Viz(`
     *   @histogram: viewportHistogram(top($vehicles, 2))
     *   color: ramp((top($vehicles, 2)), Prism, green)
     * `);
     *
     * const options = { othersLabel: 'Others '};
     * const legend = viz.color.getLegendData(options);
     * const data = viz.variables.histogram.getJoinedValues(legend.data, options);
     * // returns the following array
     * // [
     * //   { frequency: 10, key: 'truck', value: { r: 95, g: 70, b: 144, a: 1 } }
     * //   { frequency: 20, key: 'bike', value: { r: 29, g: 105, b: 150, a: 1 } }
     * //   { frequency: 30, key: 'Others', value: { r: 0, g: 128, b: 0, a: 1 } }
     * // ]
     *
     */
    getJoinedValues (values, options) {
        checkArray('viewportHistogram.getJoinedValues', 'values', 0, values);

        if (!values.length) {
            return [];
        }

        const config = Object.assign({}, DEFAULT_OPTIONS, options);
        const joinedValues = [];
        const otherValues = [];

        this.value.forEach((elem) => {
            const val = values.find(value => {
                if (Array.isArray(value.key)) {
                    return value.key[0] === elem.x[0] && value.key[1] === elem.x[1];
                }
                return elem.x === value.key;
            });

            if (val) {
                const frequency = elem.y;
                const key = val.key;
                const value = val.value;

                joinedValues.push({ frequency, key, value });
            } else {
                otherValues.push(elem.y);
            }
        });

        const others = values.find(value => config.othersLabel === value.key);

        if (others) {
            const frequency = otherValues.reduce((prev, freq) => prev + freq);
            const key = others.key;
            const value = others.value;

            joinedValues.push({ frequency, key, value });
        }

        return joinedValues.sort((a, b) => b.frequency - a.frequency);
    }

    accumViewportAgg (feature) {
        const evalFeature = this.input.eval(feature);
        const property = this.input.isA(Top)
            ? evalFeature.label
            : evalFeature;

        if (property !== undefined) {
            const clusterCount = feature[CLUSTER_FEATURE_COUNT] || 1;
            const weight = clusterCount * this.weight.eval(feature);
            const count = this._histogram.get(property) || 0;
            this._histogram.set(property, count + weight);
        }
    }

    _resetViewportAgg (metadata) {
        if (metadata) {
            this._bindMetadata(metadata);
        }
        this._cached = null;
        this._histogram = new Map();
    }
}
