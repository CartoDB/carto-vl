import ViewportAggregation from './ViewportAggregation';
import { checkMaxArguments } from '../../utils';
import { CLUSTER_FEATURE_COUNT } from '../../../../schema';

/**
 * Return the average value of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {Number} input - numeric expression
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the average of the `amount` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_avg: s.viewportAvg(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the average of the `amount` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_avg: viewportAvg($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportAvg
 * @function
 * @api
 */
export default class ViewportAvg extends ViewportAggregation {
    constructor (property) {
        checkMaxArguments(arguments, 1, 'viewportAvg');

        super({ property });
        this._sum = 0;
        this._count = 0;
    }

    get value () {
        return this._sum / this._count;
    }

    eval () {
        return this.value;
    }

    accumViewportAgg (feature) {
        const propertyValue = this.property.eval(feature);

        if (propertyValue !== null) {
            const clusterCount = feature[CLUSTER_FEATURE_COUNT] || 1;
            this._count += clusterCount;
            this._sum += clusterCount * propertyValue;
        }
    }

    _resetViewportAgg () {
        this._sum = 0;
        this._count = 0;
    }
}
