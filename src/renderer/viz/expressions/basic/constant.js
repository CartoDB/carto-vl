import BaseExpression from '../base';
import { checkNumber, checkMaxArguments } from '../utils';

/**
 * Wraps a constant number. Implies a GPU optimization vs {@link carto.expressions.number|number expression}.
 *
 * @param {number} x - A number to be warped in a constant numeric expression
 * @return {Number} Numeric expression
 *
 * @example <caption>Creating a constant number expression.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.constant(15)
 * });
 *
 * @example <caption>Creating a constant number expression. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: constant(15)
 * `);
 *
 * @memberof carto.expressions
 * @name constant
 * @function
 * @api
 */
export default class Constant extends BaseExpression {
    constructor (x) {
        checkMaxArguments(arguments, 1, 'constant');
        checkNumber('constant', 'x', 0, x);

        super({});
        this.expr = x;
        this.type = 'number';
        this.inlineMaker = () => `(${x.toFixed(20)})`;
    }
    toString () {
        return this.expr;
    }
    get value () {
        return this.eval();
    }
    eval () {
        return this.expr;
    }
}
