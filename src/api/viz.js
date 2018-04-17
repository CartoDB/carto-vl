import * as util from './util';
import * as s from '../core/viz/functions';
import * as schema from '../core/schema';
import * as shaders from '../core/shaders';
import { compileShader } from '../core/viz/shader-compiler';
import { parseVizDefinition } from '../core/viz/parser';
import Expression from '../core/viz/expressions/expression';
import { implicitCast } from '../core/viz/expressions/utils';
import CartoValidationError from './error-handling/carto-validation-error';

const DEFAULT_RESOLUTION = () => 1;
const DEFAULT_COLOR_EXPRESSION = () => s.rgba(0, 255, 0, 0.5);
const DEFAULT_WIDTH_EXPRESSION = () => s.float(5);
const DEFAULT_STROKE_COLOR_EXPRESSION = () => s.rgba(0, 255, 0, 0.5);
const DEFAULT_STROKE_WIDTH_EXPRESSION = () => s.float(0);
const DEFAULT_ORDER_EXPRESSION = () => s.noOrder();
const DEFAULT_FILTER_EXPRESSION = () => s.floatConstant(1);

const MIN_RESOLUTION = 0;
const MAX_RESOLUTION = 256;

const SUPPORTED_PROPERTIES = [
    'resolution',
    'color',
    'width',
    'strokeColor',
    'strokeWidth',
    'order',
    'filter',
    'variables'
];

export default class Viz {

    /**
    * A Viz defines how the data will be displayed: the color of the elements and size are basic things that can be
    * managed through vizs. Vizs also control the element visibility, ordering or aggregation level.
    *
    * A Viz is created from an {@link VizSpec|VizSpec} object or from a string.
    * Each attribute in the {@link VizSpec|VizSpec} must be a valid {@link carto.expressions|expression}.
    * Those expressions will be evaluated dynamically for every element in the dataset.
    *
    * @param {string|VizSpec} definition - The definition of a viz. This parameter could be a `string` or a `VizSpec` object
    *
    * @example <caption> Create a viz with black dots using the string constructor </caption>
    * const viz = new carto.Viz(`
    *   color: rgb(0,0,0)
    * `);
    *
    * @example <caption> Create a viz with black dots using the vizSpec constructor </caption>
    * const viz = new carto.Viz({
    *   color: carto.expressions.rgb(0,0,0)
    * });
    *
    * @fires CartoError
    *
    * @constructor Viz
    * @memberof carto
    * @api
    */
    constructor(definition) {
        const vizSpec = this._getVizDefinition(definition);
        this._checkVizSpec(vizSpec);
        this._vizSpec = vizSpec;

        this.updated = true;
        this._changeCallback = null;

        this._getRootExpressions().forEach(expr => {
            expr.parent = this;
            expr.notify = this._changed.bind(this);
        });

        Object.keys(this._vizSpec.variables).map(varName => {
            this._vizSpec['__cartovl_variable_' + varName] = this._vizSpec.variables[varName];
        });

        this._resolveAliases();
        this._validateAliasDAG();
    }

    _getRootExpressions() {
        return [
            this._vizSpec.color,
            this._vizSpec.width,
            this._vizSpec.strokeColor,
            this._vizSpec.strokeWidth,
            this._vizSpec.order,
            this._vizSpec.filter,
            ...Object.values(this._vizSpec.variables)
        ];
    }

    /**
     * Return the resolution.
     *
     * @return {number}
     *
     * @memberof carto.Viz
     * @instance
     * @api
     */
    getResolution() {
        return this._vizSpec.resolution;
    }

    /**
     * Return the color expression.
     *
     * @return {carto.expressions.Expression}
     *
     * @memberof carto.Viz
     * @instance
     * @api
     */
    getColor() {
        return this._vizSpec.color;
    }

    /**
     * Return the width expression.
     *
     * @return {carto.expressions.Expression}
     *
     * @memberof carto.Viz
     * @instance
     * @api
     */
    getWidth() {
        return this._vizSpec.width;
    }

    /**
     * Return the strokeColor expression.
     *
     * @return {carto.expressions.Expression}
     *
     * @memberof carto.Viz
     * @instance
     * @api
     */
    getStrokeColor() {
        return this._vizSpec.strokeColor;
    }

    /**
     * Return the strokeWidth expression.
     *
     * @return {carto.expressions.Expression}
     *
     * @memberof carto.Viz
     * @instance
     * @api
     */
    getStrokeWidth() {
        return this._vizSpec.strokeWidth;
    }

