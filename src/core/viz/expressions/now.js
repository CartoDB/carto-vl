import BaseExpression from './base';
import { number } from '../functions';

/**
 * Get the current timestamp.
 *
 * @return {carto.expressions.Base}
 *
 * @example
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.mod(s.now(), 10);
 * });
 *
 * @memberof carto.expressions
 * @name now
 * @function
 * @api
 */
export default class Now extends BaseExpression {
    constructor() {
        super({ now: number(0) });
    }
    eval() {
        return this.now.expr;
    }
    isAnimated() {
        return true;
    }
    _compile(metadata) {
        super._compile(metadata);
        this.type = 'number';
        super.inlineMaker = inline => inline.now;
    }
    _preDraw(...args) {
        this.now._preDraw(...args);
    }
    _setTimestamp(timestamp){
        this.now.expr = timestamp;
    }
}
