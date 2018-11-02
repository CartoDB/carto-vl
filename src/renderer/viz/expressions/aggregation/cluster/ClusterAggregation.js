import BaseExpression from '../../base';
import PropertyExpression from '../../basic/property';
import { checkType, checkInstance, checkExpression } from '../../utils';
import * as schema from '../../../../schema';

export default class ClusterAggregation extends BaseExpression {
    constructor ({ property, expressionName, aggName, aggType }) {
        checkExpression(expressionName, 'property', 0, property);

        super({ property });
        this._aggName = aggName;
        this._expressionName = expressionName;
        this.type = aggType;
    }

    get name () {
        return this.property.name;
    }

    get propertyName () {
        return schema.column.aggColumn(this.property.name, this._aggName);
    }

    get aggName () {
        return this._aggName;
    }

    get numCategories () {
        return this.property.numCategories;
    }
    get categories () {
        return this.property.categories;
    }

    eval (feature) {
        return feature[this.propertyName];
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkInstance(this._expressionName, 'property', 0, PropertyExpression, this.property);
        checkType(this._expressionName, 'property', 0, this.type, this.property);
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
                type: 'aggregated',
                op: this._aggName
            }]
        };
    }
}
