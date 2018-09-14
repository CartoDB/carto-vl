import BaseExpression from '../base';
import { implicitCast, checkType, checkMaxArguments, checkExpression } from '../utils';

/**
 * Evaluates to a rgb color.
 *
 * @param {Number} r - The amount of red in the color in the [0, 255] range. Numeric expression.
 * @param {Number} g - The amount of green in the color in the [0, 255] range. Numeric expression.
 * @param {Number} b - The amount of blue in the color in the [0, 255] range. Numeric expression.
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.rgb(0, 0, 255)
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: rgb(0, 0, 255)
 * `);
 *
 * @memberof carto.expressions
 * @name rgb
 * @function
 * @api
 */
export const RGB = genRGB('rgb', false);

/**
 * Evaluates to a rgba color.
 *
 * @param {Number} r - The amount of red in the color in the [0, 255] range. Numeric expression.
 * @param {Number} g - The amount of green in the color in the [0, 255] range. Numeric expression.
 * @param {Number} b - The amount of blue in the color in the [0, 255] range. Numeric expression.
 * @param {Number} a - The alpha value of the color in the [0, 1] range. Numeric expression.
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.rgba(0, 0, 255, 1)
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: rgba(0, 0, 255, 1)
 * `);
 *
 * @memberof carto.expressions
 * @name rgba
 * @function
 * @api
 */
export const RGBA = genRGB('rgba', true);

// TODO refactor to uniformcolor, write color (plain, literal)

function genRGB (name, alpha) {
    return class RGBA extends BaseExpression {
        constructor (r, g, b, a) {
            checkMaxArguments(arguments, 4, 'rgba');

            [r, g, b, a] = [r, g, b, a].map(implicitCast);
            checkExpression(name, 'r', 0, r);
            checkExpression(name, 'g', 1, g);
            checkExpression(name, 'b', 2, b);

            const children = { r, g, b };
            if (alpha) {
                checkExpression(name, 'a', 3, a);
                children.a = a;
            }
            super(children);
            this.type = 'color';
            this.inlineMaker = inline => `vec4(${inline.r}/255., ${inline.g}/255., ${inline.b}/255., ${alpha ? inline.a : '1.'})`;
        }

        get value () {
            return this.eval();
        }

        eval (f) {
            return {
                r: this.r.eval(f),
                g: this.g.eval(f),
                b: this.b.eval(f),
                a: alpha ? this.a.eval(f) : 1
            };
        }

        _bindMetadata (meta) {
            super._bindMetadata(meta);
            checkType(name, 'r', 0, 'number', this.r);
            checkType(name, 'g', 1, 'number', this.g);
            checkType(name, 'b', 2, 'number', this.b);
            if (alpha) {
                checkType('rgba', 'a', 3, 'number', this.a);
            }
        }
    };
}
