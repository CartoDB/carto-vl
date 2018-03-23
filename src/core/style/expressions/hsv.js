import Expression from './expression';
import { implicitCast, checkExpression, checkLooseType, checkType } from './utils';

// TODO docs
/**
* @description Color constructor for Hue Saturation Value (HSV) color space
* @param {*} hue   hue is the color hue, the coordinates goes from 0 to 1 and is cyclic, i.e.: 0.5=1.5=2.5=-0.5
* @param {*} saturation saturation of the color in the [0,1] range
* @param {*} value value (brightness) of the color in the [0,1] range
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
            const normalize = (v, hue = false) => {
                if (v.type == 'category') {
                    return `/${hue ? v.numCategories + 1 : v.numCategories}.`;
                }
                return '';
            };
            super._setGenericGLSL(inline =>
                `vec4(hsv2rgb(vec3(
                    ${inline.h}${normalize(this.h, true)},
                    clamp(${inline.s}${normalize(this.s)}, 0.,1.),
                    clamp(${inline.v}${normalize(this.v)}, 0.,1.)
                )), ${alpha ? `clamp(${inline.a}, 0.,1.)` : '1.'})`
                , `
    #ifndef HSV2RGB
    #define HSV2RGB
    vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    #endif
    `);
        }
        // TODO eval
    };

    function hsvCheckType(parameterName, parameterIndex, parameter) {
        checkExpression(name, parameterName, parameterIndex, parameter);
        if (parameter.type != 'float' && parameter.type != 'category' && parameter.type !== undefined) {
            throw new Error(`${name}(): invalid parameter\n\t${parameterName} type was: '${parameter.type}'`);
        }
    }
}

