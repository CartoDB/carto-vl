import BaseExpression from './base';
import { implicitCast, checkExpression, checkLooseType, checkType, clamp } from './utils';

/**
 * Evaluates to a hsl color.
 *
 * @param {carto.expressions.number|number} h - The hue of the color
 * @param {carto.expressions.number|number} s - The saturation of the color
 * @param {carto.expressions.number|number} l - The lightness of the color
 * @return {carto.expressions.Base}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.hsl(0.67, 1.0, 0.5)
 * });
 *
 * @memberof carto.expressions
 * @name hsl
 * @function
 * @api
 */
export const HSL = genHSL('hsl', false);

/**
 * Evaluates to a hsla color.
 *
 * @param {carto.expressions.number|number} h - The hue of the color
 * @param {carto.expressions.number|number} s - The saturation of the color
 * @param {carto.expressions.number|number} l - The lightness of the color
 * @param {carto.expressions.number|number} a - The alpha value of the color
 * @return {carto.expressions.Base}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.hsla(0.67, 1.0, 0.5, 1.0)
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name hsla
 * @api
 */
export const HSLA = genHSL('hsla', true);

function genHSL(name, alpha) {
    return class HSLA extends BaseExpression {
        constructor(h, s, l, a) {
            [h, s, l, a] = [h, s, l, a].map(implicitCast);

            const children = { h, s, l };
            if (alpha) {
                checkLooseType(name, 'a', 3, 'number', a);
                children.a = a;
            }

            hslCheckType('h', 0, h);
            hslCheckType('s', 1, s);
            hslCheckType('l', 2, l);

            super(children);
            this.type = 'color';
        }
        eval(f) {
            const normalize = (value, hue = false) => {
                if (value.type == 'category') {
                    return value.eval(f) / (hue ? value.numCategories + 1 : value.numCategories);
                }
                return value.eval(f);
            };
            const h = clamp(normalize(this.h, true), 0, 1);
            const s = clamp(normalize(this.s), 0, 1);
            const l = clamp(normalize(this.l), 0, 1);

            const hslToRgb = (h, s, l) => {
                const c = {
                    r: Math.abs(h * 6 - 3) - 1,
                    g: 2 - Math.abs(h * 6 - 2),
                    b: 2 - Math.abs(h * 6 - 4),
                    a: alpha ? this.a.eval(f) : 1,
                };

                const C = (1 - Math.abs(2 * l - 1)) * s;

                c.r = clamp(c.r, 0, 1);
                c.g = clamp(c.g, 0, 1);
                c.b = clamp(c.b, 0, 1);

                c.r = ((c.r - 0.5) * C + l) * 255;
                c.g = ((c.g - 0.5) * C + l) * 255;
                c.b = ((c.b - 0.5) * C + l) * 255;

                return c;
            };

            return hslToRgb(h, s, l);
        }
        _compile(meta) {
            super._compile(meta);
            hslCheckType('h', 0, this.h);
            hslCheckType('s', 1, this.s);
            hslCheckType('l', 2, this.l);
            if (alpha) {
                checkType('hsla', 'a', 3, 'number', this.a);
            }
            const normalize = (value, hue = false) => {
                if (value.type == 'category') {
                    return `/${hue ? value.numCategories + 1 : value.numCategories}.`;
                }
                return '';
            };
            super._setGenericGLSL(inline =>
                `vec4(HSLtoRGB(vec3(
                    ${inline.h}${normalize(this.h, true)},
                    clamp(${inline.s}${normalize(this.s)}, 0., 1.),
                    clamp(${inline.l}${normalize(this.l)}, 0., 1.)
                )), ${alpha ? `clamp(${inline.a}, 0., 1.)` : '1.'})`
                , `
    #ifndef HSL2RGB
    #define HSL2RGB
    vec3 HSLtoRGB(vec3 HSL) {
      float R = abs(HSL.x * 6. - 3.) - 1.;
      float G = 2. - abs(HSL.x * 6. - 2.);
      float B = 2. - abs(HSL.x * 6. - 4.);
      float C = (1. - abs(2. * HSL.z - 1.)) * HSL.y;
      vec3 RGB = clamp(vec3(R,G,B), 0., 1.);
      return (RGB - 0.5) * C + HSL.z;
    }
    #endif
    `);
        }
    };

    function hslCheckType(parameterName, parameterIndex, parameter) {
        checkExpression(name, parameterName, parameterIndex, parameter);
        if (parameter.type != 'number' && parameter.type != 'category' && parameter.type !== undefined) {
            throw new Error(`${name}(): invalid parameter\n\t${parameterName} type was: '${parameter.type}'`);
        }
    }
}
