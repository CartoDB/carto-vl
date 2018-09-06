import ViewportAggregation from './ViewportAggregation';
import { number } from '../../../expressions';
import { implicitCast, clamp, checkMaxArguments } from '../../utils';
/**
 * Return the Nth percentile of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {Number} input - Numeric expression
 * @param {Number} percentile - Numeric expression [0, 100]
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the percentile of the `amount` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_percentile: s.viewportPercentile(s.prop('amount'), 90)
 *   }
 * });
 *
 * @example <caption>Assign the percentile of the `amount` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_percentile: viewportPercentile($amount, 90)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportPercentile
 * @function
 * @api
 */
export default class ViewportPercentile extends ViewportAggregation {
    /**
     * @param {*} property
     * @param {*} percentile
     */
    constructor (property, percentile) {
        checkMaxArguments(arguments, 2, 'viewportPercentile');

        super({ property, _impostor: number(0) });

        this._isViewport = true;
        this.percentile = implicitCast(percentile);
        this.type = 'number';
        super.inlineMaker = inline => inline.impostor;
    }

    get value () {
        return this.eval();
    }

    eval (feature) {
        if (this._value === null) {
            const percentile = _getPercentile(this.percentile.eval(feature), this._array.length);
            const index = clamp(percentile, 0, this._array.length - 1);

            this._array.sort((a, b) => a - b);
            this._value = this._array[index];
        }

        return this._value;
    }

    _getMinimumNeededSchema () {
        return this.property._getMinimumNeededSchema();
    }

    _resetViewportAgg () {
        this._value = null;
        this._array = [];
    }

    accumViewportAgg (feature) {
        const v = this.property.eval(feature);
        this._array.push(v);
    }

    _preDraw (...args) {
        this.impostor.expr = this.eval();
        super._preDraw(...args);
    }
}

function _getPercentile (value, length) {
    return Math.floor(value / 100 * length);
}
