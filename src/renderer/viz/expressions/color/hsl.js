
import BaseExpression from '../base';
import { implicitCast, checkExpression, checkType, checkMaxArguments, clamp } from '../utils';
import CartoValidationError, { CartoValidationErrorTypes } from '../../../../errors/carto-validation-error';

/**
 * Evaluates to a hsl color.
 *
 * @param {Number} h - hue of the color in the [0, 1] range
 * @param {Number} s - saturation of the color in the [0, 1] range
 * @param {Number} l - lightness of the color in the [0, 1] range
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.hsl(0.67, 1.0, 0.5)
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: hsl(0.67, 1.0, 0.5)
 * `);
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
 * @param {Number} h - hue of the color in the [0, 1] range
 * @param {Number} s - saturation of the color in the [0, 1] range
 * @param {Number} l - lightness of the color in the [0, 1] range
 * @param {Number} a - alpha value of the color in the [0, 1] range
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.hsla(0.67, 1.0, 0.5, 1.0)
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: hsla(0.67, 1.0, 0.5, 1.0)
 * `);
 *
 * @memberof carto.expressions
 * @function
 * @name hsla
 * @api
 */
export const HSLA = genHSL('hsla', true);

function genHSL (name, alpha = null) {
    return class HSLA extends BaseExpression {
        constructor (h, s, l, a) {
            checkMaxArguments(arguments, 4, 'hsla');

            [h, s, l, a] = [h, s, l, a].map(implicitCast);

            const children = { h, s, l };

            if (alpha) {
                checkExpression(name, 'a', 3, a);
                children.a = a;
            }

            checkExpression(name, 'h', 0, h);
            checkExpression(name, 's', 1, s);
            checkExpression(name, 'l', 2, l);

            super(children);
            this._alpha = alpha;
            this.type = 'color';
        }

        get value () {
            return this.eval(null);
        }

        eval (feature) {
            const h = clamp(normalize(this.h, feature, true), 0, 1);
            const s = clamp(normalize(this.s, feature), 0, 1);
            const l = clamp(normalize(this.l, feature), 0, 1);
            const a = this.a;
            const alpha = this._alpha;

            return hslToRgb(h, s, l, a, alpha, feature);
        }

        getLegendData () {
            const name = 'color';
            const value = this.value;
            const key = 'color';
            const data = [{ key, value }];

            return { name, data };
        }
        _bindMetadata (meta) {
            super._bindMetadata(meta);
            hslCheckType('h', 0, this.h);
            hslCheckType('s', 1, this.s);
            hslCheckType('l', 2, this.l);

            if (this._alpha) {
                checkType('hsla', 'a', 3, 'number', this.a);
            }

            super._setGenericGLSL(
                inline => `vec4(HSLtoRGB(vec3(
                    ${inline.h}${normalizeGLSL(this.h, true)},
                    clamp(${inline.s}${normalizeGLSL(this.s)}, 0., 1.),
                    clamp(${inline.l}${normalizeGLSL(this.l)}, 0., 1.)
                )), ${this._alpha ? `clamp(${inline.a}, 0., 1.)` : '1.'})`,
                `
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
                `
            );
        }
    };

    function hslCheckType (parameterName, parameterIndex, parameter) {
        checkExpression(name, parameterName, parameterIndex, parameter);
        if (parameter.type !== 'number' && parameter.type !== 'category' && parameter.type !== undefined) {
            throw new CartoValidationError(
                `${name}(): invalid parameter\n\t${parameterName} type was: '${parameter.type}'`,
                CartoValidationErrorTypes.INCORRECT_TYPE
            );
        }
    }

    function hslToRgb (h, s, l, a, alpha, feature) {
        const aValue = alpha ? (feature ? a.eval(feature) : a.value) : 1;

        const c = {
            r: Math.abs(h * 6 - 3) - 1,
            g: 2 - Math.abs(h * 6 - 2),
            b: 2 - Math.abs(h * 6 - 4),
            a: aValue
        };

        const C = (1 - Math.abs(2 * l - 1)) * s;

        c.r = clamp(c.r, 0, 1);
        c.g = clamp(c.g, 0, 1);
        c.b = clamp(c.b, 0, 1);

        c.r = ((c.r - 0.5) * C + l) * 255;
        c.g = ((c.g - 0.5) * C + l) * 255;
        c.b = ((c.b - 0.5) * C + l) * 255;

        return c;
    }

    function normalize (input, feature, hue = false) {
        const data = feature !== null
            ? input.eval(feature)
            : input.value;

        if (input.type === 'category') {
            return data / (hue ? input.numCategories + 1 : input.numCategories);
        }

        return data;
    }

    function normalizeGLSL (input, hue = false) {
        if (input.type === 'category') {
            return `/${hue ? input.numCategories + 1 : input.numCategories}.`;
        }

        return '';
    }
}
