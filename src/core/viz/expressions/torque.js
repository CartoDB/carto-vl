import BaseExpression from './base';
import { implicitCast, DEFAULT, clamp, checkType, checkLooseType, checkFeatureIndependent } from './utils';
import { number, linear, globalMin, globalMax } from '../functions';
import Property from './basic/property';
import Variable from './basic/variable';

const DEFAULT_FADE = 0.15;

/**
 * Create a FadeIn/FadeOut configuration. See `torque` for more details.
 *
 * @param {Number} param1 - Expression of type number or Number
 * @param {Number} param2 - Expression of type number or Number
 * @return {Fade}
 *
 * @example <caption>Fade in of 0.1 seconds, fade out of 0.3 seconds.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.torque(s.prop('day'), 40, s.fade(0.1, 0.3))
 * });
 *
 * @example <caption>Fade in of 0.1 seconds, fade out of 0.3 seconds. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: torque($day, 40, fade(0.1, 0.3))
 * `);
 *
 * @example<caption>Fade in and fade out of 0.5 seconds.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.torque(s.prop('day'), 40, s.fade(0.5))
 * });
 *
 * @example<caption>Fade in and fade out of 0.5 seconds. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: torque($day, 40, fade(0.5))
 * `);
 * 
 * @example<caption>Fade in of 0.3 seconds without fading out.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.torque(s.prop('day'), 40, s.fade(0.1, s.HOLD))
 * });
 * 
 * @example<caption>Fade in of 0.3 seconds without fading out. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: torque($day, 40, fade(0.3, HOLD))
 * `);
 *
 * @memberof carto.expressions
 * @name fade
 * @function
 * @api
*/
export class Fade extends BaseExpression {
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
export class Torque extends BaseExpression {
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
        
        const progress = number(0);
        
        super({ _input: input, progress, fade, duration });
        // TODO improve type check
        this.type = 'number';
        this._originalInput = originalInput;
    }

    isAnimated() {
        return true;
    }

    _setTimestamp(timestamp) {
        let deltaTime = 0;
        const speed = 1 / this.duration.value;
    
        if (this._lastTime !== undefined) {
            deltaTime = timestamp - this._lastTime;
        }

        this._lastTime = timestamp;
        this.progress.expr = (this.progress.expr + speed * deltaTime) % 1;

        super._setTimestamp(timestamp);
    }

    eval(feature) {
        const input = this.input.eval(feature);

        if (Number.isNaN(input)) {
            return 0;
        }

        const progress = this.progress.value;
        const duration = this.duration.value;
        const fadeIn = this.fade.fadeIn.eval(feature);
        const fadeOut = this.fade.fadeOut.eval(feature);
        
        const output = 1 - clamp(Math.abs(input - progress) * duration / (input > progress ? fadeIn : fadeOut), 0, 1);
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
        const progress = this.progress.eval(); //from 0 to 1
        const min = this.input.min.eval();
        const max = this.input.max.eval();

        if (!(min instanceof Date)) {
            return progress * (max - min) + min;
        }

        const tmin = min.getTime();
        const tmax = max.getTime();
        const tmix = (1 - progress) * tmin + tmax * progress;

        return new Date(tmix);
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
            
            float torque(float _input, float progress, float duration, float fadeIn, float fadeOut){
                float x = 0.;
                
                // Check for NaN
                if (_input <= 0.0 || 0.0 <= _input){
                    x = 1. - clamp(abs(_input - progress) * duration / (_input > progress ? fadeIn: fadeOut), 0., 1.);
                }

                return x;
            }

            #endif
        `;

        this.inlineMaker = inline =>
            `torque(${inline._input}, ${inline.progress}, ${inline.duration}, ${inline.fade.in}, ${inline.fade.out})`;
    }
}
