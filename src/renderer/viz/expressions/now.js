import BaseExpression from './base';
import { number } from '../expressions';
import { checkMaxArguments } from './utils';

/**
 * Get the current timestamp. This is an advanced form of animation, `animation` expression is preferred.
 *
 * @return {Number}
 *
 * @example <caption>Update width during the time.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.mod(s.now(), 10)
 * });
 *
 * @example <caption>Update width during the time. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: now() % 10
 * `);
 *
 * @memberof carto.expressions
 * @name now
 * @function
 * @api
 */
export default class Now extends BaseExpression {
    constructor () {
        checkMaxArguments(arguments, 0, 'now');

        super({ now: number(0) });
        this.type = 'number';
        super.inlineMaker = inline => inline.now;
    }

    get value () {
        return this.eval();
    }

    eval () {
        return this.now.expr;
    }

    isAnimated () {
        return true;
    }

    isPlaying () {
        return true;
    }

    _setTimestamp (timestamp) {
        this.now.expr = timestamp;
    }
}
