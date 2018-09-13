import { implicitCast } from './utils';
import { blend, transition } from '../expressions';
import * as schema from '../../schema';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../errors/carto-validation-error';

/**
 * Abstract expression class
 *
 * All expressions listed in  {@link carto.expressions} inherit from this class so any of them
 * can be used where an Expression is required as long as the types match.
 *
 * This means that you can't use a numeric expression where a color expression is expected.
 *
 * @memberof carto.expressions
 * @name Base
 * @abstract
 * @hideconstructor
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
    constructor (children) {
        this._initializeChildren(children);
        this._addParentToChildren();
        this.preface = '';
        this._shaderBindings = new Map();
    }

    // eslint-disable-next-line no-unused-vars
    /**
     * Evaluate the expression providing a feature.
     * This is particularly useful for making legends.
     *
     * @api
     * @memberof carto.expressions.Base
     * @param {object} feature
     * @returns {*} result - result of evaluating the expression for the input feature
     *
     * @example
     * const viz = new carto.Viz(`
     *      color: red
     *      width: sqrt($amount)
     * `);
     *
     * const r = viz.width.eval({
     *      amount: 16
     * });
     *
     * // `r` value is `4`
     *
     * @example
     * const viz = new carto.Viz(`
     *      color: ramp(linear($amount), Emrld)
     * `);
     *
     * const color = viz.color.eval({
     *      amount: 123
     * });
     *
     * // `color` will have the same color as the features with an amount of 123
     *
     */
    eval (feature) {
        throw new Error('Unimplemented');
    }

    /**
     * @api
     * @memberof carto.expressions.Base
     * @returns true if the evaluation of the expression may change without external action.
     */
    isAnimated () {
        return this._getChildren().some(child => child.isAnimated());
    }

    /**
     * Linear interpolation between this and finalValue with the specified duration
     * @api
     * @param {Expression|string} final - Viz Expression or string to parse for a Viz expression
     * @param {Expression} duration - duration of the transition in milliseconds
     * @param {Expression} blendFunc
     * @memberof carto.expressions.Base
     * @instance
     * @name blendTo
     */
    blendTo (final, duration = 500) {
        // The parsing of the string (if any) is monkey patched at parser.js to avoid a circular dependency
        final = implicitCast(final);
        const parent = this.parent;
        const blender = blend(this, final, transition(duration));
        parent.replaceChild(this, blender);
        blender.notify();
        return final;
    }

    isA (expressionClass) {
        return this instanceof expressionClass;
    }

    notify () {
        this.parent.notify();
    }

    accumViewportAgg (feature) {
        this._getChildren().forEach(child => child.accumViewportAgg(feature));
    }

    loadImages () {
        return Promise.all(this._getChildren().map(child => child.loadImages()));
    }

    _bindMetadata (metadata) {
        this._getChildren().forEach(child => child._bindMetadata(metadata));
    }

    _initializeChildren (children) {
        if (Array.isArray(children)) {
            this._initializeChildrenArray(children);
        } else {
            this._initializeChildrenObject(children);
        }
    }

    _initializeChildrenArray (children) {
        if (this.maxParameters && this.maxParameters < children.length) {
            throw new CartoValidationError(
                `${cvt.TOO_MANY_ARGS} Extra parameters, got ${children.length} but maximum is ${this.maxParameters}`
            );
        }

        this.childrenNames = [];

        children.map((child, index) => {
            const childName = `${child.type}-${index}`;
            this.childrenNames.push(childName);
            this[childName] = implicitCast(child);
        });
    }

    _initializeChildrenObject (children) {
        this.childrenNames = Object.keys(children);

        if (this.maxParameters && this.maxParameters < this.childrenNames.length) {
            throw new CartoValidationError(
                `${cvt.TOO_MANY_ARGS} Extra parameters, got ${this.childrenNames.length} but maximum is ${this.maxParameters}`
            );
        }

        Object.keys(children).map(name => {
            this[name] = implicitCast(children[name]);
        });
    }

    _addParentToChildren () {
        this._getChildren().map(child => {
            child.parent = this;
        });
    }

    _setUID (idGenerator) {
        this._uid = idGenerator.getID(this);
        this._getChildren().map(child => child._setUID(idGenerator));
    }

    _dataReady () {
        this._getChildren().map(child => child._dataReady());
    }

    isFeatureDependent () {
        return this._getChildren().some(child => child.isFeatureDependent());
    }

    _prefaceCode (glslCode) {
        return glslCode
            ? `\n${this._buildGLSLCode(glslCode)}\n`
            : '';
    }

    _buildGLSLCode (glslCode) {
        return `
            #ifndef DEF_${this._uid}
            #define DEF_${this._uid}
            ${glslCode}
            #endif`;
    }

    _getDependencies () {
        return this._getChildren().map(child => child._getDependencies()).reduce((x, y) => x.concat(y), []);
    }

    _resolveAliases (aliases) {
        this._getChildren().map(child => child._resolveAliases(aliases));
    }

    _setGenericGLSL (inlineMaker, preface) {
        this.inlineMaker = inlineMaker;
        this.preface = (preface || '');
    }

    // Generate GLSL code
    // @param {*} getGLSLforProperty  fn to get property IDs and inform of used properties
    _applyToShaderSource (getGLSLforProperty) {
        const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(getGLSLforProperty));
        let childInlines = {};
        childSources.map((source, index) => {
            childInlines[this.childrenNames[index]] = source.inline;
        });
        return {
            preface: this._prefaceCode(childSources.map(s => s.preface).reduce((a, b) => a + b, '') + this.preface),
            inline: this.inlineMaker(childInlines, getGLSLforProperty)
        };
    }

    // Inform about a successful shader compilation. One-time post-compilation WebGL calls should be done here.
    _postShaderCompile (program, gl) {
        this.childrenNames.forEach(name => this[name]._postShaderCompile(program, gl));
    }

    _getBinding (shader) {
        if (!this._shaderBindings.has(shader)) {
            this._shaderBindings.set(shader, {});
        }
        return this._shaderBindings.get(shader);
    }

    _resetViewportAgg (metadata) {
        this._getChildren().forEach(child => child._resetViewportAgg(metadata));
    }

    // Pre-rendering routine. Should establish the current timestamp in seconds since an arbitrary point in time as needed.
    // @param {number} timestamp
    _setTimestamp (timestamp) {
        this.childrenNames.forEach(name => this[name]._setTimestamp(timestamp));
    }

    // Pre-rendering routine. Should establish related WebGL state as needed.
    _preDraw (...args) {
        this.childrenNames.forEach(name => this[name]._preDraw(...args));
    }

    // Replace child *toReplace* by *replacer*
    replaceChild (toReplace, replacer) {
        const name = this.childrenNames.find(name => this[name] === toReplace);
        this[name] = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    }

    _blendFrom (final, duration = 500, interpolator = null) {
        if (this.default && final.default) {
            return;
        }
        final = implicitCast(final);
        const parent = this.parent;
        const blender = blend(final, this, transition(duration), interpolator);
        parent.replaceChild(this, blender);
        blender.notify();
    }

    _getChildren () {
        return this.childrenNames.map(name => this[name]);
    }

    _getMinimumNeededSchema () {
        // Depth First Search => reduce using union
        return this._getChildren().map(child => child._getMinimumNeededSchema()).reduce(schema.union, schema.IDENTITY);
    }
}
