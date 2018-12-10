import BaseExpression from '../base';
import { checkNumber, checkMaxArguments } from '../utils';

/**
 * Wraps a number. Explicit usage is unnecessary since CARTO VL will wrap implicitly all numbers using this function.
 *
 * @param {number} x - A number to be warped in a numeric expression
 * @return {Number} Numeric expression
 *
 * @example <caption>Creating a number expression.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.number(15)  // Equivalent to `width: 15`
 * });
 *
 * @example <caption>Creating a number expression. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 15  // Equivalent to number(15)
 * `);
 *
 * @memberof carto.expressions
 * @name number
 * @function
 * @IGNOREapi
 */
export default class BaseNumber extends BaseExpression {
    constructor (x) {
        checkMaxArguments(arguments, 1, 'number');
        checkNumber('number', 'x', 0, x);

        super({});
        this.expr = x;
        this.type = 'number';
    }
    get value () {
        return this.eval();
    }
    eval () {
        return this.expr;
    }

    toString () {
        return `${this.expr}`;
    }

    isAnimated () {
        return false;
    }

    isPlaying () {
        return false;
    }

    _applyToShaderSource () {
        return {
            preface: this._prefaceCode(`uniform float number${this._uid};`),
            inline: `number${this._uid}`
        };
    }
    _postShaderCompile (program, gl) {
        this._getBinding(program).uniformLocation = gl.getUniformLocation(program, `number${this._uid}`);
    }
    _preDraw (program, drawMetadata, gl) {
        gl.uniform1f(this._getBinding(program).uniformLocation, this.expr);
    }
}
