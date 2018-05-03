import BaseExpression from './base';
import { number } from '../functions';
import * as schema from '../../schema';
import { implicitCast } from './utils';

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
export const ViewportPercentile = generatePercentile();

function genViewportAgg(metadataPropertyName, zeroFn, accumFn, resolveFn) {
    return class ViewportAggregation extends BaseExpression {
        /**
         * @param {*} property
         */
        constructor(property) {
            super({ value: number(0) });
            this.property = implicitCast(property);
            this._isViewport = true;
        }
        eval() {
            return this.value.expr;
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
            this.value.expr = resolveFn(this);
            super._preDraw(...args);
        }
        _getDrawMetadataRequirements() {
            return { columns: [this._getColumnName()] };
        }
        _getColumnName() {
            if (this.property.aggName) {
                // Property has aggregation
                return schema.column.aggColumn(this.property.name, this.property.aggName);
            }
            return this.property.name;
        }
    };
}

function generatePercentile() {
    return class Percentile extends BaseExpression {
        /**
         * @param {*} property
         */
        constructor(property, percentile) {
            if (!Number.isFinite(percentile)) {
                throw new Error('Percentile must be a fixed literal number');
            }
            super({ value: number(0) });
            // TODO improve type check
            this.property = property;
            this.percentile = percentile;
        }
        eval() {
            return this.value.expr;
        }
        _compile(metadata) {
            super._compile(metadata);
            this.property._compile(metadata);
            this.type = 'number';
            super.inlineMaker = inline => inline.value;
        }
        _getMinimumNeededSchema() {
            return this.property._getMinimumNeededSchema();
        }
        _getDrawMetadataRequirements() {
            return { columns: [this._getColumnName()] };
        }
        _preDraw(program, drawMetadata, gl) {
            // TODO use _updateDrawMetadata
            const name = this._getColumnName();
            const column = drawMetadata.columns.find(c => c.name === name);
            const total = column.accumHistogram[column.histogramBuckets - 1];
            // TODO OPT: this could be faster with binary search
            for (var i = 0; i < column.histogramBuckets; i++) {
                if (column.accumHistogram[i] >= this.percentile / 100 * total) {
                    break;
                }
            }
            const br = i / column.histogramBuckets * (column.max - column.min) + column.min;
            this.value.expr = br;
            this.value._preDraw(program, drawMetadata, gl);
        }
        _getColumnName() {
            if (this.property.aggName) {
                // Property has aggregation
                return schema.column.aggColumn(this.property.name, this.property.aggName);
            }
            return this.property.name;
        }
    };
}
