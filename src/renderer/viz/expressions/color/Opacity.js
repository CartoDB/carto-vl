import BaseExpression from '../base';
import { checkType, checkMaxArguments, checkExpression, implicitCast } from '../utils';

/**
 * Override the input opacity.
 *
 * @param {Color | Image} color - Color or image expression to apply the opacity
 * @param {Number} alpha - Number expression with the alpha (transparency) value
 * @return {Color | Image}
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
    constructor (input, alpha) {
        checkMaxArguments(arguments, 2, 'opacity');

        input = implicitCast(input);
        alpha = implicitCast(alpha);

        checkExpression('opacity', 'input', 0, input);
        checkExpression('opacity', 'alpha', 1, alpha);
        super({ input, alpha });
        this.inlineMaker = inline => `vec4((${inline.input}).rgb, ${inline.alpha})`;
    }
    get value () {
        return this.eval();
    }
    eval (f) {
        const input = this.input.eval(f);
        const alpha = this.alpha.eval(f);
        input.a = alpha;
        return input;
    }
    _bindMetadata (meta) {
        super._bindMetadata(meta);
        checkType('opacity', 'input', 0, ['color', 'image'], this.input);
        checkType('opacity', 'alpha', 1, 'number', this.alpha);
        this.type = this.input.type;
    }
}
