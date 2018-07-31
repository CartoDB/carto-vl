import BaseExpression from '../base';
import { number } from '../../expressions';
import { checkLooseType, checkType } from '../utils';

/**
 * Override the input color opacity.
 *
 * @param {Color} color - Color expression to apply the opacity
 * @param {Number} alpha - Number expression with the alpha (transparency) value
 * @return {Color}
 *
 * @example <caption>Display blue points with 50% opacity.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.opacity(s.rgb(0,0,255), 0.5)  // Equivalent to `s.rgba(0,0,255,0.5)`
 * });
 *
 * @example <caption>Display blue points with 50% opacity. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: opacity(rgb(0,0,255), 0.5) // Equivalent to `rgba(0,0,255,0.5)`
 * `);
 *
 * @memberof carto.expressions
 * @name opacity
 * @function
 * @api
 */
export default class Opacity extends BaseExpression {
    /**
     * @description Override the input color opacity
     * @param {*} color input color
     * @param {*} alpha new opacity
     */
    constructor (color, alpha) {
        if (Number.isFinite(alpha)) {
            alpha = number(alpha);
        }
        checkLooseType('opacity', 'color', 0, 'color', color);
        checkLooseType('opacity', 'alpha', 1, 'number', alpha);
        super({ color, alpha });
        this.type = 'color';
        this.inlineMaker = inline => `vec4((${inline.color}).rgb, ${inline.alpha})`;
    }
    get value () {
        return this.eval();
    }
    eval (f) {
        const color = this.color.eval(f);
        const alpha = this.alpha.eval(f);
        color.a = alpha;
        return color;
    }
    _bindMetadata (meta) {
        super._bindMetadata(meta);
        checkType('opacity', 'color', 0, 'color', this.color);
        checkType('opacity', 'alpha', 1, 'number', this.alpha);
    }
}
