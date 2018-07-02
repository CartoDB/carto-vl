import BaseExpression from './base';
import * as schema from '../../../core/schema';

export class ViewportFeatures extends BaseExpression {
    constructor(...properties) {
        // TODO: check properties type

        super({}); // { properties: properties } ?
        this.expr = [];
        this.type = 'featureList';
        this._isViewport = true;

        this._requiredProperties = properties;
    }

    _getMinimumNeededSchema() {
        return this._requiredProperties.map(p => p._getMinimumNeededSchema()).reduce(schema.union, schema.IDENTITY);
    }

    isFeatureDependent() {
        return false;
    }

    get value() {
        return this.expr;
    }

    eval() {
        return this.expr;
    }

    _resetViewportAgg() {
        this.expr = [];
    }

    accumViewportAgg(feature) {
        this.expr.push(feature);
    }
}
