import BaseExpression from '../../base';
import PropertyExpression from '../../basic/property';
import { checkType, checkInstance, checkExpression } from '../../utils';
import * as schema from '../../../../schema';

// TODO: generalize with base clusterDimension
export default class clusterTime extends BaseExpression {
    constructor ({ property, expressionName, dimension, type, mode }) {
        checkExpression(expressionName, 'property', 0, property);
        super({ property });
        this._dimension = dimension;
        this._dimension.propertyName = schema.column.dimColumn(this.property.name, this._dimension.group.units);
        this._expressionName = expressionName;
        this.type = type;
        this._mode = mode;

    }

    get name () {
        return this.property.name;
    }

    get propertyName () {
        let name = this._dimension.propertyName;
        if (this._mode) {
            name = name + '_' + this._mode
        }
        return name;
    }

    eval (feature) {
        return feature[this.propertyName];
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkInstance(this._expressionName, 'property', 0, PropertyExpression, this.property);
        checkType(this._expressionName, 'property', 0, 'date', this.property);
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
                dimension: this._dimension,
                mode: this._mode
            }]
        };
    }
}
