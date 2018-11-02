import { implicitCast, checkMaxArguments } from './utils';
import AnimationGeneral from './AnimationGeneral';
import AnimationRange from './AnimationRange';
import Base from './base';
import { Fade } from './Fade';

/**
 * Create an animated temporal filter (animation). Read more about the {@link expression.Animation|Animation Class}
 *
 * @param {Number} input input to base the temporal filter,
 * if input is a property, the beginning and end of the animation will be determined by the minimum and maximum timestamps of the property on the dataset,
 * this can be problematic if outliers are present. Otherwise input must be a number expression in which 0 means beginning of the animation and 1 means end.
 * If `input` is NULL or NaN the filter won't be passed at any moment of the animation.
 *
 * It can be combined with linear and time expressions.
 * @param {Number} duration duration of the animation in seconds, optional, defaults to 10 seconds
 * @param {Fade} fade fadeIn/fadeOut configuration, optional, defaults to 0.15 seconds of fadeIn and 0.15 seconds of fadeOut
 * @return {Number}
 *
 * @example <caption>Temporal map by $day (of numeric type), with a duration of 40 seconds, fadeIn of 0.1 seconds and fadeOut of 0.3 seconds.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: 2,
 *   color: s.ramp(s.linear(s.clusterAvg(s.prop('temp'), 0, 30)), s.palettes.TEALROSE),
 *   filter: s.animation(s.prop('day'), 40, s.fade(0.1, 0.3))
 * });
 *
 * @example <caption>Temporal map by $day (of numeric type), with a duration of 40 seconds, fadeIn of 0.1 seconds and fadeOut of 0.3 seconds. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 2
 *   color: ramp(linear(clusterAvg($temp), 0,30), tealrose)
 *   filter: animation($day, 40, fade(0.1, 0.3))
 * `);
 *
 * @example <caption>Temporal map by $date (of date type), with a duration of 40 seconds, fadeIn of 0.1 seconds and fadeOut of 0.3 seconds.</caption>
 * const viz = new carto.Viz({
 *   width: 2,
 *   color: s.ramp(s.linear(s.clusterAvg(s.prop('temp'), 0, 30)), s.palettes.TEALROSE),
 *   filter: s.animation(s.linear(s.prop('date'), s.time('2022-03-09T00:00:00Z'), s.time('2033-08-12T00:00:00Z')), 40, s.fade(0.1, 0.3))
 * });
 *
 * @example <caption>Temporal map by $date (of date type), with a duration of 40 seconds, fadeIn of 0.1 seconds and fadeOut of 0.3 seconds. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 2
 *   color: ramp(linear(clusterAvg($temp), 0,30), tealrose)
 *   filter: animation(linear($date, time('2022-03-09T00:00:00Z'), time('2033-08-12T00:00:00Z')), 40, fade(0.1, 0.3))
 * `);
 * Animation class
 *
 * This class is instanced automatically by using the `animation` function. It is documented for its methods.
 *
 * @memberof carto.expressions
 * @name animation
 * @function
 * @api
*/

/**
 * Animation class
 *
 * This class is instanced automatically by using the `animation` function. It is documented for its methods.
 *
 * @name expressions.Animation
 * @abstract
 * @hideconstructor
 * @class
 * @api
 */

export class Animation extends Base {
    constructor (input, duration = 10, fade = new Fade()) {
        checkMaxArguments(arguments, 3, 'animation');
        duration = implicitCast(duration);
        input = implicitCast(input);
        super({ input, duration, fade });
    }
    _resolveAliases (aliases) {
        this._getChildren().map(child => child._resolveAliases(aliases));
        if (this.input.type === 'timerange') {
            Object.setPrototypeOf(this, AnimationRange.prototype);
        } else {
            Object.setPrototypeOf(this, AnimationGeneral.prototype);
        }
        this._init();
    }
    _bindMetadata (metadata) {
        this._resolveAliases({});
        this._bindMetadata(metadata);
    }
}
