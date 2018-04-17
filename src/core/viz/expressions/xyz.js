import BaseExpression from './base';
import { implicitCast } from './utils';


// TODO should this expression be removed?
export default class XYZ extends BaseExpression {
    constructor(x, y, z) {
        x = implicitCast(x);
        y = implicitCast(y);
        z = implicitCast(z);
        super({ x: x, y: y, z: z });
        // TODO improve type check
    }
    _compile(meta) {
        super._compile(meta);
        if (this.x.type != 'float' || this.y.type != 'float' || this.z.type != 'float') {
            throw new Error('XYZ() invalid parameters');
        }
        this.type = 'color';
        this._setGenericGLSL(inline =>
            `vec4(xyztosrgb((
                vec3(
                    clamp(${inline.x}, -100000., 10000.),
                    clamp(${inline.y}, -12800., 12800.),
                    clamp(${inline.z}, -12800., 12800.)
                )
            )), 1)`
            , `
        #ifndef cielabtoxyz_fn
        #define cielabtoxyz_fn

        const mat3 XYZ_2_RGB = (mat3(
            3.2404542,-1.5371385,-0.4985314,
           -0.9692660, 1.8760108, 0.0415560,
            0.0556434,-0.2040259, 1.0572252
       ));
       const mat3 XYZ_2_RGB_T = (mat3(
        3.2404542,-0.9692660,0.0556434,
        -1.5371385, 1.8760108, -0.2040259,
        -0.4985314,0.0415560, 1.0572252
   ));
       const float SRGB_GAMMA = 1.0 / 2.2;

       vec3 rgb_to_srgb_approx(vec3 rgb) {
        return pow(rgb, vec3(SRGB_GAMMA));
    }
        float f1(float t){
            const float sigma = 6./29.;
            if (t>sigma){
                return t*t*t;
            }else{
                return 3.*sigma*sigma*(t-4./29.);
            }
        }
        vec3 cielabtoxyz(vec3 c) {
            const float xn = 95.047;
            const float yn = 100.;
            const float zn = 108.883;
            return vec3(xn*f1((c.x+16.)/116.  + c.y/500. ),
                        yn*f1((c.x+16.)/116.),
                        zn*f1((c.x+16.)/116.  - c.z/200. )
                    );
        }
        vec3 xyztorgb(vec3 c){
            return c * XYZ_2_RGB;
        }

        vec3 xyztosrgb(vec3 c) {
            return rgb_to_srgb_approx(xyztorgb(c));
        }
        #endif
        `);
    }
}