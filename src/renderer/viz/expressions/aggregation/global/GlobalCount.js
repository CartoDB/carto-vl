import GlobalAggregation from './GlobalAggregation';
import { checkMaxArguments } from '../../utils';

/**
 * Return the feature count for the entire source data.
 *
 * @return {Number} feature count
 *
 * @example <caption>Assign the global count of features to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      g_count: s.globalCount()
 *   }
 * });
 *
 * @example <caption>Assign the global count of features. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@g_count: globalCount()
 * `);
 *
 * @memberof carto.expressions
 * @name globalCount
 * @function
 * @api
 */
export default class GlobalCount extends GlobalAggregation {
    constructor () {
        checkMaxArguments(arguments, 0, 'globalCount');
        super({ name: 'count', type: 'number' });
    }
    toString () {
        return `${this.expressionName}()`;
    }
    _bindMetadata (metadata) {
        this._value.expr = metadata.featureCount;
    }
    _getMinimumNeededSchema () {
        return {
        };
    }
}
