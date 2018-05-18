import BaseExpression from './base';
import { number } from '../functions';
import { implicitCast, clamp } from './utils';

/**
 * Return the average value of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {carto.expressions.Base} x - numeric expression
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example <caption>Assign the average of the `amount` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_avg: s.viewportAvg(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the average of the `amount` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_avg: viewportAvg($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportAvg
 * @function
 * @api
 */
export const ViewportAvg = genViewportAgg('avg',
    self => {
        self._sum = 0; self._count = 0;
    },
    (self, x) => {
        if (!Number.isNaN(x)) {
            self._count++;
            self._sum += x;
        }
    },
    self => self._sum / self._count
);

/**
 * Return the maximum value of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {carto.expressions.Base} x - numeric expression
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example <caption>Assign the maximum of the `amount` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_max: s.viewportMax(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the maximum of the `amount` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_max: viewportMax($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportMax
 * @function
 * @api
 */
export const ViewportMax = genViewportAgg('max',
    self => { self._value = Number.NEGATIVE_INFINITY; },
    (self, y) => { self._value = Math.max(self._value, y); },
    self => self._value
);

/**
 * Return the minimum value of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {carto.expressions.Base} x - numeric expression
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example <caption>Assign the minimum of the `amount` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_min: s.viewportMin(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the minimum of the `amount` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_min: viewportMin($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportMin
 * @function
 * @api
 */
export const ViewportMin = genViewportAgg('min',
    self => { self._value = Number.POSITIVE_INFINITY; },
    (self, y) => { self._value = Math.min(self._value, y); },
    self => self._value);

/**
 * Return the sum of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {carto.expressions.Base} x - numeric expression
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example <caption>Assign the sum of the `amount` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_sum: s.viewportSum(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the sum of the `amount` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_sum: viewportSum($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportSum
 * @function
 * @api
 */
export const ViewportSum = genViewportAgg('sum',
    self => { self._value = 0; },
    (self, y) => { self._value = self._value + y; },
    self => self._value);

/**
 * Return the feature count of the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example <caption>Assign the feature count in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_count: s.viewportCount(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the feature count in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_count: viewportCount($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportCount
 * @function
 * @api
 */
export const ViewportCount = genViewportAgg('count',
    self => { self._value = 0; },
    self => { self._value++; },
    self => self._value);



function genViewportAgg(metadataPropertyName, zeroFn, accumFn, resolveFn) {
    return class ViewportAggregation extends BaseExpression {
        /**
         * @param {*} property
         */
        constructor(property) {
            super({
                property: implicitCast(metadataPropertyName == 'count' ? number(0) : property),
                value: number(0)
            });
            this._isViewport = true;
        }

        // FIXME: This getter introduces a collision with the required `value`
        // property. The following code is commented to avoid that conflict.
        //
        // get value() {
        //     return resolveFn(this);
        // }

        eval() {
            return resolveFn(this);
        }
        _compile(metadata) {
            super._compile(metadata);
            // TODO improve type check
            this.property._compile(metadata);
            this.type = 'number';
            super.inlineMaker = inline => inline.value;
        }
        _getMinimumNeededSchema() {
            return this.property._getMinimumNeededSchema();
        }
        _resetViewportAgg() {
            zeroFn(this);
        }
        _accumViewportAgg(feature) {
            accumFn(this, this.property.eval(feature));
        }
        _preDraw(...args) {
            this.value.expr = this.eval();
            super._preDraw(...args);
        }
    };
}

/**
 * Return the Nth percentile of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {carto.expressions.Base} x - numeric expression
 * @return {carto.expressions.Base} Result of the aggregation
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
export class ViewportPercentile extends BaseExpression {
    /**
     * @param {*} property
     */
    constructor(property, percentile) {
        super({
            property: implicitCast(property),
            percentile: implicitCast(percentile),
            impostor: number(0)
        });
        this._isViewport = true;
    }

    get value() {
        return this.eval();
    }

    eval(f) {
        if (this._value == null) {
            this._array.sort((a, b) => a - b);
            const index = clamp(
                Math.floor(this.percentile.eval(f) / 100 * this._array.length),
                0, this._array.length - 1);
            this._value = this._array[index];
        }
        return this._value;
    }

    _compile(metadata) {
        super._compile(metadata);
        // TODO improve type check
        this.property._compile(metadata);
        this.type = 'number';
        super.inlineMaker = inline => inline.impostor;
    }
    _getMinimumNeededSchema() {
        return this.property._getMinimumNeededSchema();
    }
    _resetViewportAgg() {
        this._value = null;
        this._array = [];
    }
    _accumViewportAgg(feature) {
        const v = this.property.eval(feature);
        this._array.push(v);
    }
    _preDraw(...args) {
        this.impostor.expr = this.eval();
        super._preDraw(...args);
    }
}

/**
 * Generates an histogram.
 *
 * The histogram can be based on a categorical expression, in which case each category will correspond to a histogram bar.
 * The histogram can be based on a numeric expression, in which case the minimum and maximum will be computed automatically and bars will be generated
 * at regular intervals between the minimum and maximum. The number of bars in this case is controllable through the `size` parameter.
 *
 * Histograms are useful to get insights and create widgets outside the scope of CARTO VL, see the following example for more info.
 *
 * @param {carto.expressions.Base} x - expression to base the histogram
 * @param {carto.expressions.Base} weight - Weight each occurrence differently based on this weight, defaults to `1`, which will generate a simple, non-weighted count.
 * @param {Number} size - Optional (defaults to 1000). Number of bars to use if `x` is a numeric expression
 * @return {carto.expressions.Base} Histogram
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
export class ViewportHistogram extends BaseExpression {
    constructor(x, weight = 1, size = 1000) {
        super({
            x: implicitCast(x),
            weight: implicitCast(weight),
        });
        this._size = size;
        this._isViewport = true;
        this.inlineMaker = () => null;
    }
    _resetViewportAgg() {
        this._cached = null;
        this._histogram = new Map();
    }
    _accumViewportAgg(feature) {
        const x = this.x.eval(feature);
        const weight = this.weight.eval(feature);
        const count = this._histogram.get(x) || 0;
        this._histogram.set(x, count + weight);
    }
    get value() {
        if (this._cached == null) {
            if (!this._histogram) {
                return null;
            }
            if (this.x.type == 'number') {
                const array = [...this._histogram];
                let min = Number.POSITIVE_INFINITY;
                let max = Number.NEGATIVE_INFINITY;
                for (let i = 0; i < array.length; i++) {
                    const x = array[i][0];
                    min = Math.min(min, x);
                    max = Math.max(max, x);
                }
                const hist = Array(this._size).fill(0);
                const range = max - min;
                const sizeMinusOne = this._size - 1;
                for (let i = 0; i < array.length; i++) {
                    const x = array[i][0];
                    const y = array[i][1];
                    const index = Math.min(Math.floor(this._size * (x - min) / range), sizeMinusOne);
                    hist[index] += y;
                }
                this._cached = hist.map((count, index) => {
                    return {
                        x: [min + index / this._size * range, min + (index + 1) / this._size * range],
                        y: count,
                    };
                });
            } else {
                this._cached = [...this._histogram].map(([x, y]) => {
                    return { x: this._metatada.categoryIDsToName[x], y };
                });
            }
        }
        return this._cached;
    }
    _compile(metadata) {
        this._metatada = metadata;
        super._compile(metadata);
    }
}
