import ViewportAggregation from './ViewportAggregation';
import { number } from '../../../expressions';
import { checkMaxArguments } from '../../utils';

/**
 * Return the feature count of the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {Number} input - numeric expression
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the feature count in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_count: s.viewportCount(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the feature count in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_count: viewportCount($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportCount
 * @function
 * @api
 */
export default class ViewportCount extends ViewportAggregation {
    constructor () {
        checkMaxArguments(arguments, 1, 'viewportCount');

        super({ property: number(0) });
        this._value = 0;
    }

    get value () {
        return this._value;
    }

    eval () {
        return this.value;
    }

    accumViewportAgg () {
        this._value++;
    }

    _resetViewportAgg () {
        this._value = 0;
    }
}
