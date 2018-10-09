import BaseExpression from '../../base';
import { implicitCast } from '../../utils';
import { checkMaxArguments, checkArray } from '../../utils';

/**
 * Generates a histogram.
 *
 * The histogram can be based on a categorical expression, in which case each category will correspond to a histogram bar.
 * The histogram can be based on a numeric expression, in which case the minimum and maximum will be computed automatically and bars will be generated
 * at regular intervals between the minimum and maximum. The number of bars in this case is controllable through the `size` parameter.
 *
 * Histograms are useful to get insights and create widgets outside the scope of CARTO VL, see the following example for more info.
 *
 * @param {Number} input - expression to base the histogram
 * @param {Number} weight - Weight each occurrence differently based on this weight, defaults to `1`, whioinch will generate a simple, non-weighted count.
 * @param {Number} size - Optional (defaults to 1000). Number of bars to use if `x` is a numeric expression
 * @return {Histogram} Histogram
 *
 * @example <caption>Create and use an histogram. (String)</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz(`
 *          \@categoryHistogram: viewportHistogram($type)
 *          \@numericHistogram:  viewportHistogram($amount, 1, 3)
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
 * @name viewportHistogram
 * @function
 * @api
 */

/**
 * ViewportHistogram Class
 *
 * Generates a histogram.
 * This class is instanced automatically by using the `viewportHistogram` function. It is documented for its methods.
 * Read more about viewportHistogram expression at {@link carto.expressions.viewportHistogram}.
 *
 * @name expressions.ViewportHistogram
 * @abstract
 * @hideconstructor
 * @class
 * @api
 */
export default class ViewportHistogram extends BaseExpression {
    constructor (x, weight = 1, size = 1000) {
        checkMaxArguments(arguments, 3, 'viewportHistogram');
        super({ x: implicitCast(x), weight: implicitCast(weight) });

        this.type = 'histogram';
        this._size = size;
        this._isViewport = true;

        this.inlineMaker = () => null;
    }

    accumViewportAgg (feature) {
        const x = this.x.eval(feature);

        if (x !== undefined) {
            const weight = this.weight.eval(feature);
            const count = this._histogram.get(x) || 0;
            this._histogram.set(x, count + weight);
        }
    }

    eval () {
        if (this._cached === null) {
            if (!this._histogram) {
                return null;
            }

            this._cached = this.x.type === 'number'
                ? _getNumericValue(this._histogram, this._size)
                : _getCategoryValue(this._histogram);

            return this._cached;
        }

        return this._cached;
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
     *   @histogram: s.viewportHistogram(s.prop('vehicles))
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
     *   @histogram: viewportHistogram($vehicles)
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
        checkArray('viewportHistogram.getJoinedValues', 'values', 0, values);

        if (!values.length) {
            return [];
        }

        return this.value.map(elem => {
            const data = values.find(value => value.key === elem.x);

            const frequency = elem.y;
            const key = elem.x;
            const value = data !== -1 ? data.value : null;

            return { frequency, key, value };
        });
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        this._metadata = metadata;
    }

    _resetViewportAgg (metadata) {
        if (metadata) {
            this._bindMetadata(metadata);
        }
        this._cached = null;
        this._histogram = new Map();
    }
}

function _getNumericValue (histogram, size) {
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

function _getCategoryValue (histogram) {
    return [...histogram]
        .map(([x, y]) => {
            return { x, y };
        })
        .sort(_sortNumerically);
}

function _sortNumerically (a, b) {
    if (b.y - a.y === 0) {
        return a.x.localeCompare(b.x);
    }

    return b.y - a.y;
}
