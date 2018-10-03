import schema from './renderer/schema';
import shaders from './renderer/shaders/index';
import { compileShader } from './renderer/shaders/shaderCompiler';
import * as s from './renderer/viz/expressions';
import BaseExpression from './renderer/viz/expressions/base';
import { implicitCast } from './renderer/viz/expressions/utils';
import { parseVizDefinition } from './renderer/viz/parser';
import util from './utils/util';
import CartoValidationError, { CartoValidationTypes as cvt } from '../src/errors/carto-validation-error';
import CartoRuntimeError from '../src/errors/carto-runtime-error';
import pointVertexShaderGLSL from './renderer/shaders/geometry/point/pointVertexShader.glsl';
import pointFragmentShaderGLSL from './renderer/shaders/geometry/point/pointFragmentShader.glsl';
import lineVertexShaderGLSL from './renderer/shaders/geometry/line/lineVertexShader.glsl';
import lineFragmentShaderGLSL from './renderer/shaders/geometry/line/lineFragmentShader.glsl';
import polygonVertexShaderGLSL from './renderer/shaders/geometry/polygon/polygonVertexShader.glsl';
import polygonFragmentShaderGLSL from './renderer/shaders/geometry/polygon/polygonFragmentShader.glsl';
import SVG from './renderer/viz/expressions/SVG';
import svgs from './renderer/viz/defaultSVGs';
import Placement from './renderer/viz/expressions/Placement';
import Translate from './renderer/viz/expressions/transformation/Translate';

const DEFAULT_COLOR_EXPRESSION = () => _markDefault(s.rgb(0, 0, 0));
const DEFAULT_WIDTH_EXPRESSION = () => _markDefault(s.number(1));
const DEFAULT_STROKE_COLOR_EXPRESSION = () => _markDefault(s.rgb(0, 0, 0));
const DEFAULT_STROKE_WIDTH_EXPRESSION = () => _markDefault(s.number(0));
const DEFAULT_ORDER_EXPRESSION = () => _markDefault(s.noOrder());
const DEFAULT_FILTER_EXPRESSION = () => _markDefault(s.constant(1));
const DEFAULT_SYMBOL_EXPRESSION = () => _markDefault(new SVG(svgs.circle));
const DEFAULT_SYMBOLPLACEMENT_EXPRESSION = () => _markDefault(new Placement(s.constant(0), s.constant(1)));
const DEFAULT_TRANSFORM_EXPRESSION = () => _markDefault(new Translate(s.constant(0), s.constant(0)));
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
    'transform',
    'resolution',
    'variables'
];

/**
 * A vizSpec object is used to create a {@link carto.Viz|Viz} and controlling multiple aspects.
 * For a better understanding we recommend reading the {@link https://carto.com/developers/carto-vl/guides/introduction-to-expressions/|Introduction to Expressions guide}
 * @typedef {object} VizSpec
 * @property {Color} color - fill color of points and polygons and color of lines, if used with `symbol` the color will override the original image RGB channels
 * @property {Number} width - fill diameter of points, thickness of lines, not applicable to polygons
 * @property {Color} strokeColor - stroke/border color of points and polygons, not applicable to lines
 * @property {Number} strokeWidth - stroke width of points and polygons, not applicable to lines
 * @property {Number} filter - filter features by removing from rendering and interactivity all the features that don't pass the test. In combination with {@link carto.expressions.animation} temporal maps can be created.
 * @property {Image} symbol - show an image instead in the place of points. There is a list of built-in icons you can use by default in the {@link https://carto.com/developers/carto-vl/reference/#icons|Icons section}
 * @property {Placement} symbolPlacement - when using `symbol`, offset to apply to the image
 * @property {Translation} transform - translation to apply to the features in pixels
 * @property {Order} order - rendering order of the features, only applicable to points. See {@link carto.expressions.asc}, {@link carto.expressions.desc} and {@link carto.expressions.noOrder}
 * @property {number} resolution - resolution of the property-aggregation functions, only applicable to points. Default resolution is 1. Custom values must be greater than 0 and lower than 256. A resolution of N means points are aggregated to grid cells NxN pixels. Unlinke {@link https://carto.com/developers/torque-js/guides/how-spatial-aggregation-works/|Torque resolution}, the aggregated points are placed in the centroid of the cluster, not in the center of the grid cell.
 * @property {object} variables - An object describing the variables used.
 * @api
 */

