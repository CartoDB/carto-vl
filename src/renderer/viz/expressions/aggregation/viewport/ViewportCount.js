import ViewportAggregation from './ViewportAggregation';
import { number } from '../../../expressions';
import { checkMaxArguments } from '../../utils';
import { CLUSTER_FEATURE_COUNT } from '../../../../schema';

/**
 * Return the feature count of the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @return {Number} feature count in the viewport
 *
 * @example <caption>Assign the feature count in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_count: s.viewportCount()
 *   }
 * });
 *
 * @example <caption>Assign the feature count in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_count: viewportCount()
 * `);
 *
 * @memberof carto.expressions
 * @name viewportCount
 * @function
 * @api
 */
export default class ViewportCount extends ViewportAggregation {
    constructor () {
        checkMaxArguments(arguments, 0, 'viewportCount');
        super({ property: number(0) });
        this._value = 0;
    }

    toString () {
        return `${this.expressionName}()`;
    }

    get value () {
        return this._value;
    }

    eval () {
        return this.value;
    }

    accumViewportAgg (feature) {
        const clusterCount = feature[CLUSTER_FEATURE_COUNT] || 1;
        this._value += clusterCount;
    }

    _resetViewportAgg () {
        this._value = 0;
    }

    _getMinimumNeededSchema () {
        return {};
    }
}
