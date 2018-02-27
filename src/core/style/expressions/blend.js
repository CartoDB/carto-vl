import { implicitCast } from './utils';
import Animate from './animate';
import Expression from './expression';

export default class Blend extends Expression {
    /**
     * @description Interpolate from *a* to *b* based on *mix*
     * @param {*} a can be a color or a number
     * @param {*} b type must match a's type
     * @param {*} mix interpolation parameter in the [0,1] range
     */
    constructor(a, b, mix, interpolator) {
        a = implicitCast(a);
        b = implicitCast(b);
        mix = implicitCast(mix);
        const originalMix = mix;
        if (interpolator) {
            mix = interpolator(mix);
        }
        super({ a: a, b: b, mix: mix });
        this.originalMix = originalMix;
    }
    _compile(meta) {
        super._compile(meta);
        if (this.mix.type != 'float') {
            throw new Error(`Blending cannot be performed by '${this.mix.type}'`);
        }
        if (this.a.type == 'float' && this.b.type == 'float') {
            this.type = 'float';
        } else if (this.a.type == 'color' && this.b.type == 'color') {
            this.type = 'color';
        } else {
            throw new Error(`Blending cannot be performed between types '${this.a.type}' and '${this.b.type}'`);
        }
        this.inlineMaker = inline => `mix(${inline.a}, ${inline.b}, clamp(${inline.mix}, 0., 1.))`;
    }
    _preDraw(...args) {
        super._preDraw(...args);
        if (this.originalMix instanceof Animate && !this.originalMix.isAnimated()) {
            this.parent._replaceChild(this, this.b);
        }
    }
}
