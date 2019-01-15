import BaseExpression from './base';
import { Fade } from './Fade';
import { linear, globalMin, globalMax, HOLD, mul } from '../expressions';
import AnimationGeneral from './AnimationGeneral';

export default class AnimationRange extends BaseExpression {
    _init () {
        const input = this.input;
        const duration = this.duration;
        const fade = this.fade;

        const start = linear(input, globalMin(input), globalMax(input), 'start');

        const input2 = {};
        Object.keys(input).forEach(key => { input2[key] = input[key]; });

        Object.setPrototypeOf(input2, input);

        const end = linear(input2, globalMin(input2), globalMax(input2), 'end');
        const startAnim = new AnimationGeneral(start, duration, new Fade(fade.fadeIn, HOLD));
        const endAnim = new AnimationGeneral(end, duration, new Fade(HOLD, fade.fadeOut));
        const combinedAnimation = mul(startAnim, endAnim);

        this.combinedAnimation = combinedAnimation;
        this.childrenNames.push('combinedAnimation');
        combinedAnimation.parent = this;

        this.type = 'number';

        this._startAnim = startAnim;
        this._endAnim = endAnim;

        this.expressionName = 'animation';
        this.inlineMaker = inline => inline.combinedAnimation;
    }
    _bindMetadata (metadata) {
        this.combinedAnimation._bindMetadata(metadata);
    }

    eval (feature) {
        return this.combinedAnimation.eval(feature);
    }

    isAnimated () {
        return true;
    }

    isPlaying () {
        return this._startAnim.isPlaying();
    }

    getProgressValue () {
        return this._startAnim.getProgressValue();
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
