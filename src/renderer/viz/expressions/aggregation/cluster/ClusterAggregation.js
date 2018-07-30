import BaseExpression from '../../base';
import PropertyExpression from '../../basic/property';
import { checkType, checkInstance } from '../../utils';
import * as schema from '../../../../schema';

export default class ClusterAggregation extends BaseExpression {
    constructor ({ property, expressionName, aggName, aggType }) {
        checkInstance(expressionName, 'property', 0, PropertyExpression, property);
        super({ property });
        this._aggName = aggName;
        this._expressionName = expressionName;
        this.type = aggType;
    }

    get name () {
        return this.property.name;
    }

    get aggName () {
        return this._aggName;
    }

    get numCategories () {
        return this.property.numCategories;
    }

    eval (feature) {
        return feature[schema.column.aggColumn(this.property.name, this._aggName)];
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkType(this._expressionName, 'property', 0, this.type, this.property);
    }

    _resolveAliases () {}

    _applyToShaderSource (getGLSLforProperty) {
        return {
            preface: '',
            inline: `${getGLSLforProperty(schema.column.aggColumn(this.property.name, this._aggName))}`
        };
    }

    _postShaderCompile () {}

    _getMinimumNeededSchema () {
        return {
            columns: [
                schema.column.aggColumn(this.property.name, this._aggName)
            ]
        };
    }
}
