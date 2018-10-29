import { implicitCast, clamp, mix, checkType, checkExpression, checkMaxArguments } from './utils';
import Transition from './transition';
import BaseExpression from './base';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../errors/carto-validation-error';

/**
 * Linearly interpolate from `a` to `b` based on `mix`.
 *
 * @param {Number|Color} a - Numeric or color expression, `a` type must match `b` type
 * @param {Number|Color} b - Numeric or color expression, `b` type must match `a` type
 * @param {Number} mix - Numeric expression with the interpolation parameter in the [0,1] range
 * @returns {Number|Color} Numeric or color expression with the same type as `a` and `b`
 *
 * @example <caption>Blend based on the zoom level to display a bubble map at high zoom levels and display fixed-sized points at low zoom levels.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.blend(3,
 *                  s.prop('dn'),
 *                  s.linear(s.zoom(), 10, 14))
 *           );
 * });
 *
 * @example <caption>Blend based on the zoom level to display a bubble map at high zoom levels and display fixed-sized points at low zoom levels. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: blend(3,
 *                $dn,
 *                linear(zoom(), 10, 14)
 *          )
 * `);
 *
 * @memberof carto.expressions
 * @name blend
 * @function
 * @api
 */
export default class Blend extends BaseExpression {
    constructor (a, b, mix, interpolator) {
        checkMaxArguments(arguments, 4, 'blend');
        a = implicitCast(a);
        b = implicitCast(b);
        mix = implicitCast(mix);

        checkExpression('blend', 'a', 0, a);
        checkExpression('blend', 'b', 1, b);
        checkExpression('blend', 'mix', 2, mix);

        // TODO check interpolator type
        const originalMix = mix;
        if (interpolator) {
            mix = interpolator(mix);
        }
        super({ a, b, mix });
        this.originalMix = originalMix;

        if (a.type && b.type) {
            this.type = a.type;
        }
        this.inlineMaker = inline => `mix(${inline.a}, ${inline.b}, clamp(${inline.mix}, 0., 1.))`;
    }
    eval (feature) {
        const a = clamp(this.mix.eval(feature), 0, 1);
        const x = this.a.eval(feature);
        const y = this.b.eval(feature);
        return mix(x, y, a);
    }
    replaceChild (toReplace, replacer) {
        if (toReplace === this.mix) {
            this.originalMix = replacer;
        }
        super.replaceChild(toReplace, replacer);
    }
    _bindMetadata (meta) {
        super._bindMetadata(meta);

        abTypeCheck(this.a, this.b);
        checkType('blend', 'mix', 2, 'number', this.mix);

        this.type = this.a.type;
    }
    _preDraw (...args) {
        super._preDraw(...args);
        if (this.originalMix.isA(Transition) && !this.originalMix.isAnimated()) {
            this.parent.replaceChild(this, this.b);
        }
    }
}

function abTypeCheck (a, b) {
    const validTypes = ['number', 'color', 'image', 'placement'];

    if (a.type !== b.type || !(validTypes.includes(a.type))) {
        throw new CartoValidationError(`${cvt.INCORRECT_TYPE} blend(): invalid parameter types\n\t'a' type was '${a.type}'\n\t'b' type was '${b.type}'`);
    }
}
