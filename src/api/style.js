import * as util from './util';
import * as s from '../core/style/functions';
import * as schema from '../core/schema';
import * as shaders from '../core/shaders';
import { compileShader } from '../core/style/shader-compiler';
import { parseStyleDefinition } from '../core/style/parser';
import Expression from '../core/style/expressions/expression';
import CartoValidationError from './error-handling/carto-validation-error';


const DEFAULT_RESOLUTION = 1;
const DEFAULT_COLOR_EXPRESSION = s.rgba(0, 1, 0, 0.5);
const DEFAULT_WIDTH_EXPRESSION = s.float(5);
const DEFAULT_STROKE_COLOR_EXPRESSION = s.rgba(0, 1, 0, 0.5);
const DEFAULT_STROKE_WIDTH_EXPRESSION = s.float(0);
const DEFAULT_ORDER_EXPRESSION = s.noOrder();
const DEFAULT_FILTER_EXPRESSION = s.float(1);
const SUPPORTED_PROPERTIES = [
    'resolution',
    'color',
    'width',
    'strokeColor',
    'strokeWidth',
    'order',
    'filter'
];

/**
 * @description A Style defines how associated dataframes of a particular renderer should be renderer.
 *
 * Styles are only compatible with dataframes that comply with the same schema.
 * The schema is the interface that a dataframe must comply with.
 */

export default class Style {

    /**
     * Create a carto.Style.
     *
     * @param {string|StyleSpec} definition - The definition of a style. This parameter could be a `string` or a `StyleSpec` object
     *
     * @example
     * new carto.Style(`
     *   color: rgb(0,0,0)
     * `);
     *
     * new carto.Style({
     *   color: carto.style.expression.rgb(0,0,0)
     * });
     *
     * @fires CartoError
     *
     * @constructor Style
     * @memberof carto
     * @api
     */
    constructor(definition) {
        const styleSpec = this._getStyleDefinition(definition);
        this._checkStyleSpec(styleSpec);
        this._styleSpec = styleSpec;

        this.updated = true;
        this._changeCallback = null;
        this._styleSpec.color.parent = this;
        this._styleSpec.width.parent = this;
        this._styleSpec.strokeColor.parent = this;
        this._styleSpec.strokeWidth.parent = this;
        this._styleSpec.order.parent = this;
        this._styleSpec.filter.parent = this;
        this._styleSpec.color.notify = this._changed.bind(this);
        this._styleSpec.width.notify = this._changed.bind(this);
        this._styleSpec.strokeColor.notify = this._changed.bind(this);
        this._styleSpec.strokeWidth.notify = this._changed.bind(this);
        this._styleSpec.order.notify = this._changed.bind(this);
        this._styleSpec.filter.notify = this._changed.bind(this);
    }

    /**
     * Return the resolution.
     *
     * @return {number}
     *
     * @memberof carto.Style
     * @api
     */
    getResolution() {
        return this._styleSpec.resolution;
    }

    /**
     * Return the color expression.
     *
     * @return {carto.style.expression}
     *
     * @memberof carto.Style
     * @api
     */
    getColor() {
        return this._styleSpec.color;
    }

    /**
     * Return the width expression.
     *
     * @return {carto.style.expression}
     *
     * @memberof carto.Style
     * @api
     */
    getWidth() {
        return this._styleSpec.width;
    }

    /**
     * Return the strokeColor expression.
     *
     * @return {carto.style.expression}
     *
     * @memberof carto.Style
     * @api
     */
    getStrokeColor() {
        return this._styleSpec.strokeColor;
    }

    /**
     * Return the strokeWidth expression.
     *
     * @return {carto.style.expression}
     *
     * @memberof carto.Style
     * @api
     */
    getStrokeWidth() {
        return this._styleSpec.strokeWidth;
    }

    /**
     * Return the order expression.
     *
     * @return {carto.style.expression}
     *
     * @memberof carto.Style
     * @api
     */
    getOrder() {
        return this._styleSpec.order;
    }

    get filter(){
        return this._styleSpec.filter;
    }

    isAnimated() {
        return this.getColor().isAnimated() ||
               this.getWidth().isAnimated() ||
               this.getStrokeColor().isAnimated() ||
               this.getStrokeWidth().isAnimated() ||
               this.filter.isAnimated();
    }

    onChange(callback) {
        this._changeCallback = callback;
    }

    _changed() {
        if (this._changeCallback) {
            this._changeCallback();
        }
    }

    getMinimumNeededSchema() {
        const exprs = [
            this._styleSpec.color,
            this._styleSpec.width,
            this._styleSpec.strokeColor,
            this._styleSpec.strokeWidth,
            this._styleSpec.filter,
        ].filter(x => x && x._getMinimumNeededSchema);
        return exprs.map(expr => expr._getMinimumNeededSchema()).reduce(schema.union, schema.IDENTITY);
    }

    _compileColorShader(gl, metadata) {
        this._styleSpec.color._bind(metadata);
        const r = compileShader(gl, this._styleSpec.color, shaders.styler.createColorShader);
        this.propertyColorTID = r.tid;
        this.colorShader = r.shader;
    }

