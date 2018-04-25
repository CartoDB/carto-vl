import BaseExpression from './base';
import { checkLooseType, checkType, implicitCast } from './utils';

/**
 * Placement.
 *
 * @param {number} x - first numeric expression
 * @param {number} y - second numeric expression
 * @return {carto.expressions.Base} Numeric expression
 *
 * @example <caption>Creating a number expression.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.number(15);  // Equivalent to `width: 15`
 * });
 *
 * @memberof carto.expressions
 * @name vec2
 * @function
 * @api
 */
export default class Placement extends BaseExpression {
    constructor(x, y) {
        x = implicitCast(x);
        y = implicitCast(y);
        checkLooseType('placement', 'x', 0, 'number', x);
        checkLooseType('placement', 'y', 1, 'number', y);
        super({ x, y });
        this.inlineMaker = inline => `vec2(${inline.x}, ${inline.y})`;
        this.type = 'placement';
    }
    eval(v) {
        return [this.x.eval(v), this.y.eval(v)];
    }
    _compile(meta) {
        super._compile(meta);
        checkType('placement', 'x', 0, 'number', this.x);
        checkType('placement', 'y', 1, 'number', this.y);
    }
}
