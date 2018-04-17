import Expression from './expression';
import { checkString } from './utils';

/**
 * @description Wrapper around category names
 * @param {string} categoryName
 * @returns {carto.expressions.Expression} category expression with the category name provided
 *
 * @memberof carto.expressions
 * @name category
 * @function
 * @api
 */
export default class Category extends Expression {
    constructor(categoryName) {
        checkString('category', 'categoryName', 0, categoryName);
        super({});
        this.expr = categoryName;
        this.type = 'category';
    }
    _compile(metadata) {
        this._metadata = metadata;
    }
    _applyToShaderSource() {
        return {
            preface: this._prefaceCode(`uniform float cat${this._uid};\n`),
            inline: `cat${this._uid}`
        };
    }
    _postShaderCompile(program, gl) {
        this._getBinding(program).uniformLocation = gl.getUniformLocation(program, `cat${this._uid}`);
    }
    _preDraw(program, drawMetadata, gl) {
        const id = this._metadata.categoryIDs[this.expr];
        gl.uniform1f(this._getBinding(program).uniformLocation, id);
    }
    eval() {
        return this._metadata.categoryIDs[this.expr];
    }
    isAnimated() {
        return false;
    }
}
