import BaseExpression from '../../base';
import { number } from '../../../expressions';
import { implicitCast } from '../../utils';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../../../errors/carto-validation-error';

export default class GlobalAggregation extends BaseExpression {
    /**
     * @param {*} property
     * @param {*} name
     */
    constructor ({ property, name, type, baseStats = false }) {
        super({ _value: number(0) });
        this.property = implicitCast(property);
        this._name = name;
        this.type = type;
        this.baseStats = baseStats;
        super.inlineMaker = inline => inline._value;
    }

    toString () {
        return `${this.expressionName}(${this.property.toString()})`;
    }
    isFeatureDependent () {
        return false;
    }

    eval () {
        return this._value.expr;
    }

    _resolveAliases (aliases) {
        if (this.property) {
            this.property._resolveAliases(aliases);
        }
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        this.property._bindMetadata(metadata);
        const propertyName = this.property.propertyName || this.property.name;

        let value;
        if (this.baseStats) {
            // Use base stats (pre-aggregation)
            if (this.baseStats === '_count') {
                // Use count
                value = metadata.featureCount;
            } else {
                // Use some specific column stat
                const stats =  metadata.stats(this.property.name);
                value = stats && stats[this.baseStats];
            }
        } else {
            // Use stats from actual column corresponding to this aggregate function
            const stats = metadata.stats(propertyName);
            value = stats && stats[this._name]
        }

        // TODO improve type check
        if (value === undefined) {
            throw new CartoValidationError(`${cvt.MISSING_REQUIRED} Metadata ${this._name} for property ${propertyName} is not defined`);
        }
        this._value.expr = metadata.codec(propertyName).sourceToExternal(value);
    }

    _getMinimumNeededSchema () {
        return this.property._getMinimumNeededSchema();
    }
}
