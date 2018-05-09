import * as util from './util';
import * as s from '../core/viz/functions';
import * as schema from '../core/schema';
import * as shaders from '../core/shaders';
import { compileShader } from '../core/viz/shader-compiler';
import { parseVizDefinition } from '../core/viz/parser';
import BaseExpression from '../core/viz/expressions/base';
import { implicitCast } from '../core/viz/expressions/utils';
import CartoValidationError from './error-handling/carto-validation-error';

const DEFAULT_COLOR_EXPRESSION = () => _markDefault(s.rgb(0, 0, 0));
const DEFAULT_WIDTH_EXPRESSION = () => _markDefault(s.number(1));
const DEFAULT_STROKE_COLOR_EXPRESSION = () => _markDefault(s.rgb(0, 0, 0));
const DEFAULT_STROKE_WIDTH_EXPRESSION = () => _markDefault(s.number(0));
const DEFAULT_ORDER_EXPRESSION = () => s.noOrder();
const DEFAULT_FILTER_EXPRESSION = () => s.constant(1);
const DEFAULT_RESOLUTION = () => 1;

const MIN_RESOLUTION = 0;
const MAX_RESOLUTION = 256;

const SUPPORTED_PROPERTIES = [
    'color',
    'width',
    'strokeColor',
    'strokeWidth',
    'order',
    'filter',
    'resolution',
    'variables'
];

export default class Viz {

    /**
    * A Viz is one of the core elements of CARTO VL and defines how the data will be displayed and processed.
    *
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

        Object.keys(vizSpec).forEach(property => {
            if (SUPPORTED_PROPERTIES.includes(property)) {
                this[property] = vizSpec[property];
            }
        });

        this.updated = true;
        this._changeCallback = null;

        this._updateRootExpressions();

        Object.keys(this.variables).map(varName => {
            this['__cartovl_variable_' + varName] = this.variables[varName];
        });

        this._resolveAliases();
        this._validateAliasDAG();
    }

    _getRootExpressions() {
        return [
            this.color,
            this.width,
            this.strokeColor,
            this.strokeWidth,
            this.order,
            this.filter,
            ...Object.values(this.variables)
        ];
    }

    _updateRootExpressions() {
        this._getRootExpressions().forEach(expr => {
            expr.parent = this;
            expr.notify = this._changed.bind(this);
        });
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
        return this.resolution;
    }

    /**
     * Return the color expression.
     *
     * @return {carto.expressions.Base}
     *
     * @memberof carto.Viz
     * @instance
     * @api
     */
    getColor() {
        return this.color;
    }

    /**
     * Return the width expression.
     *
     * @return {carto.expressions.Base}
     *
     * @memberof carto.Viz
     * @instance
     * @api
     */
    getWidth() {
        return this.width;
    }

    /**
     * Return the strokeColor expression.
     *
     * @return {carto.expressions.Base}
     *
     * @memberof carto.Viz
     * @instance
     * @api
     */
    getStrokeColor() {
        return this.strokeColor;
    }

    /**
     * Return the strokeWidth expression.
     *
     * @return {carto.expressions.Base}
     *
     * @memberof carto.Viz
     * @instance
     * @api
     */
    getStrokeWidth() {
        return this.strokeWidth;
    }

    /**
     * Return the order expression.
     *
     * @return {carto.expressions.Base}
     *
     * @memberof carto.Viz
     * @instance
     * @api
     */
    getOrder() {
        return this.order;
    }

    /**
     * Return the filter expression.
     *
     * @return {carto.expressions.Base}
     *
     * @memberof carto.Viz
     * @instance
     * @api
     */
    getFilter() {
        return this.filter;
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
        this._resolveAliases();
        this._validateAliasDAG();
        if (this._changeCallback) {
            this._changeCallback(this);
        }
    }

    getMinimumNeededSchema() {
        const exprs = [
            this.color,
            this.width,
            this.strokeColor,
            this.strokeWidth,
            this.filter,
        ].concat(Object.values(this.variables)).filter(x => x && x._getMinimumNeededSchema);
        return exprs.map(expr => expr._getMinimumNeededSchema()).reduce(schema.union, schema.IDENTITY);
    }

