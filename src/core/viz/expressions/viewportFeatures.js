import BaseExpression from './base';

export class ViewportFeatures extends BaseExpression {
    constructor() {
        super({});
        this.expr = [];
        this.type = 'featureList';
        this._isViewport = true;
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
