import { implicitCast } from './utils';
import Expression from './expression';


export class ILinear extends genInterpolator(inner => inner) { }
export class Cubic extends genInterpolator(inner => `cubicEaseInOut(${inner})`,
    `
    #ifndef CUBIC
    #define CUBIC
    float cubicEaseInOut(float p){
        if (p < 0.5) {
            return 4. * p * p * p;
        }else {
            float f = ((2. * p) - 2.);
            return 0.5 * f * f * f + 1.;
        }
    }
    #endif
`) { }


// Interpolators
function genInterpolator(inlineMaker, preface) {
    return class Interpolator extends Expression {
        constructor(m) {
            m = implicitCast(m);
            super({ m: m });
            this.isInterpolator = true; //TODO remove this hack
        }
        _compile(meta) {
            super._compile(meta);
            if (this.m.type != 'float') {
                throw new Error(`Blending cannot be performed by '${this.m.type}'`);
            }
            this.type = 'float';
            this._setGenericGLSL(inline => inlineMaker(inline.m), preface);
        }
    };

}