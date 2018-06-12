import BaseExpression from './base';
import { implicitCast } from './utils';
import { number } from '../functions';

const DEFAULT_FADE = 0.15;

/**
 * Create a FadeIn configuration. See `torque` for more details.
 * Use this expression to make features appear progressively
 *
 * @param {Number} fadeInDuration - Expression of type number or Number
 * @return {FadeIn}
 *
 * @example <caption>Fade in of 0.1 seconds.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.torque(s.prop('day'), 40, s.fadeIn(0.1))
 * });
 *
 * @example <caption>Fade in of 0.1 seconds. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: torque($day, 40, fadeIn(0.1)
 * `);
 *
 * @memberof carto.expressions
 * @name fadeIn
 * @function
 * @api
*/
export default class FadeIn extends BaseExpression {
    get type() {
        return 'fade';
    }

    get inlineMaker() {
        return (inline) => { return { in: inline.fadeIn, out: inline.fadeOut }; };
    }

    constructor(fadeInDuration = DEFAULT_FADE) {
        const fadeOut = number(100000);
        const fadeIn = implicitCast(fadeInDuration);
        super({ fadeIn, fadeOut });
    }

}
