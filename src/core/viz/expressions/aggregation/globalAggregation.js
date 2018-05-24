import BaseExpression from '../base';
import { number } from '../../functions';
import * as schema from '../../../schema';
import { implicitCast } from '../utils';

/**
 * Return the average of the feature property for the entire source data.
 *
 * @param {carto.expressions.property} property - property expression of date or number type
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the global average of the `amount` property to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      g_avg: s.globalAvg(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the global average of the `amount` property to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@g_avg: globalAvg($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalAvg
 * @function
 * @api
 */
export const GlobalAvg = generateGlobalAggregattion('avg');

/**
 * Return the maximum of the feature property for the entire source data.
 *
 * @param {carto.expressions.property} property - property expression of date or number type
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the global maximum of the `amount` property to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      g_max: s.globalMax(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the global maximum of the `amount` property to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@g_max: globalMax($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalMax
 * @function
 * @api
 */
export const GlobalMax = generateGlobalAggregattion('max');

/**
 * Return the minimum of the feature property for the entire source data.
 *
 * @param {carto.expressions.property} property - property expression of date or number type
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the global minimum of the `amount` property to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      g_min: s.globalMin(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the global minimum of the `amount` property to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@g_min: globalMin($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalMin
 * @function
 * @api
 */
export const GlobalMin = generateGlobalAggregattion('min');

/**
 * Return the sum of the feature property for the entire source data.
 *
 * @param {carto.expressions.property} property - property expression of date or number type
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the global sum of the `amount` property to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      g_sum: s.globalSum(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the global sum of the `amount` property to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@g_sum: globalSum($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalSum
 * @function
 * @api
 */
export const GlobalSum = generateGlobalAggregattion('sum');

/**
 * Return the feature count for the entire source data.
 *
 * @param {carto.expressions.property} property - property expression of date or number type
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the global count of the `amount` property to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      g_count: s.globalCount(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the global count of the `amount` property to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@g_count: globalCount($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalCount
 * @function
 * @api
 */
export const GlobalCount = generateGlobalAggregattion('count');


function generateGlobalAggregattion(metadataPropertyName) {
    return class GlobalAggregattion extends BaseExpression {
        /**
         * @param {*} property
         */
        constructor(property) {
            super({ _value: number(0) });
            this.property = implicitCast(property);
        }

        get value() {
            return this._value.expr;
        }

        eval() {
            return this._value.expr;
        }

        _compile(metadata) {
            super._compile(metadata);
            // TODO improve type check
            this.property._compile(metadata);
            this.type = 'number';
            super.inlineMaker = inline => inline._value;
            this._value.expr = metadata.columns.find(c => c.name === this.property.name)[metadataPropertyName];
        }
        _getMinimumNeededSchema() {
            return this.property._getMinimumNeededSchema();
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


/**
 * Return the Nth percentile of the feature property for the entire source data.
 *
 * @param {carto.expressions.property} property - property expression of date or number type
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the global percentile of the `amount` property to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      g_percentile: s.globalPercentile(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the global percentile of the `amount` property to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@g_percentile: globalPercentile($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalPercentile
 * @function
 * @api
 */
export class GlobalPercentile extends BaseExpression {
    /**
     * @param {*} property
     */
    constructor(property, percentile) {
        if (!Number.isFinite(percentile)) {
            throw new Error('Percentile must be a fixed literal number');
        }
        super({ _value: number(0) });
        // TODO improve type check
        this.property = property;
        this.percentile = percentile;
    }

    get value() {
        return this._value.expr;
    }

    _compile(metadata) {
        super._compile(metadata);
        this.property._compile(metadata);
        this.type = 'number';
        super.inlineMaker = inline => inline._value;
        const copy = metadata.sample.map(s => s[this.property.name]);
        copy.sort((x, y) => x - y);
        const p = this.percentile / 100;
        this._value.expr = copy[Math.floor(p * copy.length)];
    }
    _getMinimumNeededSchema() {
        return this.property._getMinimumNeededSchema();
    }
    _getColumnName() {
        if (this.property.aggName) {
            // Property has aggregation
            return schema.column.aggColumn(this.property.name, this.property.aggName);
        }
        return this.property.name;
    }
}
