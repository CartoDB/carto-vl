import Expression from './expression';
import { implicitCast, DEFAULT, clamp } from './utils';
import { floatDiv, floatMod, now, linear, globalMin, globalMax } from '../functions';
import Property from './property';

const DEFAULT_FADE = 0.15;

/**
 * Create a Torque FadeIn/FadeOut configuration
 *
 * @param {carto.style.expression.expression.number|number} param1 expression of type number or Number
 * @param {carto.style.expression.expression.number|number} param2 expression of type number or Number
 * @return {carto.style.expressions.fade}
 *
 * @example <caption> fadeIn of 0.1 seconds, fadeOut of 0.3 seconds </caption>
 * const s = carto.style.expressions;
 * new carto.Style({
 *  filter: s.torque($day, 40, s.fade(0.1, 0.3))
 * });
 *
 * @example <caption>   fadeIn and fadeOut of 0.5 seconds </caption>
 * const s = carto.style.expressions;
 * new carto.Style({
 *  filter: s.torque($day, 40, s.fade(0.5))
 * });
 *
 * @memberof carto.style.expressions
 * @name fade
 * @function
*/
export class Fade extends Expression {
    constructor(param1 = DEFAULT, param2 = DEFAULT) {
        let fadeIn = param1;
        let fadeOut = param2;
        if (param1 == DEFAULT) {
            fadeIn = DEFAULT_FADE;
        }
        if (param2 == DEFAULT) {
            fadeOut = fadeIn;
        }
        fadeIn = implicitCast(fadeIn);
        fadeOut = implicitCast(fadeOut);
        // TODO improve type check
        super({ fadeIn, fadeOut });
        this.type = 'fade';
        this.inlineMaker = (inline) => ({
            in: inline.fadeIn,
            out: inline.fadeOut,
        });
    }
}

/**
 * Create an animated temporal filter (torque)
 *
 * @param {carto.style.expression.expression} input input to base the temporal filter,
 * if input is a property, the beginning and end of the animation will be determined by the minimum and maximum timestamps of the property on the dataset,
 * this can be problematic if outliers are present. Otherwise input must be a number expression in which 0 means beginning of the animation and 1 means end.
 * @param {Number} duration duration of the animation in seconds
 * @param {carto.style.expression.fade} fade fadeIn/fadeOut configuration
 * @return {carto.style.expressions.torque}
 *
 * @example <caption> Temporal map by $day, with a duration of 40 seconds, fadeIn of 0.1 seconds and fadeOut of 0.3 seconds </caption>
 * new carto.Style(`width:    2
 * color:     ramp(linear(AVG($temp), 0,30), tealrose)
 * filter:       torque($day, 40, fade(0.1, 0.3))`);
 *
 * @memberof carto.style.expressions
 * @name torque
 * @function
*/
export class Torque extends Expression {
    constructor(input, duration = 10, fade = new Fade()) {
        if (!Number.isFinite(duration)) {
            throw new Error('Torque(): invalid second parameter, duration.');
        }
        if (input instanceof Property) {
            input = linear(input, globalMin(input), globalMax(input));
        }
        const _cycle = floatDiv(floatMod(now(), duration), duration);
        super({ input, _cycle, fade });
        // TODO improve type check
        this.duration = duration;
    }
    _compile(meta) {
        super._compile(meta);
        if (this.input.type != 'float') {
            throw new Error('Torque(): invalid first parameter, input.');
        } else if (this.fade.type != 'fade') {
            throw new Error('Torque(): invalid third parameter, fade.');
        }
        this.type = 'float';

        this.inlineMaker = (inline) =>
            `(1.- clamp(abs(${inline.input}-${inline._cycle})*${this.duration.toFixed(20)}/(${inline.input}>${inline._cycle}? ${inline.fade.in}: ${inline.fade.out}), 0.,1.) )`;
    }
    getSimTime() {
        if (!(this.input.min.eval() instanceof Date)){
            return null;
        }

        const c = this._cycle.eval(); //from 0 to 1

        const min = this.input.min.eval(); //Date
        const max = this.input.max.eval();

        const tmin = min.getTime();
        const tmax = max.getTime();
        const m = c;
        const tmix = tmax * m + (1 - m) * tmin;

        const date = new Date();
        date.setTime(tmix);
        return date;

    }
    eval(feature) {
        const input = this.input.eval(feature);
        const cycle = this._cycle.eval(feature);
        const duration = this.duration;
        const fadeIn = this.fade.fadeIn.eval(feature);
        const fadeOut = this.fade.fadeOut.eval(feature);
        return 1 - clamp(Math.abs(input - cycle) * duration / (input > cycle ? fadeIn : fadeOut), 0, 1);
    }
}
