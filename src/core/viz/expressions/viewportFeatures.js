import BaseExpression from './base';
import * as schema from '../../../core/schema';
import Property from './basic/property';

export class ViewportFeatures extends BaseExpression {
    constructor(...properties) {
        if (properties.some(p => !(p instanceof Property))) {
            throw new Error('viewportFeatures arguments can only be properties');
        }

        super({});
        this.expr = [];
        this.type = 'featureList';
        this._isViewport = true;

        this._requiredProperties = properties;
    }

    _compile(metadata) {
        throw new Error('viewportFeatures cannot be used in visualizations');
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
