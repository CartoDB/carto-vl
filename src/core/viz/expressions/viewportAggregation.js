import BaseExpression from './base';
import { number } from '../functions';
import { implicitCast, clamp } from './utils';

/**
 * Return the average value of the features showed in the viewport.
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example <caption>Assign the average of the `amout` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_avg: s.viewportAvg(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the average of the `amout` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   @v_avg: viewportAvg($amount)
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
 * Return the maximum value of the features showed in the viewport.
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example <caption>Assign the maximum of the `amout` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_max: s.viewportMax(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the maximum of the `amout` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   @v_max: viewportMax($amount)
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
 * Return the minimum value of the features showed in the viewport.
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example <caption>Assign the minimum of the `amout` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_min: s.viewportMin(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the minimum of the `amout` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   @v_min: viewportMin($amount)
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
 * Return the sum of the values of the features showed in the viewport.
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example <caption>Assign the sum of the `amout` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_sum: s.viewportSum(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the sum of the `amout` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   @v_sum: viewportSum($amount)
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
 * Return the count of the features showed in the viewport.
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example <caption>Assign the count of the `amout` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_count: s.viewportSum(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the count of the `amout` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   @v_count: viewportSum($amount)
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
                property: implicitCast(property),
                value: number(0)
            });
            this._isViewport = true;
        }
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
 * Return the percentile of the features showed in the viewport.
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example <caption>Assign the percentile of the `amout` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_percentile: s.viewportPercentile(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the percentile of the `amout` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   @v_percentile: viewportPercentile($amount)
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

export class ViewportHistogram extends BaseExpression {
    constructor(x, weight = 1) {
        super({
            x: implicitCast(x),
            weight: implicitCast(weight),
        });
        this._isViewport = true;
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
    eval() {
        if (this._cached == null) {
            this._cached = [...this._histogram].map(([x, y]) => {
                return { x: this._metatada.categoryIDsToName[x], y };
            });
        }
        return this._cached;
    }
    _compile(metadata) {
        this._metatada = metadata;
    }
}

