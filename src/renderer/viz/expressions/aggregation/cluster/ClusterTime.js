import BaseExpression from '../../base';
import PropertyExpression from '../../basic/property';
import { checkType, checkInstance, checkExpression } from '../../utils';
import * as schema from '../../../../schema';

// TODO: generalize with base clusterDimension
export default class clusterTime extends BaseExpression {
    constructor ({ property, expressionName, grouping, dimType }) {
        checkExpression(expressionName, 'property', 0, property);
        super({ property });
        this._grouping = grouping;
        this._expressionName = expressionName;
        this._baseType = dimType;
        this.type = 'number';
    }

    get name () {
        return this.property.name;
    }

    get propertyName () {
        return schema.column.dimColumn(this.property.name, this._grouping.group_by);
    }

    eval (feature) {
        return feature[schema.column.dimColumn(this.property.name, this._grouping.group_by)];
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
            inline: `${getGLSLforProperty(this.propertyName)}`
        };
    }

    _postShaderCompile () {}

    _getMinimumNeededSchema () {
        return {
            [this.property.name]: [{
                type: 'dimension',
                grouping: this._grouping
            }]
        };
    }
}
