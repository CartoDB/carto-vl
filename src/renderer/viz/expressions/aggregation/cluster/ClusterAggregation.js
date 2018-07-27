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

    // Override super methods, we don't want to let the property use the raw column, we must use the agg suffixed one
    _compile (metadata) {
        super._compile(metadata);
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
