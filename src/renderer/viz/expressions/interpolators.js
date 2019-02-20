import { implicitCast, checkMaxArguments } from './utils';
import BaseExpression from './base';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../errors/carto-validation-error';

// TODO type checking

export class ILinear extends genInterpolator('iLinear', inner => inner, undefined, inner => inner) { }

export class Cubic extends genInterpolator(
    'cubic',
    inner => `cubicEaseInOut(${inner})`,
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
`,
    inner => inner // TODO FIXME
) { }

export class BounceEaseIn extends genInterpolator(
    'bounceEaseIn',
    inner => `BounceEaseIn(${inner})`,
    `
    #ifndef BOUNCE_EASE_IN
    #define BOUNCE_EASE_IN
    float BounceEaseIn_BounceEaseOut(float p)
    {
        if(p < 4./11.0)
        {
            return (121. * p * p)/16.0;
        }
        else if(p < 8./11.0)
        {
            return (363./40.0 * p * p) - (99./10.0 * p) + 17./5.0;
        }
        else if(p < 9./10.0)
        {
            return (4356./361.0 * p * p) - (35442./1805.0 * p) + 16061./1805.0;
        }
        else
        {
            return (54./5.0 * p * p) - (513./25.0 * p) + 268./25.0;
        }
    }
    float BounceEaseIn(float p)
    {
        return 1. - BounceEaseOut(1. - p);
    }
    #endif

`,
    inner => inner // TODO FIXME
) { }

// Interpolators
function genInterpolator (name, inlineMaker, preface, jsEval) {
    const fn = class Interpolator extends BaseExpression {
        constructor (m) {
            checkMaxArguments(arguments, 1, name);

            m = implicitCast(m);
            super({ m });
        }
        eval (feature) {
            return jsEval(this.m.eval(feature));
        }
        _bindMetadata (meta) {
            super._bindMetadata(meta);
            if (this.m.type !== 'number') {
                throw new CartoValidationError(`${cvt.INCORRECT_TYPE} Blending cannot be performed by '${this.m.type}'`);
            }
            this.type = 'number';
            this._setGenericGLSL(inline => inlineMaker(inline.m), preface);
        }
    };
    fn.type = 'interpolator';
    return fn;
}