    _compileWidthShader(gl, metadata) {
        this._styleSpec.width._bind(metadata);
        const r = compileShader(gl, this._styleSpec.width, shaders.styler.createWidthShader);
        this.propertyWidthTID = r.tid;
        this.widthShader = r.shader;
    }

    _compileStrokeColorShader(gl, metadata) {
        this._styleSpec.strokeColor._bind(metadata);
        const r = compileShader(gl, this._styleSpec.strokeColor, shaders.styler.createColorShader);
        this.propertyStrokeColorTID = r.tid;
        this.strokeColorShader = r.shader;
    }

    _compileStrokeWidthShader(gl, metadata) {
        this._styleSpec.strokeWidth._bind(metadata);
        const r = compileShader(gl, this._styleSpec.strokeWidth, shaders.styler.createWidthShader);
        this.propertyStrokeWidthTID = r.tid;
        this.strokeWidthShader = r.shader;
    }

    _compileFilterShader(gl, metadata) {
        this._styleSpec.filter._bind(metadata);
        const r = compileShader(gl, this._styleSpec.filter, shaders.styler.createFilterShader);
        this.propertyFilterTID = r.tid;
        this.filterShader = r.shader;
    }

    _replaceChild(toReplace, replacer) {
        if (toReplace == this._styleSpec.color) {
            this._styleSpec.color = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace == this._styleSpec.width) {
            this._styleSpec.width = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace == this._styleSpec.strokeColor) {
            this._styleSpec.strokeColor = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace == this._styleSpec.strokeWidth) {
            this._styleSpec.strokeWidth = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace == this._styleSpec.filter) {
            this._styleSpec.filter = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else {
            throw new Error('No child found');
        }
    }

    // ^^

    /**
     * This function checks the input parameter `definition` returning always an object.
     * If the `definition` is an object it returns the same object.
     * If the `definition` is a string it returns the parsed string as an object.
     * Otherwise it throws an error.
     *
     * @param  {string|object} definition
     * @return {StyleSpec}
     */
    _getStyleDefinition(definition) {
        if (util.isUndefined(definition)) {
            return this._setDefaults({});
        }
        if (util.isObject(definition)) {
            return this._setDefaults(definition);
        }
        if (util.isString(definition)) {
            return this._setDefaults(parseStyleDefinition(definition));
        }
        throw new CartoValidationError('style', 'nonValidDefinition');
    }

    /**
     * Add default values to a styleSpec object.
     *
     * @param {StyleSpec} styleSpec
     * @return {StyleSpec}
     */
    _setDefaults(styleSpec) {
        styleSpec.resolution = util.isUndefined(styleSpec.resolution) ? DEFAULT_RESOLUTION : styleSpec.resolution;
        styleSpec.color = styleSpec.color || DEFAULT_COLOR_EXPRESSION;
        styleSpec.width = styleSpec.width || DEFAULT_WIDTH_EXPRESSION;
        styleSpec.strokeColor = styleSpec.strokeColor || DEFAULT_STROKE_COLOR_EXPRESSION;
        styleSpec.strokeWidth = styleSpec.strokeWidth || DEFAULT_STROKE_WIDTH_EXPRESSION;
        styleSpec.order = styleSpec.order || DEFAULT_ORDER_EXPRESSION;
        styleSpec.filter = styleSpec.filter || DEFAULT_FILTER_EXPRESSION;
        return styleSpec;
    }

    _checkStyleSpec(styleSpec) {
        /**
         * @typedef {object} StyleSpec
         * @property {number} resolution
         * @property {carto.style.expression.Base} color
         * @property {carto.style.expression.Base} width
         * @property {carto.style.expression.Base} strokeColor
         * @property {carto.style.expression.Base} strokeWidth
         * @property {carto.style.expression.Base} order
         * @api
         */

        // TODO: Check expression types ie: color is not a number expression!

        if (!util.isNumber(styleSpec.resolution)) {
            throw new CartoValidationError('style', 'resolutionNumberRequired');
        }
        if (!(styleSpec.color instanceof Expression)) {
            throw new CartoValidationError('style', 'nonValidExpression[color]');
        }
        if (!(styleSpec.width instanceof Expression)) {
            throw new CartoValidationError('style', 'nonValidExpression[width]');
        }
        if (!(styleSpec.strokeColor instanceof Expression)) {
            throw new CartoValidationError('style', 'nonValidExpression[strokeColor]');
        }
        if (!(styleSpec.strokeWidth instanceof Expression)) {
            throw new CartoValidationError('style', 'nonValidExpression[strokeWidth]');
        }
        if (!(styleSpec.order instanceof Expression)) {
            throw new CartoValidationError('style', 'nonValidExpression[order]');
        }
        if (!(styleSpec.filter instanceof Expression)) {
            throw new CartoValidationError('style', 'nonValidExpression[filter]');
        }
        for (let key in styleSpec) {
            if (SUPPORTED_PROPERTIES.indexOf(key) === -1) {
                console.warn(`Property '${key}' is not supported`);
            }
        }
    }
}
