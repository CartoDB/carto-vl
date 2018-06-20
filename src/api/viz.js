import * as util from './util';
import * as s from '../core/viz/functions';
import * as schema from '../core/schema';
import * as shaders from '../core/shaders';
import { compileShader } from '../core/viz/shader-compiler';
import { parseVizDefinition } from '../core/viz/parser';
import BaseExpression from '../core/viz/expressions/base';
import { implicitCast } from '../core/viz/expressions/utils';
import CartoValidationError from './error-handling/carto-validation-error';
import { symbolizerGLSL } from '../core/shaders/symbolizer';

const DEFAULT_COLOR_EXPRESSION = () => _markDefault(s.rgb(0, 0, 0));
const DEFAULT_WIDTH_EXPRESSION = () => _markDefault(s.number(1));
const DEFAULT_STROKE_COLOR_EXPRESSION = () => _markDefault(s.rgb(0, 0, 0));
const DEFAULT_STROKE_WIDTH_EXPRESSION = () => _markDefault(s.number(0));
const DEFAULT_ORDER_EXPRESSION = () => s.noOrder();
const DEFAULT_FILTER_EXPRESSION = () => s.constant(1);
const DEFAULT_SYMBOL_EXPRESSION = () => { const expr = s.FALSE; expr._default = true; return expr; };
const DEFAULT_SYMBOLPLACEMENT_EXPRESSION = () => s.ALIGN_BOTTOM;
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
    'symbol',
    'symbolPlacement',
    'resolution',
    'variables'
];

export default class Viz {

    /**
    * A Viz is one of the core elements of CARTO VL and defines how the data will be styled,
    * displayed and processed.
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
    *
    * @property {Color} color - fill color of points and polygons and color of lines
    * @property {Number} width - fill diameter of points, thickness of lines, not applicable to polygons
    * @property {Color} strokeColor - stroke/border color of points and polygons, not applicable to lines
    * @property {Number} strokeWidth - stroke width of points and polygons, not applicable to lines
    * @property {Number} filter - filter features by removing from rendering and interactivity all the features that don't pass the test
    * @IGNOREproperty {Order} order - rendering order of the features, only applicable to points
    * @property {number} resolution - resolution of the property-aggregation functions, a value of 4 means to produce aggregation on grid cells of 4x4 pixels, only applicable to points
    * @property {object} variables - An object describing the variables used.
    *
    */
    constructor(definition) {
        const vizSpec = this._getVizDefinition(definition);
        this._checkVizSpec(vizSpec);

        Object.keys(vizSpec).forEach(property => {
            this._defineProperty(property, vizSpec[property]);
        });
        if (!Object.keys(vizSpec).includes('variables')) {
            this._defineProperty('variables', {});
        }

        this.updated = true;
        this._changeCallback = null;

        this._updateRootExpressions();

        this._resolveAliases();
        this._validateAliasDAG();
    }

    loadSprites() {
        return Promise.all(this._getRootExpressions().map(expr => expr.loadSprites()));
    }

    // Define a viz property, setting all the required getters, setters and creating a proxy for the variables object
    // These setters and the proxy allow us to re-render without requiring further action from the user
    _defineProperty(propertyName, propertyValue) {
        if (!SUPPORTED_PROPERTIES.includes(propertyName)) {
            return;
        }
        Object.defineProperty(this, propertyName, {
            get: () => this['_' + propertyName],
            set: expr => {
                if (propertyName != 'resolution') {
                    expr = implicitCast(expr);
                }
                this['_' + propertyName] = expr;
                this._changed();
            },
        });

        let property = propertyValue;
        if (propertyName == 'variables') {
            let init = false;
            const handler = {
                get: (obj, prop) => {
                    return obj[prop];
                },
                set: (obj, prop, value) => {
                    value = implicitCast(value);
                    obj[prop] = value;
                    this['__cartovl_variable_' + prop] = value;
                    if (init) {
                        this._changed();
                    }
                    return true;
                }
            };
            property = new Proxy({}, handler);
            Object.keys(propertyValue).map(varName => {
                property[varName] = propertyValue[varName];
            });
            init = true;
        }
        this['_' + propertyName] = property;
    }

    _getRootExpressions() {
        return [
            this.color,
            this.width,
            this.strokeColor,
            this.strokeWidth,
            this.order,
            this.filter,
            this.symbol,
            this.symbolPlacement,
            ...Object.values(this.variables)
        ];
    }

    _updateRootExpressions() {
        this._getRootExpressions().forEach(expr => {
            expr.parent = this;
            expr.notify = this._changed.bind(this);
        });
    }

