import Expression from './expression';
import { checkNumber } from './utils';


/**
 *
 * Wraps a number.
 *
 * @param {number} x - A number to be warped in a numeric expression
 * @return {carto.expressions.Expression} numeric expression
 *
 * @example <caption>Creating a number expression.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  width: s.number(15);  // Elements will have width 15
 * });
 *
 * @memberof carto.expressions
 * @name number
 * @function
 * @api
 */
export default class Float extends Expression {
    /**
     * @jsapi
     * @param {*} x
     */
    constructor(x) {
        checkNumber('float', 'x', 0, x);
        super({});
        this.expr = x;
        this.type = 'float';
    }

    _applyToShaderSource() {
        return {
            preface: this._prefaceCode(`uniform float float${this._uid};`),
            inline: `float${this._uid}`
        };
    }

    _postShaderCompile(program, gl) {
        this._getBinding(program).uniformLocation = gl.getUniformLocation(program, `float${this._uid}`);
    }

    _preDraw(program, drawMetadata, gl) {
        gl.uniform1f(this._getBinding(program).uniformLocation, this.expr);
    }

    isAnimated() {
        return false;
    }

    eval() {
        return this.expr;
    }
}
