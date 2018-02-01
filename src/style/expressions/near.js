import Expression from './expression';
import { implicitCast } from './utils';

<<<<<<< HEAD
//
=======
>>>>>>> 97d9d4de6f598fb1f2f1b8125e0fcebc4c5c6653
export default class Near extends Expression {
    /**
     * @api
     * @description Near returns zero for inputs that are far away from center.
     * This can be useful for filtering out features by setting their size to zero.
<<<<<<< HEAD
     * 
     *       _____
     * _____/     \_____
     * 
=======
>>>>>>> 97d9d4de6f598fb1f2f1b8125e0fcebc4c5c6653
     * @param {*} input
     * @param {*} center
     * @param {*} threshold size of the allowed distance between input and center that is filtered in (returning one)
     * @param {*} falloff size of the distance to be used as a falloff to linearly interpolate between zero and one
     */
    constructor(input, center, threshold, falloff) {
        input = implicitCast(input);
        center = implicitCast(center);
        threshold = implicitCast(threshold);
        falloff = implicitCast(falloff);
        super({ input: input, center: center, threshold: threshold, falloff: falloff });
    }
    _compile(meta) {
        super._compile(meta);
        if (this.input.type != 'float' || this.center.type != 'float' || this.threshold.type != 'float' || this.falloff.type != 'float') {
            throw new Error('Near(): invalid parameter type');
        }
        this.type = 'float';
        this.inlineMaker = (inline) =>
            `(1.-clamp((abs(${inline.input}-${inline.center})-${inline.threshold})/${inline.falloff},
        0., 1.))`;
    }
}