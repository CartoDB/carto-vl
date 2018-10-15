import BaseExpression from '../../base';
import { implicitCast } from '../../utils';
import { number } from '../../../expressions';

export default class ViewportAggregation extends BaseExpression {
    /**
     * @param {*} property
     */
    constructor ({ property }) {
        property = implicitCast(property);
        super({ property, _impostor: number(0) });
        this._isViewport = true;
        this.type = 'number';
        this.inlineMaker = inline => inline._impostor;
    }

    _bindMetadata (metadata) {
        // TODO improve type check
        super._bindMetadata(metadata);
    }

    _getMinimumNeededSchema () {
        return this.property._getMinimumNeededSchema();
    }

    _preDraw (...args) {
        this._impostor.expr = this.eval();
        super._preDraw(...args);
    }
}
