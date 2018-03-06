import Expression from './expression';
import { implicitCast } from './utils';

export default class HSV extends Expression {
    /**
     * @description Color constructor for Hue Saturation Value (HSV) color space
     * @param {*} hue   hue is the color hue, the coordinates goes from 0 to 1 and is cyclic, i.e.: 0.5=1.5=2.5=-0.5
     * @param {*} saturation saturation of the color in the [0,1] range
     * @param {*} value value (brightness) of the color in the [0,1] range
     */
    constructor(h, s, v) {
        h = implicitCast(h);
        s = implicitCast(s);
        v = implicitCast(v);
        super({ h: h, s: s, v: v });
    }
    _compile(metadata) {
        super._compile(metadata);
        function typeCheck(v) {
            return !(v.type == 'float' || v.type == 'category');
        }
        if (typeCheck(this.h) || typeCheck(this.s) || typeCheck(this.v)) {
            throw new Error('CIELab() invalid parameters');
        }
        this.type = 'color';
        const normalize = (v, hue = false) => {
            if (v.type == 'category') {
                return `/${hue ? v.numCategories + 1 : v.numCategories}.`;
            }
            return '';
        };
        super._setGenericGLSL(inline =>
            `vec4(hsv2rgb(vec3(${inline.h}${normalize(this.h, true)}, clamp(${inline.s}${normalize(this.s)}, 0.,1.), clamp(${inline.v}${normalize(this.v)}, 0.,1.))), 1)`
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
}
