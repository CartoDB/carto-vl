import BaseExpression from './base';
import { checkNumber } from './utils';

/**
 * Wraps a number.
 *
 * @param {number} x - A number to be warped in a numeric expression
 * @return {carto.expressions.Base} Numeric expression
 *
 * @example <caption>Creating a number expression.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.number(15)  // Equivalent to `width: 15`
 * });
 *
 * @example <caption>Creating a number expression. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 15
 * `);
 *
 * const viz = new carto.Viz(`
 *   width: number(15)
 * `);
 *
 * @memberof carto.expressions
 * @name number
 * @function
 * @api
 */
export default class Number extends BaseExpression {
    constructor(x) {
        checkNumber('number', 'x', 0, x);
        super({});
        this.expr = x;
        this.type = 'number';
    }
    eval() {
        return this.expr;
    }
    isAnimated() {
        return false;
    }
    _applyToShaderSource() {
        return {
            preface: this._prefaceCode(`uniform float number${this._uid};`),
            inline: `number${this._uid}`
        };
    }
    _postShaderCompile(program, gl) {
        this._getBinding(program).uniformLocation = gl.getUniformLocation(program, `number${this._uid}`);
    }
    _preDraw(program, drawMetadata, gl) {
        gl.uniform1f(this._getBinding(program).uniformLocation, this.expr);
    }
}
