import { implicitCast } from './utils';
import { blend, animate } from '../functions';
import * as schema from '../../schema';

let uid = 0;

/**
 * Abstract expression class
 *
 * All expressions listed in  {@link carto.expressions} inherit from this class so any of them
 * they can be used where an Expression is required as long as the types match.
 *
 * This means that you can't use a numeric expression where a color expression is expected.
 *
 * @memberof carto.expressions
 * @name Base
 * @abstract
 * @class
 * @api
 */
export default class Base {
    /**
     * @hideconstructor
     * @param {*} children
     * @param {*} inlineMaker
     * @param {*} preface
     */
    constructor(children) {
        this.childrenNames = Object.keys(children);
        Object.keys(children).map(name => this[name] = implicitCast(children[name]));
        this._getChildren().map(child => child.parent = this);
        this._metaBindings = [];
        this.preface = '';
        this._shaderBindings = new Map();
        this._uid = uid++;
    }

    _bind(metadata) {
        this._metaBindings.push(metadata);
        this._compile(metadata);
        return this;
    }

    _prefaceCode(glslCode) {
        return `
        #ifndef DEF_${this._uid}
        #define DEF_${this._uid}
        ${glslCode}
        #endif
        `;
    }

    _getDependencies() {
        return this._getChildren().map(child => child._getDependencies()).reduce((x, y) => x.concat(y), []);
    }

    _resolveAliases(aliases) {
        this._getChildren().map(child => child._resolveAliases(aliases));
    }

    _updateDrawMetadata(metadata) {
        this._getChildren().map(child => child._updateDrawMetadata(metadata));
    }
    _compile(metadata) {
        this._getChildren().map(child => child._compile(metadata));
    }

    _setGenericGLSL(inlineMaker, preface) {
        this.inlineMaker = inlineMaker;
        this.preface = (preface ? preface : '');
    }

    /**
     * Generate GLSL code
     * @param {*} getGLSLforProperty  fn to get property IDs and inform of used properties
     */
    _applyToShaderSource(getGLSLforProperty) {
        const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(getGLSLforProperty));
        let childInlines = {};
        childSources.map((source, index) => childInlines[this.childrenNames[index]] = source.inline);
        return {
            preface: this._prefaceCode(childSources.map(s => s.preface).reduce((a, b) => a + b, '') + this.preface),
            inline: this.inlineMaker(childInlines, getGLSLforProperty)
        };
    }

    /**
     * Inform about a successful shader compilation. One-time post-compilation WebGL calls should be done here.
     * @param {*} program
     */
    _postShaderCompile(program, gl) {
        this.childrenNames.forEach(name => this[name]._postShaderCompile(program, gl));
    }

    _getBinding(shader) {
        if (!this._shaderBindings.has(shader)) {
            this._shaderBindings.set(shader, {});
        }
        return this._shaderBindings.get(shader);
    }

    _resetViewportAgg() {
        this._getChildren().forEach(child => child._resetViewportAgg());
    }
    _accumViewportAgg(f) {
        this._getChildren().forEach(child => child._accumViewportAgg(f));
    }

    /**
     * Pre-rendering routine. Should establish the current timestamp in seconds since an arbitrary point in time as needed.
     * @param {number} timestamp
     */
    _setTimestamp(timestamp) {
        this.childrenNames.forEach(name => this[name]._setTimestamp(timestamp));
    }

    /**
     * Pre-rendering routine. Should establish related WebGL state as needed.
     * @param {*} l
     */
    _preDraw(...args) {
        this.childrenNames.forEach(name => this[name]._preDraw(...args));
    }

    /**
     * @jsapi
     * @returns true if the evaluation of the function at styling time won't be the same every time.
     */
    isAnimated() {
        return this._getChildren().some(child => child.isAnimated());
    }

    /**
     * Replace child *toReplace* by *replacer*
     * @param {*} toReplace
     * @param {*} replacer
     */
    replaceChild(toReplace, replacer) {
        const name = this.childrenNames.find(name => this[name] == toReplace);
        this[name] = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    }

    notify() {
        this.parent.notify();
    }

    /**
     * Linear interpolation between this and finalValue with the specified duration
     * @api
     * @param {Expression} final
     * @param {Expression} duration
     * @param {Expression} blendFunc
     * @memberof carto.expressions.Base
     * @instance
     */
    blendTo(final, duration = 500) {
        //TODO blendFunc = 'linear'
        final = implicitCast(final);
        const parent = this.parent;
        const blender = blend(this, final, animate(duration));
        parent.replaceChild(this, blender);
        blender.notify();
        return final;
    }

    _blendFrom(final, duration = 500, interpolator = null) {
        final = implicitCast(final);
        const parent = this.parent;
        const blender = blend(final, this, animate(duration), interpolator);
        parent.replaceChild(this, blender);
        blender.notify();
    }

    /**
     * @returns a list with the expression children
     */
    _getChildren() {
        return this.childrenNames.map(name => this[name]);
    }

    _getMinimumNeededSchema() {
        // Depth First Search => reduce using union
        return this._getChildren().map(child => child._getMinimumNeededSchema()).reduce(schema.union, schema.IDENTITY);
    }
    // eslint-disable-next-line no-unused-vars
    eval(feature) {
        throw new Error('Unimplemented');
    }
}
