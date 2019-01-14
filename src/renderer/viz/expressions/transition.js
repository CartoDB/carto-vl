import BaseExpression from './base';
import { checkNumber, checkMaxArguments, getStringErrorPreface } from './utils';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../errors/carto-validation-error';

/**
 * Transition returns a number from zero to one based on the elapsed number of milliseconds since the viz was instantiated.
 * The animation is not cyclic. It will stick to one once the elapsed number of milliseconds reach the animation's duration.
 *
 * @param {number} duration - Animation duration in milliseconds
 * @return {Number}
 *
 * @memberof carto.expressions
 * @name transition
 * @function
 * @api
 */
// TODO refactor to use uniformfloat class
export default class Transition extends BaseExpression {
    constructor (duration) {
        checkMaxArguments(arguments, 1, 'transition');
        checkNumber('transition', 'duration', 0, duration);
        if (duration < 0) {
            const preface = getStringErrorPreface('transition', 'duration', 0);
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} ${preface} 'duration' must be greater than or equal to 0.`);
        }
        super({});
        this.aTime = Date.now();
        this.bTime = this.aTime + Number(duration);
        this.type = 'number';
    }

    eval () {
        const time = Date.now();
        this.mix = (time - this.aTime) / (this.bTime - this.aTime);
        return Math.min(this.mix, 1.0);
    }

    isAnimated () {
        return !this.mix || this.mix <= 1.0;
    }

    isPlaying () {
        return this.isAnimated();
    }

    _applyToShaderSource () {
        return {
            preface: this._prefaceCode(`uniform float anim${this._uid};\n`),
            inline: `anim${this._uid}`
        };
    }

    _postShaderCompile (program, gl) {
        this._getBinding(program).uniformLocation = gl.getUniformLocation(program, `anim${this._uid}`);
    }

    _preDraw (program, drawMetadata, gl) {
        const time = Date.now();
        this.mix = (time - this.aTime) / (this.bTime - this.aTime);
        if (this.mix > 1.0) {
            gl.uniform1f(this._getBinding(program).uniformLocation, 1);
        } else {
            gl.uniform1f(this._getBinding(program).uniformLocation, this.mix);
        }
    }
}
