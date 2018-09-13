import BaseExpression from '../../base';
import { number } from '../../../expressions';
import { implicitCast } from '../../utils';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../../../errors/carto-validation-error';

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
        super.inlineMaker = inline => inline._value;
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

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        this.property._bindMetadata(metadata);
        // TODO improve type check
        if (metadata.properties[this.property.name][this._name] === undefined) {
            throw new CartoValidationError(`${cvt.MISSING_REQUIRED} Metadata ${this._name} for property ${this.property.name} is not defined`);
        }
        this._value.expr = metadata.properties[this.property.name][this._name];
    }

    _getMinimumNeededSchema () {
        return {
            [this.property.name]: []
        };
    }
}
