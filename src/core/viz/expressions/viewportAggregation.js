import BaseExpression from './base';
import { number } from '../functions';
import { implicitCast, clamp } from './utils';

/**
 * Return the average value of the features showed in the viewport
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz({
 *   @v_avg: s.viewportAvg($amount)
 * });
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
 * Return the maximum value of the features showed in the viewport
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz({
 *   @v_max: s.viewportMax($amount)
 * });
 *
 * @memberof carto.expressions
 * @name viewportMax
 * @function
 * @api
 */
export const ViewportMax = genViewportAgg('max',
    self => { self._value = Number.NEGATIVE_INFINITY; },
    (self, y) => { self._value = y; },
    self => self._value
);

/**
 * Return the minimum value of the features showed in the viewport
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz({
 *   @v_min: s.viewportMin($amount)
 * });
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
 * Return the sum of the values of the features showed in the viewport
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz({
 *   @v_sum: s.viewportSum($amount)
 * });
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
 * Return the count of the features showed in the viewport
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz({
 *   @v_count: s.viewportCount($amount)
 * });
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
 * Return the percentile of the features showed in the viewport
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz({
 *   @v_percentile: s.viewportPercentile($amount)
 * });
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
