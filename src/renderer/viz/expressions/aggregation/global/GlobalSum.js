import GlobalAggregation from './GlobalAggregation';
import { checkMaxArguments } from '../../utils';

import ClusterAggregation from '../cluster/ClusterAggregation';
import ClusterCount from '../cluster/ClusterCount';
import ClusterSum from '../cluster/ClusterSum';

import CartoValidationError, { CartoValidationTypes as cvt } from '../../../../../errors/carto-validation-error';

/**
 * Return the sum of the feature property for the entire source data.
 *
 * Note: `globalSum` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number} property - property expression of number type
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
export default class GlobalSum extends GlobalAggregation {
    constructor (property) {
        checkMaxArguments(arguments, 1, 'globalSum');

        let baseStats = false;
        if (property && (property.isA(ClusterAggregation) || property.isA(ClusterCount))) {
            if (property.isA(ClusterSum)) {
                baseStats = 'sum';
            } else if (property.isA(ClusterCount)) {
                baseStats = '_count';
            } else {
                throw new CartoValidationError(`${cvt.INCORRECT_TYPE} Invalid globlalAvg input`);
            }
        }

        super({ property, name: 'sum', baseStats });
    }
}
