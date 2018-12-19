import GlobalAggregation from './GlobalAggregation';
import { checkMaxArguments } from '../../utils';

import ClusterAggregation from '../cluster/ClusterAggregation';
import ClusterAvg from '../cluster/ClusterAvg';
import ClusterMax from '../cluster/ClusterMax';
import ClusterMin from '../cluster/ClusterMin';

import CartoValidationError, { CartoValidationTypes as cvt } from '../../../../../errors/carto-validation-error';

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

        // FIXME: type should actually be the property type (number/date)
        // but if a variable it's too soon to know here

        let baseStats = false;
        if (property && property.isA(ClusterAggregation)) {
            if (property.isA(ClusterAvg) || property.isA(ClusterMin) || property.isA(ClusterMax)) {
                // This is not correct for ClusterAvg, and specially not for clusterMax...
                // but we allow for it
                baseStats = 'min';
            } else {
                throw new CartoValidationError(`${cvt.INCORRECT_TYPE} Invalid globlalAvg input`);
            }
        }

        super({ property, name: 'min', type: 'number', baseStats });
    }
}
