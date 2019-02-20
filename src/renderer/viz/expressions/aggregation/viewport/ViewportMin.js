import ViewportAggregation from './ViewportAggregation';
import { checkMaxArguments } from '../../utils';

/**
 * Return the minimum value of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {Number} input - numeric expression
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the minimum of the `amount` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_min: s.viewportMin(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the minimum of the `amount` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_min: viewportMin($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportMin
 * @function
 * @api
 */
export default class ViewportMin extends ViewportAggregation {
    constructor (property) {
        checkMaxArguments(arguments, 1, 'viewportMin');

        super({ property });
        this._value = Number.POSITIVE_INFINITY;
    }

    get value () {
        return this._value;
    }

    eval () {
        return this.value;
    }

    accumViewportAgg (feature) {
        const propertyValue = this.property.eval(feature);

        if (propertyValue !== null) {
            this._value = Math.min(this._value, propertyValue);
        }
    }

    _resetViewportAgg () {
        this._value = Number.POSITIVE_INFINITY;
    }
}
