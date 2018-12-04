import BaseExpression from '../base';
import { checkString, checkMaxArguments } from '../utils';

/**
 * Wrapper around category names. Explicit usage is unnecessary since CARTO VL will wrap implicitly all strings using this function.
 *
 * @param {String} categoryName
 * @returns {Category} category expression with the name provided
 *
 * @memberof carto.expressions
 * @name category
 * @function
 * @IGNOREapi
 */
export default class BaseCategory extends BaseExpression {
    constructor (categoryName) {
        checkMaxArguments(arguments, 1, 'category');
        checkString('category', 'categoryName', 0, categoryName);

        super({});
        this.expr = categoryName;
        this.type = 'category';
    }

    get value () {
        // Return the plain string
        return this.expr;
    }

    eval () {
        return this.expr;
    }

    isAnimated () {
        return false;
    }

    isPlaying () {
        return false;
    }

    _bindMetadata (metadata) {
        this._metadata = metadata;
    }

    _applyToShaderSource () {
        return {
            preface: this._prefaceCode(`uniform float cat${this._uid};\n`),
            inline: `cat${this._uid}`
        };
    }

    _postShaderCompile (program, gl) {
        this._getBinding(program).uniformLocation = gl.getUniformLocation(program, `cat${this._uid}`);
    }

    _preDraw (program, drawMetadata, gl) {
        const id = this._metadata.categoryToID.get(this.expr);
        gl.uniform1f(this._getBinding(program).uniformLocation, id);
    }
}
