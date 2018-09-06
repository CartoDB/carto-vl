import GlobalAggregation from './GlobalAggregation';
import { checkMaxArguments } from '../../utils';
/**
 * Return the minimum of the feature property for the entire source data.
 *
 * Note: `globalMin` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number|Date} property - property expression of date or number type
 * @return {Number|Date} Result of the aggregation
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
export default class GlobalMin extends GlobalAggregation {
    constructor (property) {
        checkMaxArguments(arguments, 1, 'globalMin');

        super({ property, name: 'min', type: 'number' });
    }
}