    isAnimated() {
        return this.color.isAnimated() ||
            this.width.isAnimated() ||
            this.strokeColor.isAnimated() ||
            this.strokeWidth.isAnimated() ||
            this.filter.isAnimated() ||
            this.symbol.isAnimated() ||
            this.symbolPlacement.isAnimated();
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
        const exprs = this._getRootExpressions().filter(x => x && x._getMinimumNeededSchema);
        return exprs.map(expr => expr._getMinimumNeededSchema()).reduce(schema.union, schema.IDENTITY);
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
            this.symbol,
            this.symbolPlacement
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
            ...this.filter._getDependencies(),
            ...this.symbol._getDependencies(),
            ...this.symbolPlacement._getDependencies()];
        while (unmarked.length) {
            visit(unmarked.pop());
        }
    }

    compileShaders(gl, metadata) {
        this.color._bind(metadata);
        this.width._bind(metadata);
        this.strokeColor._bind(metadata);
        this.strokeWidth._bind(metadata);
        this.symbol._bind(metadata);
        this.filter._bind(metadata);

        this.colorShader = compileShader(gl, shaders.styleColorGLSL, { color: this.color });
        this.widthShader = compileShader(gl, shaders.styleWidthGLSL, { width: this.width });
        this.strokeColorShader = compileShader(gl, shaders.styleColorGLSL, { color: this.strokeColor });
        this.strokeWidthShader = compileShader(gl, shaders.styleWidthGLSL, { width: this.strokeWidth });
        this.filterShader = compileShader(gl, shaders.styleFilterGLSL, { filter: this.filter });

        this.symbolPlacement._bind(metadata);
        if (!this.symbol._default) {
            this.symbolShader = compileShader(gl, symbolizerGLSL, {
                symbol: this.symbol,
                symbolPlacement: this.symbolPlacement
            });
        }
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
        } else if (toReplace == this.symbol) {
            this.symbol = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace == this.symbolPlacement) {
            this.symbolPlacement = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else {
            throw new Error('No child found');
        }
    }

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
        if (util.isUndefined(vizSpec.color)) {
            vizSpec.color = DEFAULT_COLOR_EXPRESSION();
        }
        if (util.isUndefined(vizSpec.width)) {
            vizSpec.width = DEFAULT_WIDTH_EXPRESSION();
        }
        if (util.isUndefined(vizSpec.strokeColor)) {
            vizSpec.strokeColor = DEFAULT_STROKE_COLOR_EXPRESSION();
        }
        if (util.isUndefined(vizSpec.strokeWidth)) {
            vizSpec.strokeWidth = DEFAULT_STROKE_WIDTH_EXPRESSION();
        }
        if (util.isUndefined(vizSpec.order)) {
            vizSpec.order = DEFAULT_ORDER_EXPRESSION();
        }
        if (util.isUndefined(vizSpec.filter)) {
            vizSpec.filter = DEFAULT_FILTER_EXPRESSION();
        }
        if (util.isUndefined(vizSpec.resolution)) {
            vizSpec.resolution = DEFAULT_RESOLUTION();
        }
        if (util.isUndefined(vizSpec.symbol)) {
            vizSpec.symbol = DEFAULT_SYMBOL_EXPRESSION();
        }
        if (util.isUndefined(vizSpec.symbolPlacement)) {
            vizSpec.symbolPlacement = DEFAULT_SYMBOLPLACEMENT_EXPRESSION();
        }
        vizSpec.variables = vizSpec.variables || {};
        return vizSpec;
    }

    _checkVizSpec(vizSpec) {
        /**
         * A vizSpec object is used to create a {@link carto.Viz|Viz} and controlling multiple aspects.
         * For a better understanding we recommend reading the {@link TODO|VIZ guide}
         * @typedef {object} VizSpec
         * @property {Color} color - fill color of points and polygons and color of lines
         * @property {Number} width - fill diameter of points, thickness of lines, not applicable to polygons
         * @property {Color} strokeColor - stroke/border color of points and polygons, not applicable to lines
         * @property {Number} strokeWidth - stroke width of points and polygons, not applicable to lines
         * @property {Number} filter - filter features by removing from rendering and interactivity all the features that don't pass the test
         * @IGNOREproperty {Order} order - rendering order of the features, only applicable to points
         * @property {number} resolution - resolution of the property-aggregation functions, a value of 4 means to produce aggregation on grid cells of 4x4 pixels, only applicable to points
         * @property {object} variables - An object describing the variables used.
         * @api
         */

        // TODO: Check expression types ie: color is not a number expression!

        // Apply implicit cast to numeric style properties
        vizSpec.width = implicitCast(vizSpec.width);
        vizSpec.strokeWidth = implicitCast(vizSpec.strokeWidth);
        vizSpec.symbolPlacement = implicitCast(vizSpec.symbolPlacement);
        vizSpec.symbol = implicitCast(vizSpec.symbol);
        vizSpec.filter = implicitCast(vizSpec.filter);

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
        if (!(vizSpec.symbol instanceof BaseExpression)) {
            throw new CartoValidationError('viz', 'nonValidExpression[symbol]');
        }
        if (!(vizSpec.symbolPlacement instanceof BaseExpression)) {
            throw new CartoValidationError('viz', 'nonValidExpression[symbolPlacement]');
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
