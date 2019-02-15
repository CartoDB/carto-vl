import BaseExpression from '../base';
// import { checkArray } from '../utils';

/**
 * Generates a histogram.
 *
 * The histogram can be based on a categorical expression, in which case each category will correspond to a histogram bar.
 *
 * The histogram can be based on a numeric expression, the buckets for the histogram is controllable through the `sizeOrBuckets` parameter.
 * For numeric values of sizeOrBuckets, the minimum and maximum will be computed automatically and bars will be generated at regular intervals between the minimum and maximum.
 * When providing sizeOrBuckets as a list of buckets, the values will get assigned to the first bucket matching the criteria [bucketMin <= value < bucketMax].
 *
 * Histograms are useful to get insights and create widgets outside the scope of CARTO VL, see the following example for more info.
 *
 * @param {Number} input - expression to base the histogram
 * @param {Number|Array} sizeOrBuckets - Optional (defaults to 20). Number of bars to use if `x` is a numeric expression; or user-defined buckets for numeric expressions.
 * @param {Number} weight - Optional. Weight each occurrence differently based on this weight, defaults to `1`, which will generate a simple, non-weighted count.
 * @return {Histogram} Histogram
 *
 * @example <caption>Create and use an histogram. (String)</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz(`
 *          \@categoryHistogram:    histogram($type)
 *          \@numericHistogram:     histogram($amount, 3, 1)
 *          \@userDefinedHistogram: histogram($amount, [[0, 10], [10, 20], [20, 30]], 1)
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
 * @name histogram
 * @function
 * @api
 */

/**
 * Histogram Class
 *
 * Generates a histogram.
 * This class is instanced automatically by using the `histogram` function. It is documented for its methods.
 * Read more about histogram expression at {@link carto.expressions.histogram}.
 *
 * @name expressions.Histogram
 * @abstract
 * @hideconstructor
 * @class
 * @api
 */
export default class Histogram extends BaseExpression {
    constructor (children) {
        super(children);
        this.type = 'histogram';
        this.inlineMaker = () => null;
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
     *   @histogram: s.histogram(s.prop('vehicles'))
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
     *   @histogram: histogram($vehicles)
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
     *   @histogram: s.histogram(s.prop('vehicles'))
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
     *   @histogram: histogram($vehicles)
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
    // getJoinedValues (values) {
    //     checkArray('histogram.getJoinedValues', 'values', 0, values);

    //     if (!values.length) {
    //         return [];
    //     }

    //     return this.value.map(elem => {
    //         const data = values.find(value => value.key === elem.x);

    //         const frequency = elem.y;
    //         const key = elem.x;
    //         const value = data !== -1 ? data.value : null;

    //         return { frequency, key, value };
    //     });
    // }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        this._metadata = metadata;
    }

    _getCategoryValue (histogram) {
        return [...histogram]
            .map(([x, y]) => {
                return { x, y };
            })
            .sort(this._sortNumerically);
    }

    _sortNumerically (a, b) {
        const frequencyDifference = (b.y - a.y);
        if (frequencyDifference === 0) {
            const categoryA = a.x;
            const categoryB = b.x;

            if (!categoryA && !categoryB) { return 0; } // both null or undefined
            if (!categoryA) { return 1; } // categoryB first
            if (!categoryB) { return -1; } // categoryA first

            return categoryA.localeCompare(categoryB);
        }

        return frequencyDifference;
    }

    _getNumericValue (histogram, size) {
        const array = [...histogram];
        const arrayLength = array.length;
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

        for (let i = 0; i < arrayLength; i++) {
            const x = array[i][0];
            min = Math.min(min, x);
            max = Math.max(max, x);
        }

        const hist = Array(size).fill(0);
        const range = max - min;
        const sizeMinusOne = size - 1;

        for (let i = 0; i < arrayLength; i++) {
            const x = array[i][0];
            const y = array[i][1];
            const index = Math.min(Math.floor(size * (x - min) / range), sizeMinusOne);
            hist[index] += y;
        }

        return hist.map((count, index) => {
            return {
                x: [min + index / size * range, min + (index + 1) / size * range],
                y: count
            };
        });
    }

    _getBucketsValue ([...histogram], buckets) {
        const nBuckets = buckets.length;
        const hist = Array(nBuckets).fill(0);

        for (let i = 0, len = histogram.length; i < len; i++) {
            const x = histogram[i][0];
            for (let j = 0; j < nBuckets; j++) {
                const bucket = buckets[j];
                if (x >= bucket[0] && x < bucket[1]) {
                    hist[j] += histogram[i][1];
                    break;
                }
            }
        }

        return hist.map((count, index) => {
            return {
                x: buckets[index],
                y: count
            };
        });
    }
}
