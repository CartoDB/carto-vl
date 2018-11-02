import BaseExpression from './base';
import { Fade } from './Fade';
import { linear, globalMin, globalMax, HOLD, and } from '../expressions';
import AnimationGeneral from './AnimationGeneral';

export default class AnimationRange extends BaseExpression {
    constructor (input, duration = 10, fade = new Fade()) {
        const start = linear(input, globalMin(input), globalMax(input), 'start');
        const end = linear(input, globalMin(input), globalMax(input), 'end');
        const startAnim = new AnimationGeneral(start, duration, new Fade(fade.fadeIn, HOLD));
        const endAnim = new AnimationGeneral(end, duration, new Fade(HOLD, fade.fadeOut));
        const combinedAnimation = and(startAnim, endAnim);
        super({ combinedAnimation });
        this.type = 'number';
        this._startAnim = startAnim;
        this._endAnim = endAnim;
        this.input = input;
        this.expressionName = 'animation';
        this.inlineMaker = inline => inline.combinedAnimation;
    }

    eval (feature) {
        return this.combinedAnimation.eval(feature);
    }

    isAnimated () {
        return true;
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
