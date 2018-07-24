import BaseExpression from '../../base';
import { implicitCast } from '../../utils';

export default class ViewportAggregation extends BaseExpression {
    /**
     * @param {*} property
     */
    constructor ({ property }) {
        super({ property: implicitCast(property) });
        this._isViewport = true;
    }

    isFeatureDependent () {
        return false;
    }

    _compile (metadata) {
        super._compile(metadata);
        // TODO improve type check
        this.property._compile(metadata);
        this.type = 'number';
        super.inlineMaker = inline => inline._impostor;
    }

    _getMinimumNeededSchema () {
        return this.property._getMinimumNeededSchema();
    }

    _preDraw (...args) {
        this._impostor.expr = this.eval();
        super._preDraw(...args);
    }
}
