import BaseExpression from './base';
import * as schema from '../../schema';
import PropertyExpression from './property';
import { checkInstance, checkType } from './utils';

/**
 * Aggregate using the average value. This operation disables the access to the property
 *
 * @param {carto.expressions.Base} property - Column of the table to be aggregated
 * @return {carto.expressions.Base} Aggregated column
 *
 * @example
 * const s = carto.expressions;
 * const $population = s.prop('population');
 * const viz = new carto.Viz({
 *   width: s.clusterAvg($population);
 * });
 *
 * @memberof carto.expressions
 * @name clusterAvg
 * @function
 * @api
 */
export const ClusterAvg = genAggregationOp('avg', 'number');

/**
 * Aggregate using the maximum value. This operation disables the access to the property
 *
 * @param {carto.expressions.Base} property - Column of the table to be aggregated
 * @return {carto.expressions.Base} Aggregated column
 *
 * @example
 * const s = carto.expressions;
 * const $population = s.prop('population');
 * const viz = new carto.Viz({
 *   width: s.clusterMax($population);
 * });
 *
 * @memberof carto.expressions
 * @name clusterMax
 * @function
 * @api
 */
export const ClusterMax = genAggregationOp('max', 'number');

/**
 * Aggregate using the minimum value. This operation disables the access to the property
 *
 * @param {carto.expressions.Base} property - Column of the table to be aggregated
 * @return {carto.expressions.Base} Aggregated column
 *
 * @example
 * const s = carto.expressions;
 * const $population = s.prop('population');
 * const viz = new carto.Viz({
 *   width: s.clusterMin($population);
 * });
 *
 * @memberof carto.expressions
 * @name clusterMin
 * @function
 * @api
 */
export const ClusterMin = genAggregationOp('min', 'number');

/**
 * Aggregate using the maximum value. This operation disables the access to the property
 *
 * @param {carto.expressions.Base} property - Column of the table to be aggregated
 * @return {carto.expressions.Property} Aggregated column
 *
 * @example
 * const s = carto.expressions;
 * const $population = s.prop('population');
 * const viz = new carto.Viz({
 *   width: s.clusterMode($population);
 * });
 *
 * @memberof carto.expressions
 * @name clusterMode
 * @function
 * @api
 */
export const ClusterMode = genAggregationOp('mode', 'category');

/**
 * Aggregate using the maximum value. This operation disables the access to the property
 *
 * @param {carto.expressions.Base} property - Column of the table to be aggregated
 * @return {carto.expressions.Base} Aggregated column
 *
 * @example
 * const s = carto.expressions;
 * const $population = s.prop('population');
 * const viz = new carto.Viz({
 *   width: s.clusterSum($population);
 * });
 *
 * @memberof carto.expressions
 * @name clusterSum
 * @function
 * @api
 */
export const ClusterSum = genAggregationOp('sum', 'number');

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
