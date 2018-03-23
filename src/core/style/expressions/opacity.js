import Expression from './expression';
import { float } from '../functions';
import { checkLooseType, checkType } from './utils';

/**
 *
 * Override the input color opacity
 *
 * @param {number} x - A number to be warped in a numeric expression
 * @return {carto.style.expressions.Expression} numeric expression
 *
 * @example <caption>Creating a number expression.</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *  width: s.number(15);  // Elements will have width 15
 * });
 *
 * @memberof carto.style.expressions
 * @name number
 * @function
 * @api
 */
export default class Opacity extends Expression {
    /**
     * @description Override the input color opacity
     * @param {*} color input color
     * @param {*} opacity new opacity
     */
    constructor(a, b) {
        if (Number.isFinite(b)) {
            b = float(b);
        }
        checkType('opacity', 'color', 0, 'color', a);
        checkLooseType('opacity', 'opacity', 1, 'float', b);
        super({ a: a, b: b });
        this.type = 'color';
    }
    _compile(meta) {
        super._compile(meta);
        checkType('opacity', 'opacity', 1, 'float', this.b);
        this.inlineMaker = inlines => `vec4((${inlines.a}).rgb, ${inlines.b})`;
    }
    // TODO eval
}
