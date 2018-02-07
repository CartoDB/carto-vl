import Expression from './expression';


//TODO refactor to use uniformfloat class
export default class Animate extends Expression {
    /**
     * @jsapi
     * @description Animate returns a number from zero to one based on the elapsed number of milliseconds since the style was instantiated.
     * The animation is not cyclic. It will stick to one once the elapsed number of milliseconds reach the animation's duration.
     * @param {*} duration animation duration in milliseconds
     */
    constructor(duration) {
        if (!Number.isFinite(duration)) {
            throw new Error('Animate only supports number literals');
        }
        super({});
        this.aTime = Date.now();
        this.bTime = this.aTime + Number(duration);
    }
    _compile() {
        this.type = 'float';
    }
    _applyToShaderSource(uniformIDMaker) {
        this._uniformID = uniformIDMaker();
        return {
            preface: `uniform float anim${this._uniformID};\n`,
            inline: `anim${this._uniformID}`
        };
    }
    _postShaderCompile(program, gl) {
        this._uniformLocation = gl.getUniformLocation(program, `anim${this._uniformID}`);
    }
    _preDraw(l, gl) {
        const time = Date.now();
        this.mix = (time - this.aTime) / (this.bTime - this.aTime);
        if (this.mix > 1.) {
            gl.uniform1f(this._uniformLocation, 1);
        } else {
            gl.uniform1f(this._uniformLocation, this.mix);
        }
    }
    isAnimated() {
        return !this.mix || this.mix <= 1.;
    }
}