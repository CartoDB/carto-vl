import BaseExpression from './base';
import { implicitCast, checkLooseType, checkType } from './utils';

/**
 * Evaluates to a rgb color.
 *
 * @param {Number|Property|number} r - The amount of red in the color
 * @param {Number|Property|number} g - The amount of green in the color
 * @param {Number|Property|number} b - The amount of blue in the color
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
 * @param {Number|Property|number} r - The amount of red in the color
 * @param {Number|Property|number} g - The amount of green in the color
 * @param {Number|Property|number} b - The amount of blue in the color
 * @param {Number|Property|number} a - The alpha value of the color
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

//TODO refactor to uniformcolor, write color (plain, literal)

function genRGB(name, alpha) {
    return class RGBA extends BaseExpression {
        constructor(r, g, b, a) {
            [r, g, b, a] = [r, g, b, a].map(implicitCast);
            checkLooseType(name, 'r', 0, 'number', r);
            checkLooseType(name, 'g', 1, 'number', g);
            checkLooseType(name, 'b', 2, 'number', b);

            const children = { r, g, b };
            if (alpha) {
                checkLooseType(name, 'a', 3, 'number', a);
                children.a = a;
            }
            super(children);
            this.type = 'color';
        }
        eval(f) {
            return {
                r: this.r.eval(f),
                g: this.g.eval(f),
                b: this.b.eval(f),
                a: alpha ? this.a.eval(f) : 1,
            };
        }
        _compile(meta) {
            super._compile(meta);
            checkType(name, 'r', 0, 'number', this.r);
            checkType(name, 'g', 1, 'number', this.g);
            checkType(name, 'b', 2, 'number', this.b);
            if (alpha) {
                checkType('rgba', 'a', 3, 'number', this.a);
            }
            this.inlineMaker = inline => `vec4(${inline.r}/255., ${inline.g}/255., ${inline.b}/255., ${alpha ? inline.a : '1.'})`;
        }
    };
}
