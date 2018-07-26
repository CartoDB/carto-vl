import BaseExpression from '../../base';
import { implicitCast } from '../../utils';

/**
 * Generates an histogram.
 *
 * The histogram can be based on a categorical expression, in which case each category will correspond to a histogram bar.
 * The histogram can be based on a numeric expression, in which case the minimum and maximum will be computed automatically and bars will be generated
 * at regular intervals between the minimum and maximum. The number of bars in this case is controllable through the `size` parameter.
 *
 * Histograms are useful to get insights and create widgets outside the scope of CARTO VL, see the following example for more info.
 *
 * @param {Number} input - expression to base the histogram
 * @param {Number} weight - Weight each occurrence differently based on this weight, defaults to `1`, which will generate a simple, non-weighted count.
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
 * @name viewportPercentile
 * @function
 * @api
 */
export default class ViewportHistogram extends BaseExpression {
    constructor (x, weight = 1, size = 1000) {
        super({ x: implicitCast(x), weight: implicitCast(weight) });

        this._size = size;
        this._isViewport = true;
        this.inlineMaker = () => null;
    }

    _resetViewportAgg (metadata) {
        this._metadata = metadata || this._metadata;
        if (this.x.name) {
            this.type = metadata.properties[this.x.name].type;
        }
        this._cached = null;
        this._histogram = new Map();
    }

    accumViewportAgg (feature) {
        const x = this.x.eval(feature);

        if (!this.type) {
            this.type = typeof x === 'number' ? 'number' : 'category';
        }

        if (x !== undefined) {
            const weight = this.weight.eval(feature);
            const count = this._histogram.get(x) || 0;
            this._histogram.set(x, count + weight);
        }
    }

    get value () {
        if (this._cached === null) {
            if (!this._histogram) {
                return null;
            }

            this._cached = this.type === 'number'
                ? _getNumericValue(this._histogram, this._size)
                : _getCategoryValue(this._histogram, this._metadata);

            return this._cached;
        }

        return this._cached;
    }

    eval () {
        return this.value;
    }

    _compile (metadata) {
        super._compile(metadata);
        this._metadata = metadata;
        if (this.x.name) {
            this.type = metadata.properties[this.x.name].type;
        }
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

function _getCategoryValue (histogram, metadata) {
    return [...histogram].map(([x, y], index) => {
        return { x: metadata.IDToCategory.get(index), y };
    });
}
