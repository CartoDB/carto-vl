import { implicitCast, clamp, mix, checkLooseType, checkType, checkExpression } from './utils';
import Animate from './animate';
import Expression from './expression';

/**
 * @description Linearly interpolate from *a* to *b* based on *mix*
 * @param {carto.style.expressions.Expression | number} a numeric or color expression
 * @param {carto.style.expressions.Expression | number} b numeric or color expression
 * @param {carto.style.expressions.Expression | number} mix numeric expression with the interpolation parameter in the [0,1] range
 * @returns {carto.style.expressions.Expression} numeric expression
 *
 * @memberof carto.style.expressions
 * @name blend
 * @function
 * @api
 */
export default class Blend extends Expression {
    constructor(a, b, mix, interpolator) {
        a = implicitCast(a);
        b = implicitCast(b);
        mix = implicitCast(mix);


        checkExpression('blend', 'a', 0, a);
        checkExpression('blend', 'b', 1, b);
        checkExpression('blend', 'mix', 2, mix);
        if (a.type && b.type) {
            abTypeCheck(a, b);
        }
        checkLooseType('blend', 'mix', 2, 'float', mix);

        // TODO check interpolator type
        const originalMix = mix;
        if (interpolator) {
            mix = interpolator(mix);
        }
        super({ a: a, b: b, mix: mix });
        this.originalMix = originalMix;

        if (a.type && b.type) {
            this.type = a.type;
        }
    }
    _compile(meta) {
        super._compile(meta);

        abTypeCheck(this.a, this.b);
        checkType('blend', 'mix', 1, 'float', this.mix);

        this.type = this.a.type;

        this.inlineMaker = inline => `mix(${inline.a}, ${inline.b}, clamp(${inline.mix}, 0., 1.))`;
    }
    _preDraw(...args) {
        super._preDraw(...args);
        if (this.originalMix instanceof Animate && !this.originalMix.isAnimated()) {
            this.parent.replaceChild(this, this.b);
            this.notify();
        }
    }
    replaceChild(toReplace, replacer) {
        if (toReplace == this.mix) {
            this.originalMix = replacer;
        }
        super.replaceChild(toReplace, replacer);
    }
    eval(feature) {
        const a = clamp(this.mix.eval(feature), 0, 1);
        const x = this.a.eval(feature);
        const y = this.b.eval(feature);
        return mix(x, y, a);
    }
}

function abTypeCheck(a, b) {
    if (!((a.type == 'float' && b.type == 'float') || (a.type == 'color' && b.type == 'color'))) {
        throw new Error(`blend(): invalid parameter types\n\t'a' type was '${a.type}'\n\t'b' type was ${b.type}'`);
    }
}
