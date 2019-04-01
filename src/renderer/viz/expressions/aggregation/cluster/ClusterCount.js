import BaseExpression from '../../base';
import { checkMaxArguments } from '../../utils';
import { CLUSTER_FEATURE_COUNT } from '../../../../../constants/metadata';

/**
 * Count of features per cluster.
 *
 * The `clusterCount` expression has no input parameters and if data is not aggregated, it always returns 1.
 * It is not possible to use it as an input in global aggregations such as `globalMin` or `globalQuantiles`.
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
 * @example <caption>Use cluster count with viewportQuantiles in a ramp for width and color.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.viewportQuantiles(s.clusterCount(), 5), [1, 20])
 *   width: s.ramp(s.viewportQuantiles(s.clusterCount(), 5), s.palettes.PINKYL))
 * });
 * // Note: this is not possible with globalQuantiles
 *
 * @example <caption>Use cluster count with viewportQuantiles in a ramp for width and color. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: ramp(viewportQuantiles(clusterCount(), 5), [1, 20])
 *   color: ramp(viewportQuantiles(clusterCount(), 5), Pinkyl)
 * `);
 * // Note: this is not possible with globalQuantiles
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

    get value () {
        return this.getLegendData().data;
    }

    eval (feature) {
        return Number(feature[CLUSTER_FEATURE_COUNT]) || 1;
    }

    getLegendData () {
        return {
            data: this._hasClusterFeatureCount
                ? this._metadata.properties[CLUSTER_FEATURE_COUNT]
                : []
        };
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        this._metadata = metadata;
        this._hasClusterFeatureCount = metadata.properties[CLUSTER_FEATURE_COUNT] !== undefined;
    }

    _applyToShaderSource (getGLSLforProperty) {
        return {
            preface: '',
            inline: this._hasClusterFeatureCount ? getGLSLforProperty(CLUSTER_FEATURE_COUNT) : '1.'
        };
    }
}
