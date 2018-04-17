import BaseExpression from './base';
import * as schema from '../../schema';
import PropertyExpression from './property';
import { checkInstance, checkType } from './utils';

/**
 * Aggregate using the average value. This operation disables the access to the property
 *
 * @param {carto.expressions.property} property - Column of the table to be aggregated
 * @return {carto.expressions.property} Aggregated column
 *
 * @example
 * const s = carto.expressions;
 * const $population = s.prop('population');
 * const viz = new carto.Viz({
 *   width: s.avg($population);
 * });
 *
 * @memberof carto.expressions
 * @name avg
 * @function
 * @api
 */
export const Avg = genAggregationOp('avg', 'number');

/**
 * Aggregate using the maximum value. This operation disables the access to the property
 *
 * @param {carto.expressions.property} property - Column of the table to be aggregated
 * @return {carto.expressions.property} Aggregated column
 *
 * @example
 * const s = carto.expressions;
 * const $population = s.prop('population');
 * const viz = new carto.Viz({
 *   width: s.max($population);
 * });
 *
 * @memberof carto.expressions
 * @name max
 * @function
 * @api
 */
export const Max = genAggregationOp('max', 'number');

/**
 * Aggregate using the minimum value. This operation disables the access to the property
 *
 * @param {carto.expressions.property} property - Column of the table to be aggregated
 * @return {carto.expressions.property} Aggregated column
 *
 * @example
 * const s = carto.expressions;
 * const $population = s.prop('population');
 * const viz = new carto.Viz({
 *   width: s.min($population);
 * });
 *
 * @memberof carto.expressions
 * @name min
 * @function
 * @api
 */
export const Min = genAggregationOp('min', 'number');

/**
 * Aggregate using the maximum value. This operation disables the access to the property
 *
 * @param {carto.expressions.property} property - Column of the table to be aggregated
 * @return {carto.expressions.property} Aggregated column
 *
 * @example
 * const s = carto.expressions;
 * const $population = s.prop('population');
 * const viz = new carto.Viz({
 *   width: s.sum($population);
 * });
 *
 * @memberof carto.expressions
 * @name sum
 * @function
 * @api
 */
export const Sum = genAggregationOp('sum', 'number');

/**
 * Aggregate using the maximum value. This operation disables the access to the property
 *
 * @param {carto.expressions.property} property - Column of the table to be aggregated
 * @return {carto.expressions.Property} Aggregated column
 *
 * @example
 * const s = carto.expressions;
 * const $population = s.prop('population');
 * const viz = new carto.Viz({
 *   width: s.mode($population);
 * });
 *
 * @memberof carto.expressions
 * @name mode
 * @function
 * @api
 */
export const Mode = genAggregationOp('mode', 'category');

function genAggregationOp(aggName, aggType) {
    return class AggregationOperation extends BaseExpression {
        constructor(property) {
            checkInstance(aggName, 'property', 0, PropertyExpression, property);
            super({ property });
            this._aggName = aggName;
            this.type = aggType;
        }
        get name() {
            return this.property.name;
        }
        get aggName() {
            return this._aggName;
        }
        get numCategories() {
            return this.property.numCategories;
        }
        eval(feature) {
            return feature[schema.column.aggColumn(this.property.name, aggName)];
        }
        //Override super methods, we don't want to let the property use the raw column, we must use the agg suffixed one
        _compile(metadata) {
            super._compile(metadata);
            checkType(aggName, 'property', 0, aggType, this.property);
        }
        _applyToShaderSource(getGLSLforProperty) {
            return {
                preface: '',
                inline: `${getGLSLforProperty(schema.column.aggColumn(this.property.name, aggName))}`
            };
        }
        _postShaderCompile() { }
        _getMinimumNeededSchema() {
            return {
                columns: [
                    schema.column.aggColumn(this.property.name, aggName)
                ]
            };
        }
    };
}
