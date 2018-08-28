import BaseExpression from '../../base';
import { checkMaxArguments } from '../../utils';
import { CLUSTER_FEATURE_COUNT } from '../../../../../client/windshaft';

export default class ClusterCount extends BaseExpression {
    constructor () {
        checkMaxArguments(arguments, 0, 'clusterCount');
        super({});
        this.type = 'number';
        this._expressionName = 'clusterCount';
        this._hasClusterFeatureCount = false;
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
            inline: `${this._hasClusterFeatureCount ? getGLSLforProperty(CLUSTER_FEATURE_COUNT) : '1.'}`
        };
    }
}
