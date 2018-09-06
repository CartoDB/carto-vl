import GlobalAggregation from './GlobalAggregation';
import { checkMaxArguments } from '../../utils';

/**
 * Return the feature count for the entire source data.
 *
 * Note: `globalCount` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number} property - property expression
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
export default class GlobalCount extends GlobalAggregation {
    constructor (property) {
        checkMaxArguments(arguments, 1, 'globalCount');

        super({ property, name: 'count', type: 'number' });
    }
}
