import GlobalAggregation from './GlobalAggregation';
import { checkMaxArguments, checkType } from '../../utils';

import ClusterAggregation from '../cluster/ClusterAggregation';
import ClusterAvg from '../cluster/ClusterAvg';

import CartoValidationError, { CartoValidationTypes as cvt } from '../../../../../errors/carto-validation-error';

/**
 * Return the average of the feature property for the entire source data.
 *
 * Note: `globalAvg` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number} property - property expression of number type
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the global average of the `amount` property to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      g_avg: s.globalAvg(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the global average of the `amount` property to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@g_avg: globalAvg($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalAvg
 * @function
 * @api
 */
export default class GlobalAvg extends GlobalAggregation {
    constructor (property) {
        checkMaxArguments(arguments, 1, 'globalAvg');
        let baseStats = false;
        if (property && property.isA(ClusterAggregation)) {
            if (property.isA(ClusterAvg)) {
                // This is not strictly correct (the average of cluster averages is not the average of data)
                // but we'll allow it
                baseStats = 'avg';
            } else {
                throw new CartoValidationError(`${cvt.INCORRECT_TYPE} Invalid globlalAvg input`);
            }
        }

        super({ property, name: 'avg', type: 'number', baseStats });
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkType(this.expressionName, 'property', 0, 'number', this.property);
    }
}
