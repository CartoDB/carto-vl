import BaseExpression from './base';
import { implicitCast, checkMaxArguments, checkExpression, checkType } from './utils';

/**
 * Create a FadeIn/FadeOut configuration. See `animation` for more details.
 *
 * @param {Number} param1 - Expression of type number or Number
 * @param {Number} param2 - Expression of type number or Number
 * @return {Fade}
 *
 * @example <caption>Fade in of 0.1 seconds, fade out of 0.3 seconds.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.animation(s.prop('day'), 40, s.fade(0.1, 0.3))
 * });
 *
 * @example <caption>Fade in of 0.1 seconds, fade out of 0.3 seconds. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: animation($day, 40, fade(0.1, 0.3))
 * `);
 *
 * @example<caption>Fade in and fade out of 0.5 seconds.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.animation(s.prop('day'), 40, s.fade(0.5))
 * });
 *
 * @example<caption>Fade in and fade out of 0.5 seconds. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: animation($day, 40, fade(0.5))
 * `);
 *
 * @example<caption>Fade in of 0.3 seconds without fading out.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.animation(s.prop('day'), 40, s.fade(0.1, s.HOLD))
 * });
 *
 * @example<caption>Fade in of 0.3 seconds without fading out. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: animation($day, 40, fade(0.3, HOLD))
 * `);
 *
 * @memberof carto.expressions
 * @name fade
 * @function
 * @api
*/

const DEFAULT_FADE = 0.15;
const DEFAULT_PARAM = undefined;

export class Fade extends BaseExpression {
    constructor (param1 = DEFAULT_PARAM, param2 = DEFAULT_PARAM) {
        checkMaxArguments(arguments, 2, 'fade');

        let fadeIn = param1 === DEFAULT_PARAM
            ? implicitCast(DEFAULT_FADE)
            : implicitCast(param1);

        let fadeOut = param2 === DEFAULT_PARAM
            ? fadeIn
            : implicitCast(param2);

        checkExpression('fade', 'param1', 0, fadeIn);
        checkExpression('fade', 'param2', 1, fadeOut);

        super({ fadeIn, fadeOut });

        this.type = 'fade';

        this.inlineMaker = (inline) => ({
            in: inline.fadeIn,
            out: inline.fadeOut
        });
    }
    _bindMetadata (meta) {
        super._bindMetadata(meta);
        checkType('fade', 'param1', 0, 'number', this.fadeIn);
        checkType('fade', 'param2', 1, 'number', this.fadeOut);
    }
}
