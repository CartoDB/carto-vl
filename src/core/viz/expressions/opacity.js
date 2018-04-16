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
 * const style = new carto.Viz({
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
     * @param {*} alpha new opacity
     */
    constructor(color, alpha) {
        if (Number.isFinite(alpha)) {
            alpha = float(alpha);
        }
        checkType('opacity', 'color', 0, 'color', color);
        checkLooseType('opacity', 'alpha', 1, 'float', alpha);
        super({ color, alpha });
        this.type = 'color';
    }
    _compile(meta) {
        super._compile(meta);
        checkType('opacity', 'alpha', 1, 'float', this.alpha);
        this.inlineMaker = inline => `vec4((${inline.color}).rgb, ${inline.alpha})`;
    }
    eval(f) {
        const color = this.color.eval(f);
        const alpha = this.alpha.eval(f);
        color.a = alpha;
        return color;
    }
}
