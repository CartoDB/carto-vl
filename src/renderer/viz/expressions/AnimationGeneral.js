import BaseExpression from './base';
import { Fade } from './Fade';
import { implicitCast, clamp, checkType, checkFeatureIndependent, checkMaxArguments } from './utils';
import { number, linear, globalMin, globalMax } from '../expressions';
import Property from './basic/property';
import { castDate } from '../../../utils/util';
import ClusterTime from './aggregation/cluster/ClusterTime';

let waitingForLayer = new Set();
let waitingForOthers = new Set();

export default class AnimationGeneral extends BaseExpression {
    constructor (input, duration = 10, fade = new Fade()) {
        checkMaxArguments(arguments, 3, 'animation');

        duration = implicitCast(duration);
        input = implicitCast(input);
        const originalInput = input;

        if (input.isA(Property) || (input.isA(ClusterTime) && input.type === 'timerange')) {
            input = linear(input, globalMin(input), globalMax(input), 'start');
        }

        const progress = number(0);
        super({ _input: input, progress, fade, duration });
        // TODO improve type check
        this.type = 'number';
        this._originalInput = originalInput;
        this._paused = false;

        this.expressionName = 'animation';

        this.preface = `
        #ifndef ANIMATION
        #define ANIMATION

        float animation(float _input, float progress, float duration, float fadeIn, float fadeOut){
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
            `animation(${inline._input}, ${inline.progress}, ${inline.duration}, ${inline.fade.in}, ${inline.fade.out})`;
    }

    isAnimated () {
        return true;
        // FIXME: this should return !this._paused;
        // but there are other bugs that make that a worse option now (#1102)
    }

    _dataReady () {
        if (waitingForLayer.has(this)) {
            waitingForLayer.delete(this);
            waitingForOthers.add(this);
        }
        if (waitingForOthers.has(this)) {
            waitingForLayer = new Set([...waitingForLayer].filter(expr => {
                while (expr.parent) {
                    expr = expr.parent;
                }
                if (expr._getRootExpressions) {
                    // The animation hasn't been removed from the viz
                    return true;
                }
                return false;
            }));
            if (waitingForLayer.size > 0) {
                return;
            }
            [...waitingForOthers.values()].map(anim => {
                if (anim._paused === 'default') {
                    anim.play();
                }
            });
            waitingForOthers.clear();
        }
    }

    _postShaderCompile (program, gl) {
        waitingForLayer.add(this);
        if (!this._paused) {
            this._paused = 'default';
        }
        super._postShaderCompile(program, gl);
    }

    _setTimestamp (timestamp) {
        super._setTimestamp(timestamp);

        if (this._paused && this._lastTime === undefined) {
            return;
        }

        let deltaTime = 0;
        const speed = 1 / this.duration.value;

        if (this._lastTime !== undefined) {
            deltaTime = timestamp - this._lastTime;
        }

        this._lastTime = timestamp;

        if (this._paused) {
            return;
        }

        this.progress.expr = (this.progress.expr + speed * deltaTime) % 1;
    }

    eval (feature) {
        const input = this._input.eval(feature);

        if (input === null) {
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
     * Get the current time stamp of the animation
     *
     * @returns {Number|Date} Current time stamp of the animation. If the animation is based on a numeric expression this will output a number, if it is based on a date expression it will output a date
     *
     * @example <caption>Using the `getProgressValue` method to get the animation current value.</caption>
     * const s = carto.expressions;
     * let animationExpr = s.animation(s.linear(s.prop('saledate'), 1991, 2017), 20, s.fade(0.7, 0.4));
     * const animationStyle = {
     *   color: s.ramp(s.linear(s.prop('priceperunit'), 2000, 1010000), [s.rgb(0, 255, 0), s.rgb(255, 0, 0)]),
     *   width: s.mul(s.sqrt(s.prop('priceperunit')), 0.05),
     *   filter: animationExpr
     * };
     * layer.on('updated', () => {
     *   let currTime = Math.floor(animationExpr.getProgressValue());
     *   document.getElementById('timestamp').innerHTML = currTime;
     * });
     *
     * @memberof expressions.Animation
     * @name getProgressValue
     * @instance
     * @api
     */
    getProgressValue () {
        const progress = this.progress.eval(); // from 0 to 1
        return this._input.converse(progress);
    }

    /**
     * Set the time stamp of the animation
     * @api
     * @memberof expressions.Animation
     * @instance
     * @name setCurrent
     * @param {Date|number} value - A JavaScript Date object with the new animation time
     */
    setTimestamp (timestamp) {
        const date = castDate(timestamp);
        const [tmin, tmax] = this._input.limits();

        if (date.getTime() < tmin) {
            throw new RangeError('animation.setTimestamp requires the date parameter to be higher than the lower limit');
        }
        if (date.getTime() > tmax) {
            throw new RangeError('animation.setTimestamp requires the date parameter to be lower than the higher limit');
        }

        this.progress.expr = (date.getTime() - tmin) / (tmax - tmin);
    }

    /**
     * Get the animation progress.
     *
     * @returns {Number} A number representing the progress. 0 when the animation just started and 1 at the end of the cycle.
     * @api
     * @instance
     * @memberof expressions.Animation
     * @name getProgressPct
     */
    getProgressPct () {
        return this.progress.value;
    }

    /**
     * Set the animation progress from 0 to 1.
     * @param {number} progress - A number in the [0-1] range setting the animation progress.
     * @api
     * @instance
     * @memberof expressions.Animation
     * @name setProgressPct
     */
    setProgressPct (progress) {
        progress = Number.parseFloat(progress);

        if (progress < 0 || progress > 1) {
            throw new TypeError(`animation.setProgressPct requires a number between 0 and 1 as parameter but got: ${progress}`);
        }

        this.progress.expr = progress;
    }

    /**
     * Pause the animation
     *
     * @api
     * @memberof expressions.Animation
     * @instance
     * @name pause
     */
    pause () {
        this._paused = true;
    }

    /**
     * Play/resume the animation
     *
     * @api
     * @memberof expressions.Animation
     * @instance
     * @name play
     */
    play () {
        this._paused = false;
    }

    /**
     * Stops the animation
     *
     * @api
     * @memberof expressions.Animation
     * @instance
     * @name stop
     */
    stop () {
        this.progress.expr = 0;
        this._paused = true;
    }

    _bindMetadata (meta) {
        this._originalInput._bindMetadata(meta);
        this.duration._bindMetadata(meta);

        checkType('animation', 'input', 0, ['number', 'date', 'timerange'], this._originalInput);
        checkType('animation', 'duration', 1, 'number', this.duration);

        super._bindMetadata(meta);

        checkType('animation', 'input', 0, 'number', this._input);
        checkType('animation', 'fade', 2, 'fade', this.fade);
        checkFeatureIndependent('animation', 'duration', 1, this.duration);
    }
}