    compileShaders(gl, metadata) {
        this._compileColorShader(gl, metadata);
        this._compileWidthShader(gl, metadata);
        this._compileStrokeColorShader(gl, metadata);
        this._compileStrokeWidthShader(gl, metadata);
        this._compileFilterShader(gl, metadata);

        Object.values(this.variables).map(v => {
            v._bind(metadata);
        });
    }

    setDefaultsIfRequired(geomType) {
        let defaults = this._getDefaultGeomStyle(geomType);
        if (defaults) {
            if (this.color.default) {
                this.color = defaults.COLOR_EXPRESSION();
            }
            if (this.width.default) {
                this.width = defaults.WIDTH_EXPRESSION();
            }
            if (this.strokeColor.default) {
                this.strokeColor = defaults.STROKE_COLOR_EXPRESSION();
            }
            if (this.strokeWidth.default) {
                this.strokeWidth = defaults.STROKE_WIDTH_EXPRESSION();
            }
            this._updateRootExpressions();
        }
    }

    _getDefaultGeomStyle(geomType) {
        if (geomType === 'point') {
            return {
                COLOR_EXPRESSION: () => _markDefault(s.hex('#EE4D5A')),
                WIDTH_EXPRESSION: () => _markDefault(s.number(7)),
                STROKE_COLOR_EXPRESSION: () => _markDefault(s.hex('#FFF')),
                STROKE_WIDTH_EXPRESSION: () => _markDefault(s.number(1))
            };
        }
        if (geomType === 'line') {
            return {
                COLOR_EXPRESSION: () => _markDefault(s.hex('#4CC8A3')),
                WIDTH_EXPRESSION: () => _markDefault(s.number(1.5)),
                STROKE_COLOR_EXPRESSION: () => _markDefault(s.hex('#FFF')), // Not used in lines
                STROKE_WIDTH_EXPRESSION: () => _markDefault(s.number(1))  // Not used in lines
            };
        }
        if (geomType === 'polygon') {
            return {
                COLOR_EXPRESSION: () => _markDefault(s.hex('#826DBA')),
                WIDTH_EXPRESSION: () => _markDefault(s.number(1)), // Not used in polygons
                STROKE_COLOR_EXPRESSION: () => _markDefault(s.hex('#FFF')),
                STROKE_WIDTH_EXPRESSION: () => _markDefault(s.number(1))
            };
        }
    }

    _resolveAliases() {
        [
            this.color,
            this.width,
            this.strokeColor,
            this.strokeWidth,
            this.filter,
        ].concat(Object.values(this.variables)).forEach(expr =>
            expr._resolveAliases(this.variables)
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
            ...this.color._getDependencies(),
            ...this.strokeColor._getDependencies(),
            ...this.width._getDependencies(),
            ...this.strokeWidth._getDependencies(),
            ...this.filter._getDependencies()];
        while (unmarked.length) {
            visit(unmarked.pop());
        }
    }

    _compileColorShader(gl, metadata) {
        this.color._bind(metadata);
        const r = compileShader(gl, this.color, shaders.styler.createColorShader);
        this.propertyColorTID = r.tid;
        this.colorShader = r.shader;
    }

    _compileWidthShader(gl, metadata) {
        this.width._bind(metadata);
        const r = compileShader(gl, this.width, shaders.styler.createWidthShader);
        this.propertyWidthTID = r.tid;
        this.widthShader = r.shader;
    }

    _compileStrokeColorShader(gl, metadata) {
        this.strokeColor._bind(metadata);
        const r = compileShader(gl, this.strokeColor, shaders.styler.createColorShader);
        this.propertyStrokeColorTID = r.tid;
        this.strokeColorShader = r.shader;
    }

    _compileStrokeWidthShader(gl, metadata) {
        this.strokeWidth._bind(metadata);
        const r = compileShader(gl, this.strokeWidth, shaders.styler.createWidthShader);
        this.propertyStrokeWidthTID = r.tid;
        this.strokeWidthShader = r.shader;
    }

