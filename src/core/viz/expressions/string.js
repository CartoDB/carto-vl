import BaseExpression from './base';
import { checkString } from './utils';

/**
 * Wrapper around strings.
 *
 * @param {string} input
 * @returns {String} category expression with the category name provided
 *
 * @memberof carto.expressions
 * @name string
 * @function
 * @api
 */
export default class String extends BaseExpression {
    constructor(input) {
        checkString('string', 'input', 0, input);
        super({});
        this.expr = input;
        this.type = 'string';
    }
    eval() {
        return this.expr;
    }
    isAnimated() {
        return false;
    }
    _compile(metadata) {
        this._metadata = metadata;
    }
    _applyToShaderSource() {
        // return {
        //     preface: this._prefaceCode(`uniform float cat${this._uid};\n`),
        //     inline: `cat${this._uid}`
        // };
    }
    // _postShaderCompile(program, gl) {
    //     // this._getBinding(program).uniformLocation = gl.getUniformLocation(program, `cat${this._uid}`);
    // }
    // _preDraw(program, drawMetadata, gl) {
    //     // const id = this._metadata.categoryIDs[this.expr];
    //     // gl.uniform1f(this._getBinding(program).uniformLocation, id);
    // }
}
