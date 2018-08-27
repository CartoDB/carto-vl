import BaseExpression from '../../base';
import { checkMaxArguments } from '../../utils';
import { CLUSTER_FEATURE_COUNT } from '../../../../../client/windshaft';

export default class ClusterCount extends BaseExpression {
    constructor () {
        checkMaxArguments(arguments, 0, 'clusterCount');
        super({});
        this._expressionName = 'clusterCount';
        this.type = 'number';
    }

    eval (feature) {
        return Number(feature[CLUSTER_FEATURE_COUNT]) || 1;
    }

    _resolveAliases () { }

    _applyToShaderSource (getGLSLforProperty) {
        return {
            preface: '',
            inline: `${getGLSLforProperty(CLUSTER_FEATURE_COUNT)}`
        };
    }
}
