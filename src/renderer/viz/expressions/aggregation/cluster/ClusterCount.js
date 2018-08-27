import BaseExpression from '../../base';
import { number } from '../../../expressions';

// import PropertyExpression from '../../basic/property';
// import { checkType, checkInstance } from '../../utils';
import * as schema from '../../../../schema';

export default class ClusterCount extends BaseExpression {
    constructor ({ property, expressionName, aggName, aggType }) {
        // checkInstance(expressionName, 'property', 0, PropertyExpression, property);
        // super({ property });
        super({ _value: number(1) }); // <<< ?? clusterCount doesn't have an associated property, default to 1 ??

        // eg. expressionName: 'clusterMax', aggName: 'max', aggType: 'number'
        this._aggName = 'clusterCount'; // <<< ?? vs just 'count'
        this._expressionName = 'clusterCount';
        this.type = 'number';
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
        // checkType(this._expressionName, 'property', 0, this.type, this.property);
    }

    _resolveAliases () { }

    _applyToShaderSource (getGLSLforProperty) {
        return {
            preface: '',
            inline: `${getGLSLforProperty(schema.column.aggColumn(this.property.name, this._aggName))}`
        };
    }

    _postShaderCompile () { }

    _getMinimumNeededSchema () {
        return {
            [this.property.name]: [{
                type: 'aggregated',
                op: this._aggName
            }]
        };
    }
}
