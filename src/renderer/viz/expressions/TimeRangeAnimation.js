import { Fade } from './Fade';
import { linear, globalMin, globalMax, HOLD } from '../expressions';
import { Animation } from './Animation';
import { And } from './binary';

export class TimeRangeAnimation extends And {
    constructor (input, duration = 10, fade = new Fade()) {
        const start = linear(input, globalMin(input), globalMax(input), 'start');
        const end = linear(input, globalMin(input), globalMax(input), 'end');
        const startAnim = new Animation(start, duration, new Fade(fade.fadeIn, HOLD));
        const endAnim = new Animation(end, duration, new Fade(HOLD, fade.fadeOut));
        super(startAnim, endAnim);
        this._startAnim = startAnim;
        this._endAnim = endAnim;
        this.expressionName = 'timeAnimation';
    }

    isAnimated () {
        return this._startAnim.isAnimated();
    }

    getProgressValue () {
        return this._startAnim.getProgressValue();
    }

    setTimestamp (timestamp) {
        this._startAnim.setTimestamp(timestamp);
        this._endAnim.setTimestamp(timestamp);
    }

    getProgressPct () {
        return this._startAnim.getProgressPct();
    }

    setProgressPct (progress) {
        this._startAnim.setProgressPct(progress);
        this._endAnim.setProgressPct(progress);
    }

    pause () {
        this._startAnim.pause();
        this._endAnim.pause();
    }

    play () {
        this._startAnim.play();
        this._endAnim.play();
        this._endAnim.setProgressPct(this._startAnim.getProgressPct());
    }

    stop () {
        this._startAnim.stop();
        this._endAnim.stop();
    }
}
