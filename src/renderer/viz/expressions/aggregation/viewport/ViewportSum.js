import ViewportAggregation from './ViewportAggregation';
import { checkMaxArguments } from '../../utils';

/**
 * Return the sum of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {Number} input - numeric expression
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the sum of the `amount` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_sum: s.viewportSum(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the sum of the `amount` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_sum: viewportSum($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportSum
 * @function
 * @api
 */
export default class ViewportSum extends ViewportAggregation {
    constructor (property) {
        checkMaxArguments(arguments, 1, 'viewportSum');

        super({ property });
        this._value = 0;
    }

    get value () {
        return this._value;
    }

    eval () {
        return this.value;
    }

    accumViewportAgg (feature) {
        const propertyValue = this.property.eval(feature);

        if (!Number.isNaN(propertyValue)) {
            this._value = this._value + propertyValue;
        }
    }

    _resetViewportAgg () {
        this._value = 0;
    }
}
