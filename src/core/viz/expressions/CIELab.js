import BaseExpression from './base';
import { implicitCast, checkLooseType, checkType, checkExpression } from './utils';

export default class CIELab extends BaseExpression {
    constructor(l, a, b) {
        l = implicitCast(l);
        a = implicitCast(a);
        b = implicitCast(b);

        checkExpression('cielab', 'l', 0, l);
        checkExpression('cielab', 'a', 1, a);
        checkExpression('blend', 'b', 2, b);
        checkLooseType('cielab', 'l', 0, 'float', l);
        checkLooseType('cielab', 'a', 1, 'float', a);
        checkLooseType('cielab', 'b', 2, 'float', b);

        super({ l: l, a: a, b: b });
        this.type = 'color';
    }
    _compile(meta) {
        super._compile(meta);

        checkType('cielab', 'l', 0, 'float', this.l);
        checkType('cielab', 'a', 1, 'float', this.a);
        checkType('cielab', 'b', 2, 'float', this.b);

        this._setGenericGLSL(inline =>
            `vec4(xyztosrgb(cielabtoxyz(
                vec3(
                    clamp(${inline.l}, 0., 100.),
                    clamp(${inline.a}, -128., 128.),
                    clamp(${inline.b}, -128., 128.)
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
            const float xn = 95.047/100.;
            const float yn = 100./100.;
            const float zn = 108.883/100.;
            return vec3(xn*f1((c.x+16.)/116.  + c.y/500. ),
                        yn*f1((c.x+16.)/116.),
                        zn*f1((c.x+16.)/116.  - c.z/200. )
                    );
        }
        vec3 xyztorgb(vec3 c){
            return c *XYZ_2_RGB;
        }

        vec3 xyztosrgb(vec3 c) {
            return rgb_to_srgb_approx(xyztorgb(c));
        }
        #endif
        `);
    }
    // TODO EVAL
}
