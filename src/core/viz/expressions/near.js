import BaseExpression from './base';
import { implicitCast, clamp } from './utils';

/**
 * Near returns zero for inputs that are far away from center.
 * This can be useful for filtering out features by setting their size to zero.
 *       _____
 * _____/     \_____
 *
 * @param {Number|Property|number} input
 * @param {Number|Property|number} center
 * @param {Number|Property|number} threshold - Size of the allowed distance between input and center that is filtered in (returning one)
 * @param {Number|Property|number} falloff - Size of the distance to be used as a falloff to linearly interpolate between zero and one
 * @return {Number}
 *
 * @example <caption></caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.near(s.prop('day'), s.mod(s.mul(25, s.now()), 1000), 0, 10)
 * });
 *
 * @example <caption>(String)</caption>
 * const viz = new carto.Viz(`
 *   width: near($day, (25 * now()) % 10000, 0, 10)
 * `);
 *
 * @memberof carto.expressions
 * @name near
 * @function
 */
// TODO type checking
export default class Near extends BaseExpression {
    constructor(input, center, threshold, falloff) {
        input = implicitCast(input);
        center = implicitCast(center);
        threshold = implicitCast(threshold);
        falloff = implicitCast(falloff);

        super({ input, center, threshold, falloff });
    }
    eval(feature) {
        const input = this.input.eval(feature);
        const center = this.center.eval(feature);
        const threshold = this.threshold.eval(feature);
        const falloff = this.falloff.eval(feature);
        return 1. - clamp((Math.abs(input - center) - threshold) / falloff, 0, 1);
    }
    _compile(meta) {
        super._compile(meta);
        if (this.input.type != 'number' || this.center.type != 'number' || this.threshold.type != 'number' || this.falloff.type != 'number') {
            throw new Error('Near(): invalid parameter type');
        }
        this.type = 'number';
        this.inlineMaker = (inline) =>
            `(1.-clamp((abs(${inline.input}-${inline.center})-${inline.threshold})/${inline.falloff},0., 1.))`;
    }
}
