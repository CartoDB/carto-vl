import ViewportAggregation from './ViewportAggregation';
import { checkMaxArguments } from '../../utils';
/**
 * Return the maximum value of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {Number} input - numeric expression
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the maximum of the `amount` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_max: s.viewportMax(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the maximum of the `amount` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_max: viewportMax($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportMax
 * @function
 * @api
 */
export default class ViewportMax extends ViewportAggregation {
    constructor (property) {
        checkMaxArguments(arguments, 1, 'viewportMax');
        super({ property });
        this._value = Number.NEGATIVE_INFINITY;
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
            this._value = Math.max(this._value, propertyValue);
        }
    }

    _resetViewportAgg () {
        this._value = Number.NEGATIVE_INFINITY;
    }
}