export default class Viz {
    /**
    * A Viz is one of the core elements of CARTO VL and defines how the data will be styled,
    * displayed and processed. A Viz instance can only be bound to one layer.
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
    * @property {Color} color - fill color of points and polygons and color of lines, if used with `symbol` the color will override the original image RGB channels
    * @property {Number} width - fill diameter of points, thickness of lines, not applicable to polygons
    * @property {Color} strokeColor - stroke/border color of points and polygons, not applicable to lines
    * @property {Number} strokeWidth - stroke width of points and polygons, not applicable to lines
    * @property {Number} filter - filter features by removing from rendering and interactivity all the features that don't pass the test. In combination with {@link carto.expressions.animation} temporal maps can be created.
    * @property {Image} symbol - show an image instead in the place of points. There is a list of built-in icons you can use by default in the {@link https://carto.com/developers/carto-vl/reference/#icons|Icons section}
    * @property {Placement} symbolPlacement - when using `symbol`, offset to apply to the image
    * @property {Translation} transform - translation to apply to the features in pixels
    * @IGNOREproperty {Order} order - rendering order of the features, only applicable to points
    * @property {Order} order - rendering order of the features, only applicable to points. See {@link carto.expressions.asc}, {@link carto.expressions.desc} and {@link carto.expressions.noOrder}
    * @property {number} resolution - resolution of the property-aggregation functions, only applicable to points. Default resolution is 1. Custom values must be greater than 0 and lower than 256. A resolution of N means points are aggregated to grid cells NxN pixels. Unlinke {@link https://carto.com/developers/torque-js/guides/how-spatial-aggregation-works/|Torque resolution}, the aggregated points are placed in the centroid of the cluster, not in the center of the grid cell.
    * @property {object} variables - An object describing the variables used.
    *
    */
    constructor (definition) {
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

        this._updateRootExpressionList();
        this._updateRootExpressions();

        this._resolveAliases();
        this._validateAliasDAG();
    }

    /**
     * Get the geometry type of the visualization.
     * @readonly
     * @api
     */
    get geometryType () {
        return this._geomType;
    }

    loadImages () {
        return Promise.all(this._getRootExpressions().map(expr => expr.loadImages()));
    }

