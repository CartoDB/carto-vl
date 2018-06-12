import BaseExpression from './base';
import { implicitCast, clamp, checkType, checkLooseType, checkFeatureIndependent } from './utils';
import { div, mod, now, linear, globalMin, globalMax } from '../functions';
import Property from './basic/property';
import Variable from './basic/variable';
import Fade from './fade';

/**
 * Create an animated temporal filter (torque).
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
 * @example <caption>Temporal map by $day (of numeric type), with a duration of 40 seconds, fadeIn of 0.1 seconds and fadeOut of 0.3 seconds. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 2
 *   color: ramp(linear(clusterAvg($temp), 0,30), tealrose)
 *   filter: torque($day, 40, fade(0.1, 0.3))
 * `);
 *
 * @example <caption>Temporal map by $date (of date type), with a duration of 40 seconds, fadeIn of 0.1 seconds and fadeOut of 0.3 seconds. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 2
 *   color: ramp(linear(clusterAvg($temp), 0,30), tealrose)
 *   filter: torque(linear($date, time('2022-03-09T00:00:00Z'), time('2033-08-12T00:00:00Z')), 40, fade(0.1, 0.3))
 * `);
 *
 * @example <caption>Using the `getSimTime` method to get the simulated time.</caption>
 * const s = carto.expressions;
 * let torqueExpr = s.torque(s.linear(s.prop('saledate'), 1991, 2017), 20, s.fade(0.7, 0.4));
 * const torqueStyle = {
 *   color: s.ramp(s.linear(s.prop('priceperunit'), 2000, 1010000), [s.rgb(0, 255, 0), s.rgb(255, 0, 0)]),
 *   width: s.mul(s.sqrt(s.prop('priceperunit')), 0.05),
 *   filter: torqueExpr
 * };
 * layer.on('updated', () => {
 *   let currTime = Math.floor(torqueExpr.getSimTime());
 *   document.getElementById('timestamp').innerHTML = currTime;
 * });
 *
 * @memberof carto.expressions
 * @name torque
 * @function
 * @api
*/
/**
 * Torque class
 *
 * This class is instanced automatically by using the `torque` function. It is documented for its methods.
 *
 * @memberof carto.expressions
 * @name Torque
 * @abstract
 * @hideconstructor
 * @class
 * @api
 */
export default class Torque extends BaseExpression {
    constructor(input, duration = 10, fade = new Fade()) {
        duration = implicitCast(duration);
        let originalInput = input;
        if (input instanceof Property) {
            input = linear(input, globalMin(input), globalMax(input));
        } else {
            input = implicitCast(input);
            originalInput = input;
        }

        checkLooseType('torque', 'input', 0, 'number', input);
        checkLooseType('torque', 'duration', 1, 'number', duration);
        checkFeatureIndependent('torque', 'duration', 1, duration);
        checkLooseType('torque', 'fade', 2, 'fade', fade);

        const _cycle = div(mod(now(), duration), duration);
        super({ _input: input, _cycle, fade, duration });
        // TODO improve type check
        this.duration = duration;
        this.type = 'number';
        this._originalInput = originalInput;
    }
    eval(feature) {
        const input = this.input.eval(feature);
        if (Number.isNaN(input)) {
            return 0;
        }
        const cycle = this._cycle.eval(feature);
        const duration = this.duration.value;
        const fadeIn = this.fade.fadeIn.eval(feature);
        const fadeOut = this.fade.fadeOut.eval(feature);
        const output = 1 - clamp(Math.abs(input - cycle) * duration / (input > cycle ? fadeIn : fadeOut), 0, 1);
        return output;
    }
    /**
     * Get the current time stamp of the simulation
     *
     * @api
     * @returns {Number|Date} Current time stamp of the simulation, if the simulation is based on a numeric expression this will output a number, if it is based on a date expression it will output a date
     * @memberof carto.expressions.Torque
     * @instance
     * @name getSimTime
     */
    getSimTime() {
        const c = this._cycle.eval(); //from 0 to 1

        const min = this.input.min.eval();
        const max = this.input.max.eval();

        if (!(this.input.min.eval() instanceof Date)) {
            return min + c * (max - min);
        }


        const tmin = min.getTime();
        const tmax = max.getTime();
        const m = c;
        const tmix = tmax * m + (1 - m) * tmin;

        const date = new Date();
        date.setTime(tmix);
        return date;

    }
    get input() {
        return this._input instanceof Variable ? this._input.alias : this._input;
    }
    _compile(meta) {
        this._originalInput._compile(meta);
        this.duration._compile(meta);
        checkType('torque', 'input', 0, ['number', 'date'], this._originalInput);
        checkType('torque', 'duration', 1, 'number', this.duration);
        super._compile(meta);
        checkType('torque', 'input', 0, 'number', this.input);
        checkType('torque', 'fade', 2, 'fade', this.fade);
        checkFeatureIndependent('torque', 'duration', 1, this.duration);


        this.preface = `
        #ifndef TORQUE
        #define TORQUE
        float torque(float _input, float cycle, float duration, float fadeIn, float fadeOut){
            float x = 0.;
            // Check for NaN
            if (_input <= 0.0 || 0.0 <= _input){
                x = 1.- clamp(abs(_input-cycle)*duration/(_input>cycle? fadeIn: fadeOut), 0.,1.);
            }
            return x;
        }
        #endif
        `;
        this.inlineMaker = inline =>
            `torque(${inline._input}, ${inline._cycle}, ${inline.duration}, ${inline.fade.in}, ${inline.fade.out})`;
    }
}
