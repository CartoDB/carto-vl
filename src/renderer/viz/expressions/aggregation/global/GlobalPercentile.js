import BaseExpression from '../../base';
import * as schema from '../../../../schema';
import { number } from '../../../expressions';

export default class GlobalPercentile extends BaseExpression {
    constructor (property, percentile) {
        if (!Number.isFinite(percentile)) {
            throw new Error('Percentile must be a fixed literal number');
        }
        super({ _value: number(0) });
        // TODO improve type check
        this.property = property;
        this.percentile = percentile;
    }

    isFeatureDependent () {
        return false;
    }

    get value () {
        return this._value.expr;
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        this.property._bindMetadata(metadata);
        this.type = 'number';
        super.inlineMaker = inline => inline._value;
        const copy = metadata.sample.map(s => s[this.property.name]);
        copy.sort((x, y) => x - y);
        const p = this.percentile / 100;
        this._value.expr = copy[Math.floor(p * copy.length)];
    }

    _getMinimumNeededSchema () {
        return this.property._getMinimumNeededSchema();
    }

    _getColumnName () {
        if (this.property.aggName) {
            // Property has aggregation
            return schema.column.aggColumn(this.property.name, this.property.aggName);
        }
        return this.property.name;
    }
}
