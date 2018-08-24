import ClusterAggregation from './ClusterAggregation';
import { checkMaxArguments } from '../../utils';
/**
 * Aggregate using the mode. This operation disables the access to the property
 * except within other cluster aggregate functions.
 *
 * Note: `clusterMode` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Category} property - Column of the table to be aggregated
 * @return {Category} Aggregated column
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
export default class ClusterMode extends ClusterAggregation {
    constructor (property) {
        checkMaxArguments(arguments, 1, 'clusterMode');
        super({ property, expressionName: 'clusterMode', aggName: 'mode', aggType: 'category' });
    }
}
