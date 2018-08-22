import ClusterAggregation from './ClusterAggregation';
import { checkMaxArguments } from '../../utils';

/**
 * Aggregate using the maximum. This operation disables the access to the property
 * except within other cluster aggregate functions.
 *
 * Note: `clusterMax` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number} property - Column of the table to be aggregated
 * @return {Number} Aggregated column
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
export default class ClusterMax extends ClusterAggregation {
    constructor (property) {
        checkMaxArguments(arguments, 1, 'clusterMax');
        super({ property, expressionName: 'clusterMax', aggName: 'max', aggType: 'number' });
    }
}