    _compileFilterShader(gl, metadata) {
        this.filter._bind(metadata);
        const r = compileShader(gl, this.filter, shaders.styler.createFilterShader);
        this.propertyFilterTID = r.tid;
        this.filterShader = r.shader;
    }

    replaceChild(toReplace, replacer) {
        if (Object.values(this.variables).includes(toReplace)) {
            const varName = Object.keys(this.variables).find(varName => this.variables[varName] == toReplace);
            this.variables[varName] = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace == this.color) {
            this.color = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace == this.width) {
            this.width = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace == this.strokeColor) {
            this.strokeColor = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace == this.strokeWidth) {
            this.strokeWidth = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace == this.filter) {
            this.filter = replacer;
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
        vizSpec.color = vizSpec.color || DEFAULT_COLOR_EXPRESSION();
        vizSpec.width = vizSpec.width || DEFAULT_WIDTH_EXPRESSION();
        vizSpec.strokeColor = vizSpec.strokeColor || DEFAULT_STROKE_COLOR_EXPRESSION();
        vizSpec.strokeWidth = vizSpec.strokeWidth || DEFAULT_STROKE_WIDTH_EXPRESSION();
        vizSpec.order = vizSpec.order || DEFAULT_ORDER_EXPRESSION();
        vizSpec.filter = vizSpec.filter || DEFAULT_FILTER_EXPRESSION();
        vizSpec.variables = vizSpec.variables || {};
        vizSpec.resolution = util.isUndefined(vizSpec.resolution) ? DEFAULT_RESOLUTION() : vizSpec.resolution;
        return vizSpec;
    }

    _checkVizSpec(vizSpec) {
        /**
         * A vizSpec object is used to create a {@link carto.Viz|Viz} and controling multiple aspects.
         * For a better understanding we recommend reading the {@link TODO|VIZ guide}
         * @typedef {object} VizSpec
         * @property {number} resolution - Control the aggregation level
         * @property {object} variables - An object describing the variables used.
         * @property {carto.expressions.Base} color - A `color` expression that controls the color of the elements.
         * @property {carto.expressions.Base} width - A  `numeric` expression that controls the width of the elements.
         * @property {carto.expressions.Base} strokeColor - A `color` expression that controls the stroke color of the elements.
         * @property {carto.expressions.Base} strokeWidth - A `numeric` expression that controls the with of the stroke of the elements.
         * @property {carto.expressions.Base} order - Define how the elements will be stacked
         * @property {carto.expressions.Base} filter - A `boolean` expression that controlls which elements will be shown.
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
        if (!(vizSpec.color instanceof BaseExpression)) {
            throw new CartoValidationError('viz', 'nonValidExpression[color]');
        }
        if (!(vizSpec.strokeColor instanceof BaseExpression)) {
            throw new CartoValidationError('viz', 'nonValidExpression[strokeColor]');
        }
        if (!(vizSpec.width instanceof BaseExpression)) {
            throw new CartoValidationError('viz', 'nonValidExpression[width]');
        }
        if (!(vizSpec.strokeWidth instanceof BaseExpression)) {
            throw new CartoValidationError('viz', 'nonValidExpression[strokeWidth]');
        }
        if (!(vizSpec.order instanceof BaseExpression)) {
            throw new CartoValidationError('viz', 'nonValidExpression[order]');
        }
        if (!(vizSpec.filter instanceof BaseExpression)) {
            throw new CartoValidationError('viz', 'nonValidExpression[filter]');
        }
        for (let key in vizSpec) {
            if (SUPPORTED_PROPERTIES.indexOf(key) === -1) {
                console.warn(`Property '${key}' is not supported`);
            }
        }
    }
}

/**
 * Mark default expressions to apply the style defaults for each
 * geometry (point, line, polygon) when available.
 */
function _markDefault(expression) {
    expression.default = true;
    return expression;
}
