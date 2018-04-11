import Expression from './expression';
import { checkNumber, getStringErrorPreface } from './utils';


//TODO refactor to use uniformfloat class
export default class Animate extends Expression {
    /**
     * @jsapi
     * @description Animate returns a number from zero to one based on the elapsed number of milliseconds since the style was instantiated.
     * The animation is not cyclic. It will stick to one once the elapsed number of milliseconds reach the animation's duration.
     * @param {*} duration animation duration in milliseconds
     */
    constructor(duration) {
        checkNumber('animate', 'duration', 0, duration);
        if (duration < 0) {
            throw new Error(getStringErrorPreface('animate', 'duration', 0) + 'duration must be greater than or equal to 0');
        }
        super({});
        this.aTime = Date.now();
        this.bTime = this.aTime + Number(duration);
        this.type = 'float';
    }
    _applyToShaderSource() {
        return {
            preface: this._prefaceCode(`uniform float anim${this._uid};\n`),
            inline: `anim${this._uid}`
        };
    }
    _postShaderCompile(program, gl) {
        this._getBinding(program).uniformLocation = gl.getUniformLocation(program, `anim${this._uid}`);
    }
    _preDraw(program, drawMetadata, gl) {
        const time = Date.now();
        this.mix = (time - this.aTime) / (this.bTime - this.aTime);
        if (this.mix > 1.) {
            gl.uniform1f(this._getBinding(program).uniformLocation, 1);
        } else {
            gl.uniform1f(this._getBinding(program).uniformLocation, this.mix);
        }
    }
    eval() {
        const time = Date.now();
        this.mix = (time - this.aTime) / (this.bTime - this.aTime);
        return Math.min(this.mix, 1.);
    }
    isAnimated() {
        return !this.mix || this.mix <= 1.;
    }
}
