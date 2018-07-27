import BaseExpression from '../../base';
import * as schema from '../../../../schema';
import { number } from '../../../expressions';
import { implicitCast } from '../../utils';

export default class GlobalAggregation extends BaseExpression {
    /**
     * @param {*} property
     * @param {*} name
     */
    constructor ({ property, name, type }) {
        super({ _value: number(0) });
        this.property = implicitCast(property);
        this._name = name;
        this.type = type;
    }

    isFeatureDependent () {
        return false;
    }

    get value () {
        return this._value.expr;
    }

    eval () {
        return this._value.expr;
    }

    _compile (metadata) {
        super._compile(metadata);
        // TODO improve type check
        this.property._compile(metadata);

        super.inlineMaker = inline => inline._value;
        if (metadata.properties[this.property.name][this._name] === undefined) {
            throw new Error(`Metadata ${this._name} for property ${this.property.name} is not defined`);
        }
        this._value.expr = metadata.properties[this.property.name][this._name];
    }

    _getMinimumNeededSchema () {
        return this.property._getMinimumNeededSchema();
    }

    _getColumnName () {
        if (this.property.aggName) {
            return schema.column.aggColumn(this.property.name, this.property.aggName);
        }
        return this.property.name;
    }
}
