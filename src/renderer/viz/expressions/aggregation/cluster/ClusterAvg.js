import ClusterAggregation from './ClusterAggregation';
import { checkMaxArguments } from '../../utils';
/**
 * Aggregate using the average. This operation disables the access to the property
 * except within other cluster aggregate functions.
 *
 * Note: `clusterAvg` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number} property - Column of the table to be aggregated
 * @return {Number} Aggregated column
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
export default class ClusterAvg extends ClusterAggregation {
    constructor (property) {
        checkMaxArguments(arguments, 1, 'clusterAvg');
        super({ property, expressionName: 'clusterAvg', aggName: 'avg', aggType: 'number' });
    }
}
