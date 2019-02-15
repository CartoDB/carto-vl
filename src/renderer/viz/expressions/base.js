import { implicitCast } from './utils';
import { blend, transition } from '../expressions';
import * as schema from '../../schema';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../errors/carto-validation-error';
import CartoRuntimeError from '../../../errors/carto-runtime-error';

/**
 * CARTO VL Expression
 *
 * An expression is a function that is used to modify the visualization. All expressions are listed in  {@link carto.expressions}.
 *
 * Any expression can be used where an expression is required as long as the types match. This means that you can't use a numeric expression where a color expression is expected.
 *
 * @name Expression
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
        this.preface = '';
        this._shaderBindings = new Map();
        this.expressionName = _toCamelCase(this.constructor.name);
        this._variableName = null;
    }

    /**
     * Evaluate the expression providing a feature.
     * This is particularly useful for making legends.
     *
     * @memberof Expression
     * @param {Object} feature
     * @returns {} result - result of evaluating the expression for the input feature
     * @name eval
     * @api
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
        throw new CartoRuntimeError('Unimplemented');
    }

    /**
     * Get the expression value
     *
     * @api
     * @memberof Expression
     * @name value
     */
    get value () {
        return this.eval();
    }

    /**
     * Get the expression stringified
     *
     * @api
     * @returns {String} Stringified expression
     * @memberof Expression
     * @instance
     * @name toString
     *
     * @example <caption>Get the stringified expression of the viz color property.</caption>
     * const s = carto.expressions;
     * const viz = new carto.Viz({
     *   color: s.ramp(s.linear('amount'), s.palettes.PRISM)
     * });
     * console.log(viz.color.toString());
     * // logs: "ramp(linear($amount), Prism)"
     *
     * @example <caption>Get the stringified expression of the viz color property. (String)</caption>
     * const viz = new carto.Viz(`
     *   color: ramp(linear($amount), Prism)
     * `);
     *
     * console.log(viz.color.toString());
     * // logs: "ramp(linear($amount), Prism)"
     *
     */
    toString () {
        return `${this.expressionName}(${this._getChildren().map(child => child.toString()).join(', ')})`;
    }

    /**
     *
     * @api
     * @returns `true` if the evaluation of the expression may change without external action, `false` otherwise.
     * @memberof Expression
     * @instance
     * @name isAnimated
     */
    isAnimated () {
        return this._getChildren().some(child => child.isAnimated());
    }

    /**
     *
     * @api
     * @returns `true` if the expression it is currently changing
     * @memberof Expression
     * @instance
     * @name isPlaying
     */
    isPlaying () {
        return this._getChildren().some(child => child.isPlaying());
    }

    /**
     * Linear interpolate between `this` and `final` with the specified duration
     *
     * @api
     * @param {Expression|string} final - Viz Expression or string to parse for a Viz expression
     * @param {Expression} duration - duration of the transition in milliseconds
     * @param {Expression} blendFunc
     * @memberof Expression
     * @instance
     * @async
     * @name blendTo
     */
    async blendTo (final, duration = 500) {
        // The previous parsing of 'final' (if it is a string) is monkey-patched at parser.js to avoid a circular dependency
        final = implicitCast(final);
        this.keepDefaultsOnBlend && this.keepDefaultsOnBlend();
        const parent = this.parent;
        const blender = blend(this, final, transition(duration));
        parent.replaceChild(this, blender);
        blender.notify();
    }

    isA (expressionClass) {
        return this instanceof expressionClass;
    }

    notify () {
        return this.parent.notify();
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
        this._addParentToChildren();
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
        if (this.childrenNames === undefined) {
            this.childrenNames = [];
        }
        this.childrenNames.push(...Object.keys(children));

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
        replacer.notify().catch(() => { }); // ignore change rejections when using blend
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

function _toCamelCase (str) {
    if (str.toUpperCase() === str) {
        return str.toLowerCase();
    }
    return str.charAt(0).toLowerCase() + str.slice(1);
}
