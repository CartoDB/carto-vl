import ClusterAggregation from './ClusterAggregation';
import { checkMaxArguments } from '../../utils';
/**
 * Aggregate using the minimum. This operation disables the access to the property
 * except within other cluster aggregate functions.
 *
 * Note: `clusterMin` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number} property - Column of the table to be aggregated
 * @return {Number} Aggregated column
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
export default class ClusterMin extends ClusterAggregation {
    constructor (property) {
        checkMaxArguments(arguments, 1, 'clusterMin');
        super({ property, expressionName: 'clusterMin', aggName: 'min', aggType: 'number' });
    }
}
