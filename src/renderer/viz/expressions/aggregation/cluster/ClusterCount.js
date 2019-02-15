import BaseExpression from '../../base';
import { checkMaxArguments } from '../../utils';
import { CLUSTER_FEATURE_COUNT } from '../../../../schema';

/**
 * Count of features per cluster.
 *
 * Note: `clusterCount` has no input parameters and if data is not aggregated, it always returns 1
 *
 * @return {Number} Cluster feature count
 *
 * @example <caption>Use cluster count for width.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.clusterCount() / 50
 * });
 *
 * @example <caption>Use cluster count for width. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: clusterCount() / 50
 * `);
 *
 * @memberof carto.expressions
 * @name clusterCount
 * @function
 * @api
 */
export default class ClusterCount extends BaseExpression {
    constructor () {
        checkMaxArguments(arguments, 0, 'clusterCount');
        super({});
        this.type = 'number';
        this._hasClusterFeatureCount = false;
    }

    get propertyName () {
        return CLUSTER_FEATURE_COUNT;
    }

    isFeatureDependent () {
        return true;
    }

    eval (feature) {
        return Number(feature[CLUSTER_FEATURE_COUNT]) || 1;
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        this._hasClusterFeatureCount = metadata.properties[CLUSTER_FEATURE_COUNT] !== undefined;
    }

    _applyToShaderSource (getGLSLforProperty) {
        return {
            preface: '',
            inline: this._hasClusterFeatureCount ? getGLSLforProperty(CLUSTER_FEATURE_COUNT) : '1.'
        };
    }
}
