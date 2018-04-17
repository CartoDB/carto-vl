import BaseExpression from './base';
import { checkNumber } from './utils';

/**
 * Wraps a constant number. Implies a GPU optimization vs {@link carto.expressions.number|number expression}.
 *
 * @param {number} x - A number to be warped in a constant numeric expression
 * @return {carto.expressions.Base} Numeric expression
 *
 * @example <caption>Creating a constant number expression.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.constant(15);
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name constant
 * @api
 */
export default class Constant extends BaseExpression {
    constructor(x) {
        checkNumber('constant', 'x', 0, x);
        super({});
        this.expr = x;
        this.type = 'number';
        this.inlineMaker = () => `(${x.toFixed(20)})`;
    }
    eval() {
        return this.expr;
    }
}
