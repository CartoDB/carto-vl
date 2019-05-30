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
        const value = this.input.value;
        const alpha = this.alpha.value;
        value.a = alpha;

        return value;
    }

    eval (feature) {
        const input = this.input.eval(feature);
        const alpha = this.alpha.eval(feature);
        input.a = alpha;

        return input;
    }

    getLegendData (options) {
        const legend = this.input.getLegendData(options);
        const alpha = this.alpha.value;

        if (this.input.type === 'color') {
            const data = legend.data.map(({ key, value }) => {
                const { r, g, b } = value;
                const a = alpha;

                return {
                    key,
                    value: { r, g, b, a }
                };
            });

            return { ...legend, data };
        } else {
            const data = legend.data;
            return { ...legend, data, alpha };
        }
    }

    _bindMetadata (meta) {
        super._bindMetadata(meta);
        checkType('opacity', 'input', 0, ['color', 'image'], this.input);
        checkType('opacity', 'alpha', 1, 'number', this.alpha);
        this.type = this.input.type;
    }
}
