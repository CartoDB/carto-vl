import Expression from './expression';
import { implicitCast, checkExpression, checkLooseType, checkType, clamp } from './utils';

/**
 *
 * Evaluates to a hsva color.
 *
 * @param {carto.style.expressions.number|number} h - The hue of the color
 * @param {carto.style.expressions.number|number} s - The saturation of the color
 * @param {carto.style.expressions.number|number} v - The value (brightness) of the color
 * @param {carto.style.expressions.number|number} a - The alpha value of the color
 * @return {carto.style.expressions.hsva}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *   color: s.hsva(0.67, 1.0, 1.0, 1.0)
 * });
 *
 * @memberof carto.style.expressions
 * @name hsva
 * @function
 * @api
 */
export const HSV = genHSV('hsv', false);
export const HSVA = genHSV('hsva', true);

function genHSV(name, alpha) {
    return class extends Expression {
        constructor(h, s, v, a) {
            h = implicitCast(h);
            s = implicitCast(s);
            v = implicitCast(v);
            const children = { h, s, v };
            if (alpha) {
                a = implicitCast(a);
                checkLooseType(name, 'a', 3, 'float', a);
                children.a = a;
            }

            hsvCheckType('h', 0, h);
            hsvCheckType('s', 1, s);
            hsvCheckType('v', 2, v);

            super(children);
            this.type = 'color';
        }
        _compile(metadata) {
            super._compile(metadata);
            hsvCheckType('h', 0, this.h);
            hsvCheckType('s', 1, this.s);
            hsvCheckType('v', 2, this.v);
            if (alpha) {
                checkType('hsva', 'a', 3, 'float', this.a);
            }
            const normalize = (value, hue = false) => {
                if (value.type == 'category') {
                    return `/${hue ? value.numCategories + 1 : value.numCategories}.`;
                }
                return '';
            };
            super._setGenericGLSL(inline =>
                `vec4(HSVtoRGB(vec3(
                    ${inline.h}${normalize(this.h, true)},
                    clamp(${inline.s}${normalize(this.s)}, 0.,1.),
                    clamp(${inline.v}${normalize(this.v)}, 0.,1.)
                )), ${alpha ? `clamp(${inline.a}, 0.,1.)` : '1.'})`
                , `
    #ifndef HSV2RGB
    #define HSV2RGB
    vec3 HSVtoRGB(vec3 HSV) {
      float R = abs(HSV.x * 6. - 3.) - 1.;
      float G = 2. - abs(HSV.x * 6. - 2.);
      float B = 2. - abs(HSV.x * 6. - 4.);
      vec3 RGB = clamp(vec3(R,G,B), 0., 1.);
      return ((RGB - 1.) * HSV.y + 1.) * HSV.z;
    }
    #endif
    `);
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
            const v = clamp(normalize(this.v), 0, 1);

            const hsvToRgb = (h, s, v) => {
                const c = {
                    r: Math.abs(h * 6 - 3) - 1,
                    g: 2 - Math.abs(h * 6 - 2),
                    b: 2 - Math.abs(h * 6 - 4),
                    a: alpha ? this.a.eval(f) : 1,
                };

                c.r = clamp(c.r, 0, 1);
                c.g = clamp(c.g, 0, 1);
                c.b = clamp(c.b, 0, 1);

                c.r = ((c.r - 1) * s + 1) * v * 255;
                c.g = ((c.g - 1) * s + 1) * v * 255;
                c.b = ((c.b - 1) * s + 1) * v * 255;

                return c;
            };

            return hsvToRgb(h, s, v);
        }
    };

    function hsvCheckType(parameterName, parameterIndex, parameter) {
        checkExpression(name, parameterName, parameterIndex, parameter);
        if (parameter.type != 'float' && parameter.type != 'category' && parameter.type !== undefined) {
            throw new Error(`${name}(): invalid parameter\n\t${parameterName} type was: '${parameter.type}'`);
        }
    }
}
