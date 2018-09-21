import BaseExpression from '../../base';
import PropertyExpression from '../../basic/property';
import { checkType, checkInstance, checkExpression } from '../../utils';
import * as schema from '../../../../schema';

// TODO: generalize with base clusterDimension
export default class clusterTime extends BaseExpression {
    constructor ({ property, expressionName, groupBy, dimType }) {
        checkExpression(expressionName, 'property', 0, property);
        super({ property });
        this._groupBy = groupBy;
        this._expressionName = expressionName;
        this._baseType = dimType;
        this.type = 'number';
    }

    get name () {
        return schema.column.dimColumn(this.property.name, this._groupBy);
    }

    eval (feature) {
        return feature[schema.column.dimColumn(this.property.name, this._groupBy)];
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkInstance(this._expressionName, 'property', 0, PropertyExpression, this.property);
        checkType(this._expressionName, 'property', 0, this._baseType, this.property);
    }

    _resolveAliases () {}

    _applyToShaderSource (getGLSLforProperty) {
        return {
            preface: '',
            inline: `${getGLSLforProperty(schema.column.dimColumn(this.property.name, this._groupBy))}`
        };
    }

    _postShaderCompile () {}

    _getMinimumNeededSchema () {
        return {
            [this.property.name]: [{
                type: 'dimension',
                op: this._groupBy
            }]
        };
    }
}
