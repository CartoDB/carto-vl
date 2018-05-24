import BaseExpression from '../base';
import * as schema from '../../../schema';
import PropertyExpression from '../basic/property';
import { checkInstance, checkType } from '../utils';

/**
 * Aggregate using the average. This operation disables the access to the property
 * except within other cluster aggregate functions.
 *
 * @param {carto.expressions.property} property - Column of the table to be aggregated, must be a date or a number
 * @return {carto.expressions.property} Aggregated column
 *
 * @example <caption>Use cluster average of the population as width.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.clusterAvg(s.prop('population'))
 * });
 *
 * @example <caption>Use cluster average of the population as width. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: clusterAvg($population)
 * `);
 *
 * @memberof carto.expressions
 * @name clusterAvg
 * @function
 * @api
 */
export const ClusterAvg = genAggregationOp('avg', 'number');

/**
 * Aggregate using the maximum. This operation disables the access to the property
 * except within other cluster aggregate functions.
 *
 * @param {carto.expressions.property} property - Column of the table to be aggregated, must be a date or a number
 * @return {carto.expressions.property} Aggregated column
 *
 * @example <caption>Use cluster maximum of the population as width.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.clusterMax(s.prop('population'))
 * });
 *
 * @example <caption>Use cluster maximum of the population as width. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: clusterMax($population)
 * `);
 *
 * @memberof carto.expressions
 * @name clusterMax
 * @function
 * @api
 */
export const ClusterMax = genAggregationOp('max', 'number');

/**
 * Aggregate using the minimum. This operation disables the access to the property
 * except within other cluster aggregate functions.
 *
 * @param {carto.expressions.property} property - Column of the table to be aggregated, must be a date or a number
 * @return {carto.expressions.property} Aggregated column
 *
 * @example <caption>Use cluster minimum of the population as width.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.clusterMin(s.prop('population'))
 * });
 *
 * @example <caption>Use cluster minimum of the population as width. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: clusterMin($population)
 * `);
 *
 * @memberof carto.expressions
 * @name clusterMin
 * @function
 * @api
 */
export const ClusterMin = genAggregationOp('min', 'number');

/**
 * Aggregate using the mode. This operation disables the access to the property
 * except within other cluster aggregate functions.
 *
 * @param {carto.expressions.property} property - Column of the table to be aggregated must be a string
 * @return {carto.expressions.property} Aggregated column
 *
 * @example <caption>Use cluster mode of the population in a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.clusterMode(s.prop('category')), s.palettes.PRISM)
 * });
 *
 * @example <caption>Use cluster mode of the population in a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(clusterMode($category), PRISM)
 * `);
 *
 * @memberof carto.expressions
 * @name clusterMode
 * @function
 * @api
 */
export const ClusterMode = genAggregationOp('mode', 'category');

/**
 * Aggregate using the sum. This operation disables the access to the property
 * except within other cluster aggregate functions.
 *
 * @param {carto.expressions.property} property - Column of the table to be aggregated, must be a date or a number
 * @return {carto.expressions.property} Aggregated column
 *
 * @example <caption>Use cluster sum of the population as width.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.clusterSum(s.prop('population'))
 * });
 *
 * @example <caption>Use cluster sum of the population as width. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: clusterSum($population)
 * `);
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
