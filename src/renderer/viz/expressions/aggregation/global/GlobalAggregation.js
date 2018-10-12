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

    _resolveAliases (aliases) {
        this.property._resolveAliases(aliases);
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        this.property._bindMetadata(metadata);
        const propertyName = this.property.propertyName || this.property.name;

        const stats = metadata.stats(propertyName);
        // TODO improve type check
        if (!stats || stats[this._name] === undefined) {
            throw new CartoValidationError(`${cvt.MISSING_REQUIRED} Metadata ${this._name} for property ${propertyName} is not defined`);
        }
        this._value.expr = stats[this._name]; // TODO: for TimeRange: encode
    }

    _getMinimumNeededSchema () {
        return {
            [this.property.name]: []
        };
    }
}
