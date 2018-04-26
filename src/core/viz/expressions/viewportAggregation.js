import BaseExpression from './base';
import { number } from '../functions';
import * as schema from '../../schema';

/**
 * Return the average value of the features showed in the viewport
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz(`
 *   @v_avg: s.viewportAvg($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportAvg
 * @function
 * @api
 */
export const ViewportAvg = generateAggregattion('avg');

/**
 * Return the maximum value of the features showed in the viewport
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz(`
 *   @v_max: s.viewportMax($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportMax
 * @function
 * @api
 */
export const ViewportMax = generateAggregattion('max');

/**
 * Return the minimum value of the features showed in the viewport
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz(`
 *   @v_min: s.viewportMin($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportMin
 * @function
 * @api
 */
export const ViewportMin = generateAggregattion('min');

/**
 * Return the sum of the values of the features showed in the viewport
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz(`
 *   @v_sum: s.viewportSum($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportSum
 * @function
 * @api
 */
export const ViewportSum = generateAggregattion('sum');

/**
 * Return the count of the features showed in the viewport
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz(`
 *   @v_count: s.viewportCount($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportCount
 * @function
 * @api
 */
export const ViewportCount = generateAggregattion('count');

/**
 * Return the percentile of the features showed in the viewport
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz(`
 *   @v_percentile: s.viewportPercentile($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportPercentile
 * @function
 * @api
 */
export const ViewportPercentile = generatePercentile();

/**
 * Return the average value of all the features
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz(`
 *   @g_avg: s.globalAvg($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalAvg
 * @function
 * @api
 */
export const GlobalAvg = generateAggregattion('avg', true);

/**
 * Return the maximum value of all the features
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz(`
 *   @g_max: s.globalMax($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalMax
 * @function
 * @api
 */
export const GlobalMax = generateAggregattion('max', true);

/**
 * Return the minimum value of all the features
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz(`
 *   @g_min: s.globalMin($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalMin
 * @function
 * @api
 */
export const GlobalMin = generateAggregattion('min', true);

/**
 * Return the sum of the values of all the features
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz(`
 *   @g_sum: s.globalSum($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalSum
 * @function
 * @api
 */
export const GlobalSum = generateAggregattion('sum', true);

/**
 * Return the count of all the features
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz(`
 *   @g_count: s.globalCount($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalCount
 * @function
 * @api
 */
export const GlobalCount = generateAggregattion('count', true);

/**
 * Return the percentile of all the features
 *
 * @param {carto.expressions.Base} property - Column of the table
 * @return {carto.expressions.Base} Result of the aggregation
 *
 * @example
 * const s = carto.expressions;
 * const $amount = s.prop('amount');
 * const viz = new carto.Viz(`
 *   @g_percentile: s.globalPercentile($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalPercentile
 * @function
 * @api
 */
export const GlobalPercentile = generatePercentile(true);

function generateAggregattion(metadataPropertyName, global) {
    return class Aggregattion extends BaseExpression {
        /**
         * @param {*} property
         */
        constructor(property) {
            super({ value: number(0) });
            this.property = property;
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
            if (global) {
                this.value.expr = metadata.columns.find(c => c.name === this.property.name)[metadataPropertyName];
            }
        }
        _getMinimumNeededSchema() {
            return this.property._getMinimumNeededSchema();
        }
        _getDrawMetadataRequirements() {
            if (!global) {
                return { columns: [this._getColumnName()] };
            } else {
                return { columns: [] };
            }
        }
        _updateDrawMetadata(drawMetadata){
            const name = this._getColumnName();
            const column = drawMetadata.columns.find(c => c.name === name);
            if (!global) {
                this.value.expr = column[metadataPropertyName];
            }
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

function generatePercentile(global) {
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
            if (global) {
                const copy = metadata.sample.map(s => s[this.property.name]);
                copy.sort((x, y) => x - y);
                const p = this.percentile / 100;
                this.value.expr = copy[Math.floor(p * copy.length)];
            }
        }
        _getMinimumNeededSchema() {
            return this.property._getMinimumNeededSchema();
        }
        _getDrawMetadataRequirements() {
            if (!global) {
                return { columns: [this._getColumnName()] };
            } else {
                return { columns: [] };
            }
        }
        _preDraw(program, drawMetadata, gl) {
            // TODO use _updateDrawMetadata
            const name = this._getColumnName();
            if (!global) {
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
            }
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