    // Define a viz property, setting all the required getters, setters and creating a proxy for the variables object
    // These setters and the proxy allow us to re-render without requiring further action from the user
    _defineProperty (propertyName, propertyValue) {
        if (!SUPPORTED_PROPERTIES.includes(propertyName)) {
            return;
        }
        Object.defineProperty(this, propertyName, {
            get: () => this['_' + propertyName],
            set: expr => {
                if (propertyName !== 'resolution') {
                    expr = implicitCast(expr);
                }
                this['_' + propertyName] = expr;
                this._changed();
            }
        });

        let property = propertyValue;
        if (propertyName === 'variables') {
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

    _getRootExpressions () {
        return this._rootExpressions;
    }
    _getRootStyleExpressions () {
        return this._rootStyleExpressions;
    }

    _updateRootExpressions () {
        this._getRootExpressions().forEach(expr => {
            expr.parent = this;
            expr.notify = this._changed.bind(this);
        });
    }

    isAnimated () {
        return this._getRootStyleExpressions().some(expr => expr.isAnimated());
    }

    onChange (callback) {
        this._changeCallback = callback;
    }

    _changed () {
        this._updateRootExpressionList();
        this._resolveAliases();
        this._validateAliasDAG();
        if (this._changeCallback) {
            this._changeCallback(this);
        }
    }

    _updateRootExpressionList () {
        this._rootExpressions = [
            this.color,
            this.width,
            this.strokeColor,
            this.strokeWidth,
            this.order,
            this.filter,
            this.symbol,
            this.symbolPlacement,
            this.transform,
            ...Object.values(this.variables)
        ];
        this._rootStyleExpressions = [
            this.color,
            this.width,
            this.strokeColor,
            this.strokeWidth,
            this.order,
            this.filter,
            this.symbol,
            this.symbolPlacement,
            this.transform
        ];
    }

    getMinimumNeededSchema () {
        const exprs = this._getRootExpressions().filter(x => x && x._getMinimumNeededSchema);
        return exprs.map(expr => expr._getMinimumNeededSchema()).reduce(schema.union, schema.IDENTITY);
    }

    setDefaultsIfRequired (geomType) {
        this._geomType = geomType;
        if (this._appliedDefaults) {
            return;
        }
        let defaults = this._getDefaultGeomStyle(geomType);
        if (defaults) {
            this._appliedDefaults = true;
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

    _getDefaultGeomStyle (geomType) {
        if (geomType === 'point') {
            return {
                COLOR_EXPRESSION: () => _markDefault(s.hex('#EE4D5A')),
                WIDTH_EXPRESSION: () => _markDefault(s.number(7)),
                STROKE_COLOR_EXPRESSION: () => _markDefault(s.hex('#FFF')),
                STROKE_WIDTH_EXPRESSION: () => _markDefault(s.number(1))
            };
        } else if (geomType === 'line') {
            return {
                COLOR_EXPRESSION: () => _markDefault(s.hex('#4CC8A3')),
                WIDTH_EXPRESSION: () => _markDefault(s.number(1.5)),
                STROKE_COLOR_EXPRESSION: () => _markDefault(s.hex('#FFF')), // Not used in lines
                STROKE_WIDTH_EXPRESSION: () => _markDefault(s.number(1)) // Not used in lines
            };
        } else if (geomType === 'polygon') {
            return {
                COLOR_EXPRESSION: () => _markDefault(s.hex('#826DBA')),
                WIDTH_EXPRESSION: () => _markDefault(s.number(1)), // Not used in polygons
                STROKE_COLOR_EXPRESSION: () => _markDefault(s.hex('#FFF')),
                STROKE_WIDTH_EXPRESSION: () => _markDefault(s.number(1))
            };
        }
    }

    _resolveAliases () {
        this._getRootExpressions().forEach(expr => {
            expr._resolveAliases(this.variables);
        });
    }

    _validateAliasDAG () {
        const permanentMarkedSet = new Set();
        const temporarilyMarkedSet = new Set();
        const visit = node => {
            if (permanentMarkedSet.has(node)) {
                // Node is already a processed dependency
                return;
            }
            if (temporarilyMarkedSet.has(node)) {
                throw new CartoRuntimeError('Viz contains a circular dependency');
            }
            temporarilyMarkedSet.add(node);
            node._getDependencies().forEach(visit);
            permanentMarkedSet.add(node);
        };
        const unmarked = this._getRootExpressions().map(
            expr => expr._getDependencies()
        ).reduce((a, b) =>
            [...a, ...b]
            , []);
        while (unmarked.length) {
            visit(unmarked.pop());
        }
    }

    compileShaders (gl, metadata) {
        this._getRootExpressions().forEach(expr => expr._bindMetadata(metadata));
        checkVizPropertyTypes(this);

        this.colorShader = compileShader(gl, shaders.styler.colorShaderGLSL, { color: this.color }, this);
        this.widthShader = compileShader(gl, shaders.styler.widthShaderGLSL, { width: this.width }, this);
        this.strokeColorShader = compileShader(gl, shaders.styler.colorShaderGLSL, { color: this.strokeColor }, this);
        this.strokeWidthShader = compileShader(gl, shaders.styler.widthShaderGLSL, { width: this.strokeWidth }, this);
        this.filterShader = compileShader(gl, shaders.styler.filterShaderGLSL, { filter: this.filter }, this);

        if (!this.symbol.default) {
            this.symbolShader = compileShader(gl, shaders.symbolizer.symbolShaderGLSL, {
                symbol: this.symbol,
                symbolPlacement: this.symbolPlacement,
                transform: this.transform
            }, this);
        }

        if (!this._geomType || this._geomType === 'point') {
            this.pointShader = compileShader(gl,
                { vertexShader: pointVertexShaderGLSL, fragmentShader: pointFragmentShaderGLSL },
                { transform: this.transform }, this);
        }
        if (!this._geomType || this._geomType === 'line') {
            this.lineShader = compileShader(gl,
                { vertexShader: lineVertexShaderGLSL, fragmentShader: lineFragmentShaderGLSL },
                { transform: this.transform }, this);
        }
        if (!this._geomType || this._geomType === 'polygon') {
            this.polygonShader = compileShader(gl,
                { vertexShader: polygonVertexShaderGLSL, fragmentShader: polygonFragmentShaderGLSL },
                { transform: this.transform }, this);
        }
        if (!this._geomType || this._geomType === 'grid') {
            this.gridShader = compileShader(gl, shaders.grid, { color: this.color }, this);
        }
    }

    replaceChild (toReplace, replacer) {
        if (Object.values(this.variables).includes(toReplace)) {
            const varName = Object.keys(this.variables).find(varName => this.variables[varName] === toReplace);
            this.variables[varName] = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace === this.color) {
            this.color = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace === this.width) {
            this.width = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace === this.strokeColor) {
            this.strokeColor = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace === this.strokeWidth) {
            this.strokeWidth = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace === this.filter) {
            this.filter = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace === this.symbol) {
            this.symbol = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace === this.symbolPlacement) {
            this.symbolPlacement = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else if (toReplace === this.transform) {
            this.transform = replacer;
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        } else {
            throw new CartoRuntimeError('No child found');
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
    _getVizDefinition (definition) {
        if (util.isUndefined(definition)) {
            return this._setDefaults({});
        }
        if (util.isObject(definition)) {
            return this._setDefaults(definition);
        }
        if (util.isString(definition)) {
            return this._setDefaults(parseVizDefinition(definition));
        }
        throw new CartoValidationError(`${cvt.INCORRECT_VALUE} viz 'definition' should be a vizSpec object or a valid viz string.`);
    }

    /**
     * Add default values to a vizSpec object.
     *
     * @param {VizSpec} vizSpec
     * @return {VizSpec}
     */
    _setDefaults (vizSpec) {
        if (util.isUndefined(vizSpec.color)) {
            const NO_OVERRIDE_COLOR = s.rgba(0, 0, 0, 0); // TODO move to contant expressions
            vizSpec.color = util.isUndefined(vizSpec.symbol) ? DEFAULT_COLOR_EXPRESSION() : NO_OVERRIDE_COLOR;
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
        if (util.isUndefined(vizSpec.transform)) {
            vizSpec.transform = DEFAULT_TRANSFORM_EXPRESSION();
        }
        vizSpec.variables = vizSpec.variables || {};
        return vizSpec;
    }

    _checkVizSpec (vizSpec) {
        // Apply implicit cast to numeric style properties
        vizSpec.width = implicitCast(vizSpec.width);
        vizSpec.strokeWidth = implicitCast(vizSpec.strokeWidth);
        vizSpec.symbolPlacement = implicitCast(vizSpec.symbolPlacement);
        vizSpec.transform = implicitCast(vizSpec.transform);
        vizSpec.symbol = implicitCast(vizSpec.symbol);
        vizSpec.filter = implicitCast(vizSpec.filter);

        if (!util.isNumber(vizSpec.resolution)) {
            throw new CartoValidationError(`${cvt.INCORRECT_TYPE} 'resolution' property must be a number.`);
        }
        if (vizSpec.resolution <= MIN_RESOLUTION) {
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} 'resolution' must be greater than ${MIN_RESOLUTION}.`);
        }
        if (vizSpec.resolution >= MAX_RESOLUTION) {
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} 'resolution' must be less than ${MAX_RESOLUTION}.`);
        }

        const toCheck = ['color', 'strokeColor', 'width', 'strokeWidth', 'order', 'filter',
            'symbol', 'symbolPlacement', 'transform'];
        toCheck.forEach((parameter) => {
            if (!(vizSpec[parameter] instanceof BaseExpression)) {
                throw new CartoValidationError(`${cvt.INCORRECT_TYPE} '${parameter}' parameter is not a valid viz Expresion.`);
            }
        });

        for (let key in vizSpec) {
            if (SUPPORTED_PROPERTIES.indexOf(key) === -1) {
                console.warn(`Property '${key}' is not supported`);
            }
        }
    }

    /**
     * Stringify the visualization
     *
     * @returns {string}
     * @memberof carto
     * @api
     */
    toString () {
        const variables = Object.keys(this.variables).map(varName =>
            `@${varName}: ${this.variables[varName].toString()}\n`
        );
        return `color: ${this.color.toString()}
            strokeColor: ${this.strokeColor.toString()}
            width: ${this.width.toString()}
            strokeWidth: ${this.strokeWidth.toString()}
            filter: ${this.filter.toString()}
            order: ${this.order.toString()}
            symbol: ${this.symbol.toString()}
            symbolPlacement: ${this.symbolPlacement.toString()}
            offset: ${this.offset.toString()}
            ${variables}`.replace(/ {4}/g, '');
    }
}

function checkVizPropertyTypes (viz) {
    const expectedTypePerProperty = {
        color: 'color',
        strokeColor: 'color',
        width: 'number',
        strokeWidth: 'number',
        order: 'orderer',
        filter: 'number',
        symbol: 'image',
        symbolPlacement: 'placement',
        transform: 'transformation'
    };

    Object.keys(expectedTypePerProperty).forEach((property) => {
        const currentType = viz[property].type;
        const expected = expectedTypePerProperty[property];
        if (currentType !== expected) {
            throw new CartoValidationError(
                `${cvt.INCORRECT_TYPE} Viz property '${property}': must be of type '${expected}' but it was of type '${currentType}'`
            );
        }
    });
}

/**
 * Mark default expressions to apply the style defaults for each
 * geometry (point, line, polygon) when available.
 */
function _markDefault (expression) {
    expression.default = true;
    return expression;
}