    /**
     * Return the order expression.
     *
     * @return {carto.expressions.Expression}
     *
     * @memberof carto.Viz
     * @instance
     * @api
     */
    getOrder() {
        return this._vizSpec.order;
    }

    /**
     * Return the filter expression.
     *
     * @return {carto.expressions.Expression}
     *
     * @memberof carto.Viz
     * @instance
     * @api
     */
    getFilter() {
        return this._vizSpec.filter;
    }

    isAnimated() {
        return this.getColor().isAnimated() ||
            this.getWidth().isAnimated() ||
            this.getStrokeColor().isAnimated() ||
            this.getStrokeWidth().isAnimated() ||
            this.getFilter().isAnimated();
    }

    onChange(callback) {
        this._changeCallback = callback;
    }

    _changed() {
        if (this._changeCallback) {
            this._changeCallback(this);
        }
    }

    getMinimumNeededSchema() {
        const exprs = [
            this._vizSpec.color,
            this._vizSpec.width,
            this._vizSpec.strokeColor,
            this._vizSpec.strokeWidth,
            this._vizSpec.filter,
        ].concat(Object.values(this._vizSpec.variables)).filter(x => x && x._getMinimumNeededSchema);
        return exprs.map(expr => expr._getMinimumNeededSchema()).reduce(schema.union, schema.IDENTITY);
    }

    compileShaders(gl, metadata) {
        this._compileColorShader(gl, metadata);
        this._compileWidthShader(gl, metadata);
        this._compileStrokeColorShader(gl, metadata);
        this._compileStrokeWidthShader(gl, metadata);
        this._compileFilterShader(gl, metadata);

        Object.values(this._vizSpec.variables).map(v => {
            v._bind(metadata);
        });
    }


    _resolveAliases() {
        [
            this._vizSpec.color,
            this._vizSpec.width,
            this._vizSpec.strokeColor,
            this._vizSpec.strokeWidth,
            this._vizSpec.filter,
        ].concat(Object.values(this._vizSpec.variables)).forEach(expr =>
            expr._resolveAliases(this._vizSpec.variables)
        );
    }

    _validateAliasDAG() {
        const permanentMarkedSet = new Set();
        const temporarilyMarkedSet = new Set();
        const visit = node => {
            if (permanentMarkedSet.has(node)) {
                // Node is already a processed dependency
                return;
            }
            if (temporarilyMarkedSet.has(node)) {
                throw new Error('Viz contains a circular dependency');
            }
            temporarilyMarkedSet.add(node);
            node._getDependencies().forEach(visit);
            permanentMarkedSet.add(node);
        };
        const unmarked = [
            ...this._vizSpec.color._getDependencies(),
            ...this._vizSpec.strokeColor._getDependencies(),
            ...this._vizSpec.width._getDependencies(),
            ...this._vizSpec.strokeWidth._getDependencies(),
            ...this._vizSpec.filter._getDependencies()];
        while (unmarked.length) {
            visit(unmarked.pop());
        }
    }

    _compileColorShader(gl, metadata) {
        this._vizSpec.color._bind(metadata);
        const r = compileShader(gl, this._vizSpec.color, shaders.styler.createColorShader);
        this.propertyColorTID = r.tid;
        this.colorShader = r.shader;
    }

    _compileWidthShader(gl, metadata) {
        this._vizSpec.width._bind(metadata);
        const r = compileShader(gl, this._vizSpec.width, shaders.styler.createWidthShader);
        this.propertyWidthTID = r.tid;
        this.widthShader = r.shader;
    }

    _compileStrokeColorShader(gl, metadata) {
        this._vizSpec.strokeColor._bind(metadata);
        const r = compileShader(gl, this._vizSpec.strokeColor, shaders.styler.createColorShader);
        this.propertyStrokeColorTID = r.tid;
        this.strokeColorShader = r.shader;
    }

    _compileStrokeWidthShader(gl, metadata) {
        this._vizSpec.strokeWidth._bind(metadata);
        const r = compileShader(gl, this._vizSpec.strokeWidth, shaders.styler.createWidthShader);
        this.propertyStrokeWidthTID = r.tid;
        this.strokeWidthShader = r.shader;
    }

    _compileFilterShader(gl, metadata) {
        this._vizSpec.filter._bind(metadata);
        const r = compileShader(gl, this._vizSpec.filter, shaders.styler.createFilterShader);
        this.propertyFilterTID = r.tid;
        this.filterShader = r.shader;
    }

