import Expression from './expression';
import { implicitCast, checkLooseType, checkType } from './utils';

//TODO refactor to uniformcolor, write color (plain, literal)

/**
 *
 * Evaluates to a rgba color.
 *
 * @param {carto.style.expressions.number|number} r - The amount of red in the color
 * @param {carto.style.expressions.number|number} g - The amount of green in the color
 * @param {carto.style.expressions.number|number} b - The amount of blue in the color
 * @param {carto.style.expressions.number|number} a - The alpha value of the color
 * @return {carto.style.expressions.rgba}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.style.expressions;
 * const $type = s.property('type');
 * const style = new carto.Style({
 *  color: s.rgba(0, 1, 0, 1);
 * });
 *
 * @memberof carto.style.expressions
 * @name rgba
 * @function
 * @api
 */
export const RGBA = genRGB('rgba', true);
export const RGB = genRGB('rgb', false);

function genRGB(name, alpha) {
    return class RGBA extends Expression {
        constructor(r, g, b, a) {
            [r, g, b, a] = [r, g, b, a].map(implicitCast);
            checkLooseType(name, 'r', 0, 'float', r);
            checkLooseType(name, 'g', 1, 'float', g);
            checkLooseType(name, 'b', 2, 'float', b);

            const children = { r, g, b };
            if (alpha) {
                checkLooseType(name, 'a', 3, 'float', a);
                children.a = a;
            }
            super(children);
            this.type = 'color';
        }
        _compile(meta) {
            super._compile(meta);
            checkType(name, 'r', 0, 'float', this.r);
            checkType(name, 'g', 1, 'float', this.g);
            checkType(name, 'b', 2, 'float', this.b);
            if (alpha) {
                checkType('rgba', 'a', 3, 'float', this.a);
            }
            this.inlineMaker = inline => `vec4(${inline.r}, ${inline.g}, ${inline.b}, ${alpha ? inline.a : '1.'})`;
        }
        // TODO eval
    };
}
