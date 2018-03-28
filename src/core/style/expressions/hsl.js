import Expression from './expression';
import { implicitCast, checkExpression, checkLooseType, checkType } from './utils';

/**
 *
 * Evaluates to a hsla color.
 *
 * @param {carto.style.expressions.number|number} h - The hue of the color
 * @param {carto.style.expressions.number|number} s - The saturation of the color
 * @param {carto.style.expressions.number|number} l - The lightness of the color
 * @param {carto.style.expressions.number|number} a - The alpha value of the color
 * @return {carto.style.expressions.hsla}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *   color: s.hsla(0.67, 1.0, 0.5, 1.0)
 * });
 *
 * @memberof carto.style.expressions
 * @name hsla
 * @function
 * @api
 */
export const HSL = genHSL('hsl', false);
export const HSLA = genHSL('hsla', true);

function genHSL(name, alpha) {
    return class HSLA extends Expression {
        constructor(h, s, l, a) {
            [h, s, l, a] = [h, s, l, a].map(implicitCast);

            const children = { h, s, l };
            if (alpha) {
                checkLooseType(name, 'a', 3, 'float', a);
                children.a = a;
            }

            hslCheckType('h', 0, h);
            hslCheckType('s', 1, s);
            hslCheckType('l', 2, l);

            super(children);
            this.type = 'color';
        }
        _compile(meta) {
            super._compile(meta);
            hslCheckType('h', 0, this.h);
            hslCheckType('s', 1, this.s);
            hslCheckType('l', 2, this.l);
            if (alpha) {
                checkType('hsla', 'a', 3, 'float', this.a);
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
      float R = clamp(abs(HSL.x * 6. - 3.) - 1., 0., 1.);
      float G = clamp(2. - abs(HSL.x * 6. - 2.), 0., 1.);
      float B = clamp(2. - abs(HSL.x * 6. - 4.), 0., 1.);
      float C = (1. - abs(2. * HSL.z - 1.)) * HSL.y;
      return (vec3(R,G,B) - 0.5) * C + HSL.z;
    }
    #endif
    `);
        }
        // TODO eval
    };

    function hslCheckType(parameterName, parameterIndex, parameter) {
        checkExpression(name, parameterName, parameterIndex, parameter);
        if (parameter.type != 'float' && parameter.type != 'category' && parameter.type !== undefined) {
            throw new Error(`${name}(): invalid parameter\n\t${parameterName} type was: '${parameter.type}'`);
        }
    }
}