    replaceChild(toReplace, replacer) {
        if (Object.values(this._vizSpec.variables).includes(toReplace)) {
            const varName = Object.keys(this._vizSpec.variables).find(varName => this._vizSpec.variables[varName] == toReplace);
            this._vizSpec.variables[varName] = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
            this._resolveAliases();
            this._validateAliasDAG();
        } else if (toReplace == this._vizSpec.color) {
            this._vizSpec.color = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace == this._vizSpec.width) {
            this._vizSpec.width = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace == this._vizSpec.strokeColor) {
            this._vizSpec.strokeColor = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace == this._vizSpec.strokeWidth) {
            this._vizSpec.strokeWidth = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace == this._vizSpec.filter) {
            this._vizSpec.filter = replacer;
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
     * @return {VizSpec}
     */
    _getVizDefinition(definition) {
        if (util.isUndefined(definition)) {
            return this._setDefaults({});
        }
        if (util.isObject(definition)) {
            return this._setDefaults(definition);
        }
        if (util.isString(definition)) {
            return this._setDefaults(parseVizDefinition(definition));
        }
        throw new CartoValidationError('viz', 'nonValidDefinition');
    }

    /**
     * Add default values to a vizSpec object.
     *
     * @param {VizSpec} vizSpec
     * @return {VizSpec}
     */
    _setDefaults(vizSpec) {
        vizSpec.resolution = util.isUndefined(vizSpec.resolution) ? DEFAULT_RESOLUTION() : vizSpec.resolution;
        vizSpec.color = vizSpec.color || DEFAULT_COLOR_EXPRESSION();
        vizSpec.width = vizSpec.width || DEFAULT_WIDTH_EXPRESSION();
        vizSpec.strokeColor = vizSpec.strokeColor || DEFAULT_STROKE_COLOR_EXPRESSION();
        vizSpec.strokeWidth = vizSpec.strokeWidth || DEFAULT_STROKE_WIDTH_EXPRESSION();
        vizSpec.order = vizSpec.order || DEFAULT_ORDER_EXPRESSION();
        vizSpec.filter = vizSpec.filter || DEFAULT_FILTER_EXPRESSION();
        vizSpec.variables = vizSpec.variables || {};
        return vizSpec;
    }

    _checkVizSpec(vizSpec) {
        /**
         * @typedef {object} VizSpec
         * @property {number} resolution
         * @property {carto.expressions.Expression} color
         * @property {carto.expressions.Expression} width
         * @property {carto.expressions.Expression} strokeColor
         * @property {carto.expressions.Expression} strokeWidth
         * @property {carto.expressions.Expression} order
         * @property {carto.expressions.Expression} filter
         * @api
         */

        // TODO: Check expression types ie: color is not a number expression!

        vizSpec.width = implicitCast(vizSpec.width);
        vizSpec.strokeWidth = implicitCast(vizSpec.strokeWidth);

        if (!util.isNumber(vizSpec.resolution)) {
            throw new CartoValidationError('viz', 'resolutionNumberRequired');
        }
        if (vizSpec.resolution <= MIN_RESOLUTION) {
            throw new CartoValidationError('viz', `resolutionTooSmall[${MIN_RESOLUTION}]`);
        }
        if (vizSpec.resolution >= MAX_RESOLUTION) {
            throw new CartoValidationError('viz', `resolutionTooBig[${MAX_RESOLUTION}]`);
        }
        if (!(vizSpec.color instanceof Expression)) {
            throw new CartoValidationError('viz', 'nonValidExpression[color]');
        }
        if (!(vizSpec.strokeColor instanceof Expression)) {
            throw new CartoValidationError('viz', 'nonValidExpression[strokeColor]');
        }
        if (!(vizSpec.width instanceof Expression)) {
            throw new CartoValidationError('viz', 'nonValidExpression[width]');
        }
        if (!(vizSpec.strokeWidth instanceof Expression)) {
            throw new CartoValidationError('viz', 'nonValidExpression[strokeWidth]');
        }
        if (!(vizSpec.order instanceof Expression)) {
            throw new CartoValidationError('viz', 'nonValidExpression[order]');
        }
        if (!(vizSpec.filter instanceof Expression)) {
            throw new CartoValidationError('viz', 'nonValidExpression[filter]');
        }
        for (let key in vizSpec) {
            if (SUPPORTED_PROPERTIES.indexOf(key) === -1) {
                console.warn(`Property '${key}' is not supported`);
            }
        }
    }
}
