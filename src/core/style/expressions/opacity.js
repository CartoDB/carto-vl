import Expression from './expression';
import { float } from '../functions';

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
        super({ a: a, b: b });
    }
    _compile(meta) {
        super._compile(meta);
        if (!(this.a.type == 'color' && this.b.type == 'float')) {
            throw new Error(`Opacity cannot be performed between '${this.a.type}' and '${this.b.type}'`);
        }
        this.type = 'color';
        this.inlineMaker = inlines => `vec4((${inlines.a}).rgb, ${inlines.b})`;
    }
    // TODO eval
}
