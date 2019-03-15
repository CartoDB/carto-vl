import Histogram from './Histogram';
import Property from '../basic/property';
import { checkMaxArguments, implicitCast, checkArray } from '../utils';
import { OTHERS_LABEL, DEFAULT_OPTIONS } from '../constants';

/**
 * Generates a histogram based on a representative sample of the data.
 *
 * The histogram can be based on a categorical expression, in which case each category will correspond to a histogram bar.
 *
 * The histogram can be based on a numeric expression, the buckets for the histogram is controllable through the `sizeOrBuckets` parameter.
 * For numeric values of sizeOrBuckets, the minimum and maximum will be computed automatically and bars will be generated at regular intervals between the minimum and maximum.
 * When providing sizeOrBuckets as a list of buckets, the values will get assigned to the first bucket matching the criteria [bucketMin <= value < bucketMax].
 *
 * The sampleHistogram can also be combined with the `top()` expression.
 *
 * Histograms are useful to get insights and create widgets outside the scope of CARTO VL, see the following example for more info.
 *
 * @param {Number} input - expression to base the histogram
 * @param {Number|Array} sizeOrBuckets - Optional (defaults to 20). Number of bars to use if `x` is a numeric expression; or user-defined buckets for numeric expressions.
 * @return {SampleHistogram} SampleHistogram
 *
 * @example <caption>Create and use an histogram.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz(
 *     variables: {
 *       categoryHistogram: s.sampleHistogram(s.prop('type')),
 *       numericHistogram: s.sampleHistogram(s.prop('amount'), 3, 1),
 *       userDefinedHistogram: s.sampleHistogram(s.prop('amount', [[0, 10], [10, 20], [20, 30]], 1),
 *       topCategoryHistogram: s.sampleHistogram(s.top(s.prop('type'), 3))
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
 *    \@categoryHistogram:    sampleHistogram($type)
 *    \@numericHistogram:     sampleHistogram($amount, 3, 1)
 *    \@userDefinedHistogram: sampleHistogram($amount, [[0, 10], [10, 20], [20, 30]], 1)
 *    \@topCategoryHistogram: sampleHistogram(top($type, 3))
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
 * @name sampleHistogram
 * @function
 * @api
 */

/**
 * SampleHistogram Class
 *
 * Generates a histogram based on the samples from the metadata.
 * This class is instanced automatically by using the `sampleHistogram` function. It is documented for its methods.
 * Read more about histogram expression at {@link carto.expressions.globalhistogram}.
 *
 * @name expressions.SampleHistogram
 * @abstract
 * @hideconstructor
 * @class
 * @api
 */
export default class SampleHistogram extends Histogram {
    constructor (input, sizeOrBuckets = 20) {
        checkMaxArguments(arguments, 3, 'sampleHistogram');
        super({ input: implicitCast(input) });

        this._sizeOrBuckets = sizeOrBuckets;
        this._hasBuckets = Array.isArray(sizeOrBuckets);
        this._histogram = new Map();
    }

    /**
     * Get an array of joined data by key and sorted by frequency.
     *
     * Note: It can be combined with a `ramp.getLegendData()` method. Take a look at the examples to see how it works.
     *
     * @param {Array} values - Array of { key, value } pairs
     * @return {Array} - { frequency, key, value }
     * @memberof expressions.SampleHistogram
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
     *   @histogram: s.sampleHistogram(s.prop('vehicles'))
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
     *   @histogram: sampleHistogram($vehicles)
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
     *   @histogram: s.sampleHistogram(s.prop('vehicles'))
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
     *   @histogram: sampleHistogram($vehicles)
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
     *   @histogram: s.sampleHistogram(s.top(s.prop('vehicles'), 2))
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
     *   @histogram: sampleHistogram(top($vehicles, 2))
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
        checkArray('sampleHistogram.getJoinedValues', 'values', 0, values);

        if (!values.length) {
            return [];
        }

        const config = Object.assign({}, DEFAULT_OPTIONS, options);
        const joinedValues = [];

        this.value.forEach((elem) => {
            elem.x = elem.x === OTHERS_LABEL
                ? config.othersLabel
                : elem.x;
            const val = values.find(value => elem.x === value.key);

            if (val) {
                const frequency = elem.y;
                const key = val.key;
                const value = val.value;

                joinedValues.push({ frequency, key, value });
            }
        });

        return joinedValues;
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        this._histogram = new Map();

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
        const data = this.input.getLegendData(DEFAULT_OPTIONS).data;

        this._categories.forEach(c => {
            const category = data.find(category => c.name === category.key);
            if (category) {
                this._histogram.set(c.name, c.frequency);
            } else {
                const frequency = this._histogram.get(OTHERS_LABEL) || 0;
                this._histogram.set(OTHERS_LABEL, c.frequency + parseInt(frequency));
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
        const ratio = this._metadata.featureCount / this._metadata.sample.length;

        this._metadata.sample.forEach((feature) => {
            const key = feature[name];
            const value = this._histogram.get(key) || 0;

            this._histogram.set(key, value + ratio);
        });
    }
}
