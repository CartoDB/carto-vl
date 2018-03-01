/*!
 * CARTO GL js https://carto.com/
 * Version: 0.0.0-alpha.1
 * 
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["carto"] = factory();
	else
		root["carto"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 28);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__functions__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__schema__ = __webpack_require__(9);





class Expression {
    /**
     * @hideconstructor
     * @param {*} children
     * @param {*} inlineMaker
     * @param {*} preface
     */
    constructor(children) {
        this.childrenNames = Object.keys(children);
        Object.keys(children).map(name => this[name] = Object(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* implicitCast */])(children[name]));
        this._getChildren().map(child => child.parent = this);
        this._metaBindings = [];
        this.preface = '';
    }

    _bind(metadata) {
        this._metaBindings.push(metadata);
        this._compile(metadata);
        return this;
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
     * @param {*} uniformIDMaker    fn to get unique IDs
     * @param {*} propertyTIDMaker  fn to get property IDs and inform of used properties
     */
    _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
        const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(uniformIDMaker, propertyTIDMaker));
        let childInlines = {};
        childSources.map((source, index) => childInlines[this.childrenNames[index]] = source.inline);
        return {
            preface: childSources.map(s => s.preface).reduce((a, b) => a + b, '') + this.preface,
            inline: this.inlineMaker(childInlines, uniformIDMaker, propertyTIDMaker)
        };
    }

    /**
     * Inform about a successful shader compilation. One-time post-compilation WebGL calls should be done here.
     * @param {*} program
     */
    _postShaderCompile(program, gl) {
        this.childrenNames.forEach(name => this[name]._postShaderCompile(program, gl));
    }

    _getDrawMetadataRequirements() {
        // Depth First Search => reduce using union
        return this._getChildren().map(child => child._getDrawMetadataRequirements()).reduce(__WEBPACK_IMPORTED_MODULE_2__schema__["union"], __WEBPACK_IMPORTED_MODULE_2__schema__["IDENTITY"]);
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
    _replaceChild(toReplace, replacer) {
        const name = this.childrenNames.find(name => this[name] == toReplace);
        this[name] = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    }

    /**
     * Linear interpolation between this and finalValue with the specified duration
     * @jsapi
     * @param {Expression} final
     * @param {Expression} duration
     * @param {Expression} blendFunc
     */
    //TODO blendFunc = 'linear'
    blendTo(final, duration = 500) {
        final = Object(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* implicitCast */])(final);
        const parent = this.parent;
        const blender = Object(__WEBPACK_IMPORTED_MODULE_1__functions__["blend"])(this, final, Object(__WEBPACK_IMPORTED_MODULE_1__functions__["animate"])(duration));
        this._metaBindings.map(m => blender._bind(m));
        parent._replaceChild(this, blender);
        blender.notify();
    }

    blendFrom(final, duration = 500, interpolator = null) {
        final = Object(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* implicitCast */])(final);
        const parent = this.parent;
        const blender = Object(__WEBPACK_IMPORTED_MODULE_1__functions__["blend"])(final, this, Object(__WEBPACK_IMPORTED_MODULE_1__functions__["animate"])(duration), interpolator);
        this._metaBindings.map(m => blender._bind(m));
        parent._replaceChild(this, blender);
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
        return this._getChildren().map(child => child._getMinimumNeededSchema()).reduce(__WEBPACK_IMPORTED_MODULE_2__schema__["union"], __WEBPACK_IMPORTED_MODULE_2__schema__["IDENTITY"]);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Expression;



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "in", function() { return _in; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expressions_palettes__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__expressions_animate__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__expressions_blend__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__expressions_buckets__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__expressions_CIELab__ = __webpack_require__(35);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__expressions_float__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__expressions_floatConstant__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__expressions_category__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__expressions_hsv__ = __webpack_require__(36);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__expressions_linear__ = __webpack_require__(37);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__expressions_near__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__expressions_now__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__expressions_property__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__expressions_ramp__ = __webpack_require__(40);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__expressions_rgba__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__expressions_opacity__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__expressions_top__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__expressions_xyz__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__expressions_zoom__ = __webpack_require__(45);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__expressions_belongs_js__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__expressions_between__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__expressions_unary__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22__expressions_binary__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_23__expressions_aggregation__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_24__expressions_quantiles__ = __webpack_require__(46);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_25__expressions_interpolators__ = __webpack_require__(19);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Cubic", function() { return __WEBPACK_IMPORTED_MODULE_25__expressions_interpolators__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_26__expressions_viewportAggregation__ = __webpack_require__(47);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_27__expressions_ordering__ = __webpack_require__(48);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "palettes", function() { return __WEBPACK_IMPORTED_MODULE_0__expressions_palettes__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Asc", function() { return __WEBPACK_IMPORTED_MODULE_27__expressions_ordering__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Desc", function() { return __WEBPACK_IMPORTED_MODULE_27__expressions_ordering__["b"]; });
/**
 *  @api
 *  @namespace carto.style.expressions
 *
 */























// Unary ops









// Binary ops















// Aggregation ops






// Classifiers


// Interpolators










// Expose classes as constructor functions
const asc = (...args) => new __WEBPACK_IMPORTED_MODULE_27__expressions_ordering__["a" /* Asc */](...args);
/* harmony export (immutable) */ __webpack_exports__["asc"] = asc;

const desc = (...args) => new __WEBPACK_IMPORTED_MODULE_27__expressions_ordering__["b" /* Desc */](...args);
/* harmony export (immutable) */ __webpack_exports__["desc"] = desc;

const noOrder = (...args) => new __WEBPACK_IMPORTED_MODULE_27__expressions_ordering__["c" /* NoOrder */](...args);
/* harmony export (immutable) */ __webpack_exports__["noOrder"] = noOrder;

const width = (...args) => new __WEBPACK_IMPORTED_MODULE_27__expressions_ordering__["d" /* Width */](...args);
/* harmony export (immutable) */ __webpack_exports__["width"] = width;

const floatMul = (...args) => new __WEBPACK_IMPORTED_MODULE_22__expressions_binary__["f" /* FloatMul */](...args);
/* harmony export (immutable) */ __webpack_exports__["floatMul"] = floatMul;

const floatDiv = (...args) => new __WEBPACK_IMPORTED_MODULE_22__expressions_binary__["d" /* FloatDiv */](...args);
/* harmony export (immutable) */ __webpack_exports__["floatDiv"] = floatDiv;

const floatAdd = (...args) => new __WEBPACK_IMPORTED_MODULE_22__expressions_binary__["c" /* FloatAdd */](...args);
/* harmony export (immutable) */ __webpack_exports__["floatAdd"] = floatAdd;

const floatSub = (...args) => new __WEBPACK_IMPORTED_MODULE_22__expressions_binary__["h" /* FloatSub */](...args);
/* harmony export (immutable) */ __webpack_exports__["floatSub"] = floatSub;

const floatPow = (...args) => new __WEBPACK_IMPORTED_MODULE_22__expressions_binary__["g" /* FloatPow */](...args);
/* harmony export (immutable) */ __webpack_exports__["floatPow"] = floatPow;

const floatMod = (...args) => new __WEBPACK_IMPORTED_MODULE_22__expressions_binary__["e" /* FloatMod */](...args);
/* harmony export (immutable) */ __webpack_exports__["floatMod"] = floatMod;

const log = (...args) => new __WEBPACK_IMPORTED_MODULE_21__expressions_unary__["c" /* Log */](...args);
/* harmony export (immutable) */ __webpack_exports__["log"] = log;

const sqrt = (...args) => new __WEBPACK_IMPORTED_MODULE_21__expressions_unary__["g" /* Sqrt */](...args);
/* harmony export (immutable) */ __webpack_exports__["sqrt"] = sqrt;

const sin = (...args) => new __WEBPACK_IMPORTED_MODULE_21__expressions_unary__["f" /* Sin */](...args);
/* harmony export (immutable) */ __webpack_exports__["sin"] = sin;

const cos = (...args) => new __WEBPACK_IMPORTED_MODULE_21__expressions_unary__["b" /* Cos */](...args);
/* harmony export (immutable) */ __webpack_exports__["cos"] = cos;

const tan = (...args) => new __WEBPACK_IMPORTED_MODULE_21__expressions_unary__["h" /* Tan */](...args);
/* harmony export (immutable) */ __webpack_exports__["tan"] = tan;

const sign = (...args) => new __WEBPACK_IMPORTED_MODULE_21__expressions_unary__["e" /* Sign */](...args);
/* harmony export (immutable) */ __webpack_exports__["sign"] = sign;

const near = (...args) => new __WEBPACK_IMPORTED_MODULE_10__expressions_near__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["near"] = near;

const blend = (...args) => new __WEBPACK_IMPORTED_MODULE_2__expressions_blend__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["blend"] = blend;

const rgba = (...args) => new __WEBPACK_IMPORTED_MODULE_14__expressions_rgba__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["rgba"] = rgba;

const property = (...args) => new __WEBPACK_IMPORTED_MODULE_12__expressions_property__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["property"] = property;

const animate = (...args) => new __WEBPACK_IMPORTED_MODULE_1__expressions_animate__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["animate"] = animate;

const hsv = (...args) => new __WEBPACK_IMPORTED_MODULE_8__expressions_hsv__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["hsv"] = hsv;

const opacity = (...args) => new __WEBPACK_IMPORTED_MODULE_15__expressions_opacity__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["opacity"] = opacity;

const ramp = (...args) => new __WEBPACK_IMPORTED_MODULE_13__expressions_ramp__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["ramp"] = ramp;

const float = (...args) => new __WEBPACK_IMPORTED_MODULE_5__expressions_float__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["float"] = float;

const category = (...args) => new __WEBPACK_IMPORTED_MODULE_7__expressions_category__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["category"] = category;

const max = (...args) => new __WEBPACK_IMPORTED_MODULE_23__expressions_aggregation__["b" /* Max */](...args);
/* harmony export (immutable) */ __webpack_exports__["max"] = max;

const min = (...args) => new __WEBPACK_IMPORTED_MODULE_23__expressions_aggregation__["c" /* Min */](...args);
/* harmony export (immutable) */ __webpack_exports__["min"] = min;

const sum = (...args) => new __WEBPACK_IMPORTED_MODULE_23__expressions_aggregation__["e" /* Sum */](...args);
/* harmony export (immutable) */ __webpack_exports__["sum"] = sum;

const avg = (...args) => new __WEBPACK_IMPORTED_MODULE_23__expressions_aggregation__["a" /* Avg */](...args);
/* harmony export (immutable) */ __webpack_exports__["avg"] = avg;

const mode = (...args) => new __WEBPACK_IMPORTED_MODULE_23__expressions_aggregation__["d" /* Mode */](...args);
/* harmony export (immutable) */ __webpack_exports__["mode"] = mode;

const top = (...args) => new __WEBPACK_IMPORTED_MODULE_16__expressions_top__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["top"] = top;

const linear = (...args) => new __WEBPACK_IMPORTED_MODULE_9__expressions_linear__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["linear"] = linear;

const cubic = (...args) => new __WEBPACK_IMPORTED_MODULE_25__expressions_interpolators__["a" /* Cubic */](...args);
/* harmony export (immutable) */ __webpack_exports__["cubic"] = cubic;

const ilinear = (...args) => new __WEBPACK_IMPORTED_MODULE_25__expressions_interpolators__["b" /* ILinear */](...args);
/* harmony export (immutable) */ __webpack_exports__["ilinear"] = ilinear;

const now = (...args) => new __WEBPACK_IMPORTED_MODULE_11__expressions_now__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["now"] = now;

const zoom = (...args) => new __WEBPACK_IMPORTED_MODULE_18__expressions_zoom__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["zoom"] = zoom;

const cielab = (...args) => new __WEBPACK_IMPORTED_MODULE_4__expressions_CIELab__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["cielab"] = cielab;

const xyz = (...args) => new __WEBPACK_IMPORTED_MODULE_17__expressions_xyz__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["xyz"] = xyz;

const abs = (...args) => new __WEBPACK_IMPORTED_MODULE_21__expressions_unary__["a" /* Abs */](...args);
/* harmony export (immutable) */ __webpack_exports__["abs"] = abs;

const greaterThan = (...args) => new __WEBPACK_IMPORTED_MODULE_22__expressions_binary__["i" /* GreaterThan */](...args);
/* harmony export (immutable) */ __webpack_exports__["greaterThan"] = greaterThan;

const greaterThanOrEqualTo = (...args) => new __WEBPACK_IMPORTED_MODULE_22__expressions_binary__["j" /* GreaterThanOrEqualTo */](...args);
/* harmony export (immutable) */ __webpack_exports__["greaterThanOrEqualTo"] = greaterThanOrEqualTo;

const lessThan = (...args) => new __WEBPACK_IMPORTED_MODULE_22__expressions_binary__["k" /* LessThan */](...args);
/* harmony export (immutable) */ __webpack_exports__["lessThan"] = lessThan;

const lessThanOrEqualTo = (...args) => new __WEBPACK_IMPORTED_MODULE_22__expressions_binary__["l" /* LessThanOrEqualTo */](...args);
/* harmony export (immutable) */ __webpack_exports__["lessThanOrEqualTo"] = lessThanOrEqualTo;

const equals = (...args) => new __WEBPACK_IMPORTED_MODULE_22__expressions_binary__["b" /* Equals */](...args);
/* harmony export (immutable) */ __webpack_exports__["equals"] = equals;

const notEquals = (...args) => new __WEBPACK_IMPORTED_MODULE_22__expressions_binary__["m" /* NotEquals */](...args);
/* harmony export (immutable) */ __webpack_exports__["notEquals"] = notEquals;

const buckets = (...args) => new __WEBPACK_IMPORTED_MODULE_3__expressions_buckets__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["buckets"] = buckets;

const quantiles = (...args) => new __WEBPACK_IMPORTED_MODULE_24__expressions_quantiles__["b" /* Quantiles */](...args);
/* harmony export (immutable) */ __webpack_exports__["quantiles"] = quantiles;

const globalQuantiles = (...args) => new __WEBPACK_IMPORTED_MODULE_24__expressions_quantiles__["a" /* GlobalQuantiles */](...args);
/* harmony export (immutable) */ __webpack_exports__["globalQuantiles"] = globalQuantiles;

const viewportMax = (...args) => new __WEBPACK_IMPORTED_MODULE_26__expressions_viewportAggregation__["i" /* ViewportMax */](...args);
/* harmony export (immutable) */ __webpack_exports__["viewportMax"] = viewportMax;

const viewportMin = (...args) => new __WEBPACK_IMPORTED_MODULE_26__expressions_viewportAggregation__["j" /* ViewportMin */](...args);
/* harmony export (immutable) */ __webpack_exports__["viewportMin"] = viewportMin;

const viewportAvg = (...args) => new __WEBPACK_IMPORTED_MODULE_26__expressions_viewportAggregation__["g" /* ViewportAvg */](...args);
/* harmony export (immutable) */ __webpack_exports__["viewportAvg"] = viewportAvg;

const viewportSum = (...args) => new __WEBPACK_IMPORTED_MODULE_26__expressions_viewportAggregation__["l" /* ViewportSum */](...args);
/* harmony export (immutable) */ __webpack_exports__["viewportSum"] = viewportSum;

const viewportCount = (...args) => new __WEBPACK_IMPORTED_MODULE_26__expressions_viewportAggregation__["h" /* ViewportCount */](...args);
/* harmony export (immutable) */ __webpack_exports__["viewportCount"] = viewportCount;

const viewportPercentile = (...args) => new __WEBPACK_IMPORTED_MODULE_26__expressions_viewportAggregation__["k" /* ViewportPercentile */](...args);
/* harmony export (immutable) */ __webpack_exports__["viewportPercentile"] = viewportPercentile;

const globalPercentile = (...args) => new __WEBPACK_IMPORTED_MODULE_26__expressions_viewportAggregation__["e" /* GlobalPercentile */](...args);
/* harmony export (immutable) */ __webpack_exports__["globalPercentile"] = globalPercentile;

const globalMax = (...args) => new __WEBPACK_IMPORTED_MODULE_26__expressions_viewportAggregation__["c" /* GlobalMax */](...args);
/* harmony export (immutable) */ __webpack_exports__["globalMax"] = globalMax;

const globalMin = (...args) => new __WEBPACK_IMPORTED_MODULE_26__expressions_viewportAggregation__["d" /* GlobalMin */](...args);
/* harmony export (immutable) */ __webpack_exports__["globalMin"] = globalMin;

const globalAvg = (...args) => new __WEBPACK_IMPORTED_MODULE_26__expressions_viewportAggregation__["a" /* GlobalAvg */](...args);
/* harmony export (immutable) */ __webpack_exports__["globalAvg"] = globalAvg;

const globalSum = (...args) => new __WEBPACK_IMPORTED_MODULE_26__expressions_viewportAggregation__["f" /* GlobalSum */](...args);
/* harmony export (immutable) */ __webpack_exports__["globalSum"] = globalSum;

const globalCount = (...args) => new __WEBPACK_IMPORTED_MODULE_26__expressions_viewportAggregation__["b" /* GlobalCount */](...args);
/* harmony export (immutable) */ __webpack_exports__["globalCount"] = globalCount;

const inverse = (...args) => new __WEBPACK_IMPORTED_MODULE_0__expressions_palettes__["a" /* Inverse */](...args);
/* harmony export (immutable) */ __webpack_exports__["inverse"] = inverse;

const floatConstant = (...args) => new __WEBPACK_IMPORTED_MODULE_6__expressions_floatConstant__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["floatConstant"] = floatConstant;


const TRUE = new __WEBPACK_IMPORTED_MODULE_6__expressions_floatConstant__["a" /* default */](1);
/* harmony export (immutable) */ __webpack_exports__["TRUE"] = TRUE;

const FALSE = new __WEBPACK_IMPORTED_MODULE_6__expressions_floatConstant__["a" /* default */](0);
/* harmony export (immutable) */ __webpack_exports__["FALSE"] = FALSE;

const and = (...args) => new __WEBPACK_IMPORTED_MODULE_22__expressions_binary__["a" /* And */](...args);
/* harmony export (immutable) */ __webpack_exports__["and"] = and;

const or = (...args) => new __WEBPACK_IMPORTED_MODULE_22__expressions_binary__["n" /* Or */](...args);
/* harmony export (immutable) */ __webpack_exports__["or"] = or;

const not = (...args) => new __WEBPACK_IMPORTED_MODULE_21__expressions_unary__["d" /* Not */](...args);
/* harmony export (immutable) */ __webpack_exports__["not"] = not;


const gt = greaterThan;
/* harmony export (immutable) */ __webpack_exports__["gt"] = gt;

const gte = greaterThanOrEqualTo;
/* harmony export (immutable) */ __webpack_exports__["gte"] = gte;

const lt = lessThan;
/* harmony export (immutable) */ __webpack_exports__["lt"] = lt;

const lte = lessThanOrEqualTo;
/* harmony export (immutable) */ __webpack_exports__["lte"] = lte;

const _in = (...args) => new __WEBPACK_IMPORTED_MODULE_19__expressions_belongs_js__["a" /* In */](...args);

const eq = equals;
/* harmony export (immutable) */ __webpack_exports__["eq"] = eq;

const neq = notEquals;
/* harmony export (immutable) */ __webpack_exports__["neq"] = neq;

const nin = (...args) => new __WEBPACK_IMPORTED_MODULE_19__expressions_belongs_js__["b" /* Nin */](...args);
/* harmony export (immutable) */ __webpack_exports__["nin"] = nin;

const between = (...args) => new __WEBPACK_IMPORTED_MODULE_20__expressions_between__["a" /* default */](...args);
/* harmony export (immutable) */ __webpack_exports__["between"] = between;







/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__functions__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__expression__ = __webpack_require__(0);




// Binary ops
const FloatMul = genBinaryOp((x, y) => x * y, (x, y) => `(${x} * ${y})`);
/* harmony export (immutable) */ __webpack_exports__["f"] = FloatMul;

const FloatDiv = genBinaryOp((x, y) => x / y, (x, y) => `(${x} / ${y})`);
/* harmony export (immutable) */ __webpack_exports__["d"] = FloatDiv;

const FloatAdd = genBinaryOp((x, y) => x + y, (x, y) => `(${x} + ${y})`);
/* harmony export (immutable) */ __webpack_exports__["c"] = FloatAdd;

const FloatSub = genBinaryOp((x, y) => x - y, (x, y) => `(${x} - ${y})`);
/* harmony export (immutable) */ __webpack_exports__["h"] = FloatSub;

const FloatMod = genBinaryOp((x, y) => x % y, (x, y) => `mod(${x}, ${y})`);
/* harmony export (immutable) */ __webpack_exports__["e"] = FloatMod;

const FloatPow = genBinaryOp((x, y) => Math.pow(x, y), (x, y) => `pow(${x}, ${y})`);
/* harmony export (immutable) */ __webpack_exports__["g"] = FloatPow;


const GreaterThan = genBinaryOp((x, y) => x > y ? 1 : 0, (x, y) => `(${x}>${y}? 1.:0.)`);
/* harmony export (immutable) */ __webpack_exports__["i"] = GreaterThan;

const GreaterThanOrEqualTo = genBinaryOp((x, y) => x >= y ? 1 : 0, (x, y) => `(${x}>=${y}? 1.:0.)`);
/* harmony export (immutable) */ __webpack_exports__["j"] = GreaterThanOrEqualTo;


const LessThan = genBinaryOp((x, y) => x < y ? 1 : 0, (x, y) => `(${x}<${y}? 1.:0.)`);
/* harmony export (immutable) */ __webpack_exports__["k"] = LessThan;

const LessThanOrEqualTo = genBinaryOp((x, y) => x <= y ? 1 : 0, (x, y) => `(${x}<=${y}? 1.:0.)`);
/* harmony export (immutable) */ __webpack_exports__["l"] = LessThanOrEqualTo;


const Equals = genBinaryOp((x, y) => x == y ? 1 : 0, (x, y) => `(${x}==${y}? 1.:0.)`);
/* harmony export (immutable) */ __webpack_exports__["b"] = Equals;

const NotEquals = genBinaryOp((x, y) => x != y ? 1 : 0, (x, y) => `(${x}!=${y}? 1.:0.)`);
/* harmony export (immutable) */ __webpack_exports__["m"] = NotEquals;


const  Or = genBinaryOp((x, y) => Math.min(x + y, 1), (x, y) => `min(${x} + ${y}, 1.)`);
/* harmony export (immutable) */ __webpack_exports__["n"] = Or;

const And = genBinaryOp((x, y) => Math.min(x * y, 1), (x, y) => `min(${x} * ${y}, 1.)`);
/* harmony export (immutable) */ __webpack_exports__["a"] = And;


function genBinaryOp(jsFn, glsl) {
    return class BinaryOperation extends __WEBPACK_IMPORTED_MODULE_2__expression__["a" /* default */] {
        /**
         * @jsapi
         * @name BinaryOperation
         * @hideconstructor
         * @augments Expression
         * @constructor
         * @param {*} a
         * @param {*} b
         */
        constructor(a, b) {
            if (Number.isFinite(a) && Number.isFinite(b)) {
                return Object(__WEBPACK_IMPORTED_MODULE_0__functions__["float"])(jsFn(a, b));
            }
            a = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(a);
            b = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(b);
            if (typeof a === 'string') {
                [a, b] = [b, a];
            }
            if (typeof b === 'string') {
                super({ a: a, auxFloat: Object(__WEBPACK_IMPORTED_MODULE_0__functions__["float"])(0) });
                this.b = b;
            } else {
                super({ a: a, b: b });
            }

        }
        _compile(meta) {
            super._compile(meta);
            const [a, b] = [this.a, this.b];
            this.inlineMaker = inline => glsl(inline.a, inline.b);
            // TODO this logic is operation dependant
            if (typeof b === 'string' && a.type == 'category' && a.name) {
                const id = meta.categoryIDs[b];
                this.auxFloat.expr = id;
                this.type = 'float';
                this.inlineMaker = inline => glsl(inline.a, inline.auxFloat);
            } else if (a.type == 'float' && b.type == 'float') {
                this.type = 'float';
            } else if (a.type == 'color' && b.type == 'color') {
                this.type = 'color';
            } else if (a.type == 'color' && b.type == 'float') {
                this.type = 'color';
            } else if (a.type == 'category' && b.type == 'category') {
                this.type = 'float';
            } else {
                throw new Error(`Binary operation cannot be performed between types '${a.type}' and '${b.type}'`);
            }
        }
    };
}


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = implicitCast;
/* harmony export (immutable) */ __webpack_exports__["a"] = hexToRgb;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__functions__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__expression__ = __webpack_require__(0);



// To support literals (string and numeric) out of the box we need to cast them implicitly on constructors
function implicitCast(value) {
    if (Number.isFinite(value)) {
        return Object(__WEBPACK_IMPORTED_MODULE_0__functions__["float"])(value);
    }
    if (typeof value == 'string') {
        return Object(__WEBPACK_IMPORTED_MODULE_0__functions__["category"])(value);
    }
    if (!(value instanceof __WEBPACK_IMPORTED_MODULE_1__expression__["a" /* default */]) && value.type !== 'paletteGenerator' && value.type !== 'float') {
        throw new Error('value cannot be casted');
    }
    return value;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__expression__ = __webpack_require__(0);




const Log = genUnaryOp(x => Math.log(x), x => `log(${x})`);
/* harmony export (immutable) */ __webpack_exports__["c"] = Log;

const Sqrt = genUnaryOp(x => Math.sqrt(x), x => `sqrt(${x})`);
/* harmony export (immutable) */ __webpack_exports__["g"] = Sqrt;

const Sin = genUnaryOp(x => Math.sin(x), x => `sin(${x})`);
/* harmony export (immutable) */ __webpack_exports__["f"] = Sin;

const Cos = genUnaryOp(x => Math.cos(x), x => `cos(${x})`);
/* harmony export (immutable) */ __webpack_exports__["b"] = Cos;

const Tan = genUnaryOp(x => Math.tan(x), x => `tan(${x})`);
/* harmony export (immutable) */ __webpack_exports__["h"] = Tan;

const Sign = genUnaryOp(x => Math.sign(x), x => `sign(${x})`);
/* harmony export (immutable) */ __webpack_exports__["e"] = Sign;

const Abs = genUnaryOp(x => Math.abs(x), x => `abs(${x})`);
/* harmony export (immutable) */ __webpack_exports__["a"] = Abs;

const Not = genUnaryOp(x => 1 - x, x => `1.0 - ${x}`);
/* harmony export (immutable) */ __webpack_exports__["d"] = Not;


function genUnaryOp(jsFn, glsl) {
    return class UnaryOperation extends __WEBPACK_IMPORTED_MODULE_1__expression__["a" /* default */] {
        constructor(a) {
            a = Object(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* implicitCast */])(a);
            super({ a: a });
        }
        _compile(meta) {
            super._compile(meta);
            if (this.a.type != 'float') {
                throw new Error(`Binary operation cannot be performed to '${this.a.type}'`);
            }
            this.type = 'float';
            this.inlineMaker = inlines => glsl(inlines.a);
        }
    };
}


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__carto_error__ = __webpack_require__(75);


/**
 * Utility to build a cartoError related to validation errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */
class CartoValidationError extends __WEBPACK_IMPORTED_MODULE_0__carto_error__["a" /* CartoError */] {
    constructor(type, message) {
        super({
            origin: 'validation',
            type: type,
            message: message
        });
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = CartoValidationError;



/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return isUndefined; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return isString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return isNumber; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return isObject; });
/**
 * Export util functions
 */

function isUndefined(value) {
    return value === undefined;
}

function isString(value) {
    return typeof value == 'string';
}

function isNumber(value) {
    return typeof value == 'number';
}

function isObject(value) {
    const type = typeof value;
    return value != null && (type == 'object' || type == 'function');
}




/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);


// Aggregation ops
const Max = genAggregationOp('max');
/* harmony export (immutable) */ __webpack_exports__["b"] = Max;

const Min = genAggregationOp('min');
/* harmony export (immutable) */ __webpack_exports__["c"] = Min;

const Avg = genAggregationOp('avg');
/* harmony export (immutable) */ __webpack_exports__["a"] = Avg;

const Sum = genAggregationOp('sum');
/* harmony export (immutable) */ __webpack_exports__["e"] = Sum;

const Mode = genAggregationOp('mode');
/* harmony export (immutable) */ __webpack_exports__["d"] = Mode;


function genAggregationOp(aggName) {
    return class AggregationOperation extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
        constructor(property) {
            super({ property: property });
        }
        get name() {
            return this.property.name;
        }
        get numCategories() {
            return this.property.numCategories;
        }
        //Override super methods, we don't want to let the property use the raw column, we must use the agg suffixed one
        _compile(metadata) {
            super._compile(metadata);
            this.type = this.property.type;
        }
        _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
            return {
                preface: '',
                inline: `p${propertyTIDMaker(`_cdb_agg_${aggName}_${this.property.name}`)}`
            };
        }
        _postShaderCompile() { }
        _getMinimumNeededSchema() {
            return {
                columns: [
                    `_cdb_agg_${aggName}_${this.property.name}`
                ]
            };
        }
    };
} 

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);



//TODO refactor to use uniformfloat class
class Animate extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    /**
     * @jsapi
     * @description Animate returns a number from zero to one based on the elapsed number of milliseconds since the style was instantiated.
     * The animation is not cyclic. It will stick to one once the elapsed number of milliseconds reach the animation's duration.
     * @param {*} duration animation duration in milliseconds
     */
    constructor(duration) {
        if (!Number.isFinite(duration)) {
            throw new Error('Animate only supports number literals');
        }
        super({});
        this.aTime = Date.now();
        this.bTime = this.aTime + Number(duration);
    }
    _compile() {
        this.type = 'float';
    }
    _applyToShaderSource(uniformIDMaker) {
        this._uniformID = uniformIDMaker();
        return {
            preface: `uniform float anim${this._uniformID};\n`,
            inline: `anim${this._uniformID}`
        };
    }
    _postShaderCompile(program, gl) {
        this._uniformLocation = gl.getUniformLocation(program, `anim${this._uniformID}`);
    }
    _preDraw(drawMetadata, gl) {
        const time = Date.now();
        this.mix = (time - this.aTime) / (this.bTime - this.aTime);
        if (this.mix > 1.) {
            gl.uniform1f(this._uniformLocation, 1);
        } else {
            gl.uniform1f(this._uniformLocation, this.mix);
        }
    }
    isAnimated() {
        return !this.mix || this.mix <= 1.;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Animate;


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (immutable) */ __webpack_exports__["union"] = union;
/* harmony export (immutable) */ __webpack_exports__["equals"] = equals;
// The IDENTITY schema contains zero columns, and it has two interesting properties:
//      union(a,IDENTITY)=union(IDENTITY, a)=a
//      contains(x, IDENTITY)=true  (for x = valid schema)
const IDENTITY = {
    columns: []
};
/* harmony export (immutable) */ __webpack_exports__["IDENTITY"] = IDENTITY;


/*
const schema = {
    columns: ['temp', 'cat']
};*/

//TODO
// Returns true if subsetSchema is a contained by supersetSchema
// A schema A is contained by the schema B when all columns of A are present in B and
// all aggregations in A are present in B, if a column is not aggregated in A, it must
// be not aggregated in B
//export function contains(supersetSchema, subsetSchema) {
//}

// Returns the union of a and b schemas
// The union of two schemas is a schema with all the properties in both schemas and with their
// aggregtions set to the union of both aggregation sets, or null if a property aggregation is null in both schemas
// The union is not defined when one schema set the aggregation of one column and the other schema left the aggregation
// to null. In this case the function will throw an exception.
function union(a, b) {
    const t = a.columns.concat(b.columns);
    return {
        columns: t.filter((item, pos) => t.indexOf(item) == pos)
    };
}

function equals(a,b){
    if (!a || !b){
        return false;
    }
    return a.columns.length==b.columns.length && a.columns.every((v,i)=> v === b.columns[i]);
}

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__client_windshaft__ = __webpack_require__(50);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__error_handling_carto_validation_error__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__setup_auth_service__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__setup_config_service__ = __webpack_require__(25);






const DEFAULT_SERVER_URL_TEMPLATE = 'https://{user}.carto.com';

class Base {

    /**
     * Base data source object.
     *
     * The methods listed in the {@link carto.source.Base|source.Base} object are availiable in all source objects.
     *
     * Use a source to reference the data used in a {@link carto.layer.Base|layer}.
     *
     * {@link carto.source.Base} should not be used directly use {@link carto.source.Dataset} or {@link carto.source.SQL} instead.
     *
     *
     * @constructor Base
     * @abstract
     * @memberof carto.source
     * @api
     */
    constructor() {
        this._client = new __WEBPACK_IMPORTED_MODULE_0__client_windshaft__["a" /* default */](this);
    }

    initialize(auth, config) {
        auth = auth || Object(__WEBPACK_IMPORTED_MODULE_2__setup_auth_service__["b" /* getDefaultAuth */])();
        config = config || Object(__WEBPACK_IMPORTED_MODULE_3__setup_config_service__["b" /* getDefaultConfig */])();
        Object(__WEBPACK_IMPORTED_MODULE_2__setup_auth_service__["a" /* checkAuth */])(auth);
        Object(__WEBPACK_IMPORTED_MODULE_3__setup_config_service__["a" /* checkConfig */])(config);
        this._apiKey = auth.apiKey;
        this._username = auth.username;
        this._serverURL = this._generateURL(auth, config);
    }

    bindLayer(...args) {
        this._client._bindLayer(...args);
    }

    requestData(viewport, style) {
        return this._client.getData(viewport, style);
    }

    free() {
        this._client.free();
    }

    _generateURL(auth, config) {
        let url = (config && config.serverURL) || DEFAULT_SERVER_URL_TEMPLATE;
        url = url.replace(/{user}/, auth.username);
        this._validateServerURL(url);
        return url;
    }

    _validateServerURL(serverURL) {
        var urlregex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
        if (!serverURL.match(urlregex)) {
            throw new __WEBPACK_IMPORTED_MODULE_1__error_handling_carto_validation_error__["a" /* default */]('source', 'nonValidServerURL');
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Base;



/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Renderer; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shaders__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__schema__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dataframe__ = __webpack_require__(58);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__style_functions__ = __webpack_require__(1);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_2__dataframe__["a"]; });
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_1__schema__; });





const HISTOGRAM_BUCKETS = 1000;

/**
 * @typedef {object} RPoint - Point in renderer coordinates space
 * @property {number} x
 * @property {number} y
 */

/**
 * @description The Render To Texture Width limits the maximum number of features per tile: *maxFeatureCount = RTT_WIDTH^2*
 *
 * Large RTT_WIDTH values are unsupported by hardware. Limits vary on each machine.
 * Support starts to drop from 2048, with a drastic reduction in support for more than 4096 pixels.
 *
 * Large values imply a small overhead too.
 */
const RTT_WIDTH = 1024;


/**
 * @description Renderer constructor. Use it to create a new renderer bound to the provided canvas.
 * Initialization will be done synchronously.
 * The function will fail in case that a WebGL context cannot be created this can happen because of the following reasons:
 *   * The provided canvas element is invalid
 *   * The browser or the machine doesn't support WebGL or the required WebGL extension and minimum parameter values
 * @jsapi
 * @memberOf renderer
 * @constructor
 * @param {HTMLElement} canvas - the WebGL context will be created on this element
 */

class Renderer {
    constructor(canvas) {
        if (canvas) {
            this.gl = canvas.getContext('webgl');
            if (!this.gl) {
                throw new Error('WebGL 1 is unsupported');
            }
            this._initGL(this.gl);
        }
        this._center = { x: 0, y: 0 };
        this._zoom = 1;
        this.RTT_WIDTH = RTT_WIDTH;
        console.log('R', this);
        this.dataframes = [];
    }

    _initGL(gl) {
        this.gl = gl;
        const OES_texture_float = gl.getExtension('OES_texture_float');
        if (!OES_texture_float) {
            throw new Error('WebGL extension OES_texture_float is unsupported');
        }
        const supportedRTT = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
        if (supportedRTT < RTT_WIDTH) {
            throw new Error(`WebGL parameter 'gl.MAX_RENDERBUFFER_SIZE' is below the requirement: ${supportedRTT} < ${RTT_WIDTH}`);
        }
        this._initShaders();

        this.auxFB = gl.createFramebuffer();

        // Create a VBO that covers the entire screen
        // Use a "big" triangle instead of a square for performance and simplicity
        this.bigTriangleVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bigTriangleVBO);
        var vertices = [
            10.0, -10.0,
            0.0, 10.0,
            -10.0, -10.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Create a 1x1 RGBA texture set to [0,0,0,0]
        // Needed because sometimes we don't really use some textures within the shader, but they are declared anyway.
        this.zeroTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.zeroTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array(4));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        this._AATex = gl.createTexture();
        this._AAFB = gl.createFramebuffer();

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, this.zeroTex);
    }

    /**
    * Get Renderer visualization center
    * @return {RPoint}
    */
    getCenter() {
        return { x: this._center.x, y: this._center.y };
    }

    /**
     * Set Renderer visualization center
     * @param {number} x
     * @param {number} y
     */
    setCenter(x, y) {
        this._center.x = x;
        this._center.y = y;
    }

    /**
     * Get Renderer visualization bounds
     * @return {*}
     */
    getBounds() {
        const center = this.getCenter();
        const sx = this.getZoom() * this.getAspect();
        const sy = this.getZoom();
        return [center.x - sx, center.y - sy, center.x + sx, center.y + sy];
    }

    /**
     * Get Renderer visualization zoom
     * @return {number}
     */
    getZoom() {
        return this._zoom;
    }

    /**
     * Set Renderer visualization zoom
     * @param {number} zoom
     */
    setZoom(zoom) {
        this._zoom = zoom;
    }


    /**
     * Removes a dataframe for the renderer. Freeing its resources.
     * @param {*} tile
     */
    removeDataframe(dataframe) {
        this.dataframes = this.dataframes.filter(t => t !== dataframe);
    }

    /**
     * @description Adds a new dataframe to the renderer.
     *
     * Performance-intensive. The required allocation and copy of resources will happen synchronously.
     * To achieve good performance, avoid multiple calls within the same event, particularly with large dataframes.
     * @param {Dataframe} dataframe
     * @returns {BoundDataframe}
     */
    addDataframe(dataframe) {
        dataframe.bind(this);
        this.dataframes.push(dataframe);
    }

    getAspect() {
        if (this.gl) {
            return this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        }
        return 1;
    }


    getStyledTiles() {
        return this.dataframes.filter(tile => tile.style && tile.visible && tile.style.colorShader);
    }


    _computeDrawMetadata() {
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        const tiles = this.getStyledTiles();
        let drawMetadata = {
            freeTexUnit: 4,
            zoom: 1. / this._zoom,
            columns: []
        };
        let requiredColumns = tiles.map(d => {
            const colorRequirements = d.style.getColor()._getDrawMetadataRequirements();
            const widthRequirements = d.style.getWidth()._getDrawMetadataRequirements();
            const strokeColorRequirements = d.style.getStrokeColor()._getDrawMetadataRequirements();
            const strokeWidthRequirements = d.style.getStrokeWidth()._getDrawMetadataRequirements();
            const filterRequirements = d.style.filter._getDrawMetadataRequirements();
            return [widthRequirements, colorRequirements, strokeColorRequirements, strokeWidthRequirements, filterRequirements].
                reduce(__WEBPACK_IMPORTED_MODULE_1__schema__["union"], __WEBPACK_IMPORTED_MODULE_1__schema__["IDENTITY"]);
        }).reduce(__WEBPACK_IMPORTED_MODULE_1__schema__["union"], __WEBPACK_IMPORTED_MODULE_1__schema__["IDENTITY"]).columns;

        requiredColumns.map(column => {
            drawMetadata.columns.push(
                {
                    name: column,
                    min: Number.POSITIVE_INFINITY,
                    max: Number.NEGATIVE_INFINITY,
                    avg: undefined,
                    count: 0,
                    sum: 0,
                    histogramBuckets: HISTOGRAM_BUCKETS,
                    histogram: Array.from({ length: HISTOGRAM_BUCKETS }, () => 0),
                    accumHistogram: Array.from({ length: HISTOGRAM_BUCKETS }, () => 0),
                }
            );
        });

        const s = 1. / this._zoom;
        tiles.map(d => {
            requiredColumns.map(column => {
                const values = d.properties[column];
                let min = Number.POSITIVE_INFINITY;
                let max = Number.NEGATIVE_INFINITY;
                let sum = 0;
                let count = 0;
                d.vertexScale = [(s / aspect) * d.scale, s * d.scale];
                d.vertexOffset = [(s / aspect) * (this._center.x - d.center.x), s * (this._center.y - d.center.y)];
                const minx = (-1 + d.vertexOffset[0]) / d.vertexScale[0];
                const maxx = (1 + d.vertexOffset[0]) / d.vertexScale[0];
                const miny = (-1 + d.vertexOffset[1]) / d.vertexScale[1];
                const maxy = (1 + d.vertexOffset[1]) / d.vertexScale[1];
                for (let i = 0; i < d.numFeatures; i++) {
                    const x = d.geom[2 * i + 0];
                    const y = d.geom[2 * i + 1];
                    if (x > minx && x < maxx && y > miny && y < maxy) {
                        const v = values[i];
                        if (!Number.isFinite(v)) {
                            continue;
                        }
                        sum += v;
                        min = Math.min(min, v);
                        max = Math.max(max, v);
                        count++;
                    }
                }
                const metaColumn = drawMetadata.columns.find(c => c.name == column);
                metaColumn.min = Math.min(min, metaColumn.min);
                metaColumn.max = Math.max(max, metaColumn.max);
                metaColumn.count += count;
                metaColumn.sum += sum;
            });
        });
        requiredColumns.map(column => {
            const metaColumn = drawMetadata.columns.find(c => c.name == column);
            metaColumn.avg = metaColumn.sum / metaColumn.count;
        });
        tiles.map(d => {
            requiredColumns.map(column => {
                const values = d.properties[column];
                const metaColumn = drawMetadata.columns.find(c => c.name == column);
                d.vertexScale = [(s / aspect) * d.scale, s * d.scale];
                d.vertexOffset = [(s / aspect) * (this._center.x - d.center.x), s * (this._center.y - d.center.y)];
                const minx = (-1 + d.vertexOffset[0]) / d.vertexScale[0];
                const maxx = (1 + d.vertexOffset[0]) / d.vertexScale[0];
                const miny = (-1 + d.vertexOffset[1]) / d.vertexScale[1];
                const maxy = (1 + d.vertexOffset[1]) / d.vertexScale[1];
                const vmin = metaColumn.min;
                const vmax = metaColumn.max;
                const vdiff = vmax - vmin;
                for (let i = 0; i < d.numFeatures; i++) {
                    const x = d.geom[2 * i + 0];
                    const y = d.geom[2 * i + 1];
                    if (x > minx && x < maxx && y > miny && y < maxy) {
                        const v = values[i];
                        if (!Number.isFinite(v)) {
                            continue;
                        }
                        metaColumn.histogram[Math.ceil(999 * (v - vmin) / vdiff)]++;
                    }
                }
            });
        });
        requiredColumns.map(column => {
            const metaColumn = drawMetadata.columns.find(c => c.name == column);
            for (let i = 1; i < metaColumn.histogramBuckets; i++) {
                metaColumn.accumHistogram[i] = metaColumn.accumHistogram[i - 1] + metaColumn.histogram[i];
            }
        });
        return drawMetadata;
    }

    refresh(timestamp) {
        const gl = this.gl;
        // Don't re-render more than once per animation frame
        if (this.lastFrame === timestamp) {
            return;
        }

        var width = gl.canvas.clientWidth;
        var height = gl.canvas.clientHeight;
        if (gl.canvas.width != width ||
            gl.canvas.height != height) {
            gl.canvas.width = width;
            gl.canvas.height = height;
        }
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

        gl.enable(gl.CULL_FACE);

        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.STENCIL_TEST);
        gl.depthMask(false);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.auxFB);

        const tiles = this.getStyledTiles();

        const drawMetadata = this._computeDrawMetadata();

        const styleTile = (tile, tileTexture, shader, styleExpr, TID) => {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tileTexture, 0);
            gl.viewport(0, 0, RTT_WIDTH, tile.height);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(shader.program);
            for (let i = 0; i < 16; i++) {
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, this.zeroTex);
                gl.uniform1i(shader.textureLocations[i], 0);
            }

            drawMetadata.freeTexUnit = 4;
            styleExpr._preDraw(drawMetadata, gl);

            Object.keys(TID).forEach((name, i) => {
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[tile.propertyID[name]]);
                gl.uniform1i(shader.textureLocations[i], i);
            });

            gl.enableVertexAttribArray(shader.vertexAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bigTriangleVBO);
            gl.vertexAttribPointer(shader.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.disableVertexAttribArray(shader.vertexAttribute);
        };
        tiles.map(tile => styleTile(tile, tile.texColor, tile.style.colorShader, tile.style.getColor(), tile.style.propertyColorTID));
        tiles.map(tile => styleTile(tile, tile.texWidth, tile.style.widthShader, tile.style.getWidth(), tile.style.propertyWidthTID));
        tiles.map(tile => styleTile(tile, tile.texStrokeColor, tile.style.strokeColorShader, tile.style.getStrokeColor(), tile.style.propertyStrokeColorTID));
        tiles.map(tile => styleTile(tile, tile.texStrokeWidth, tile.style.strokeWidthShader, tile.style.getStrokeWidth(), tile.style.propertyStrokeWidthTID));
        tiles.map(tile => styleTile(tile, tile.texFilter, tile.style.filterShader, tile.style.filter, tile.style.propertyFilterTID));

        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        if (tiles.length && tiles[0].type != 'point') {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._AAFB);
            const [w, h] = [gl.drawingBufferWidth, gl.drawingBufferHeight];

            if (w != this._width || h != this._height) {
                gl.bindTexture(gl.TEXTURE_2D, this._AATex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                    w * 2, h * 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._AATex, 0);

                [this._width, this._height] = [w, h];
            }
            gl.viewport(0, 0, w * 2, h * 2);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }

        const s = 1. / this._zoom;

        const { orderingMins, orderingMaxs } = getOrderingRenderBuckets(tiles);

        const renderDrawPass = orderingIndex => tiles.forEach(tile => {

            let renderer = null;
            if (tile.type == 'point') {
                renderer = this.finalRendererProgram;
            } else if (tile.type == 'line') {
                renderer = this.lineRendererProgram;
            } else {
                renderer = this.triRendererProgram;
            }
            gl.useProgram(renderer.program);

            //Set filtering condition on "... AND feature is in current order bucket"
            gl.uniform1f(renderer.orderMinWidth, orderingMins[orderingIndex]);
            gl.uniform1f(renderer.orderMaxWidth, orderingMaxs[orderingIndex]);

            gl.uniform2f(renderer.vertexScaleUniformLocation,
                (s / aspect) * tile.scale,
                s * tile.scale);
            gl.uniform2f(renderer.vertexOffsetUniformLocation,
                (s / aspect) * (this._center.x - tile.center.x),
                s * (this._center.y - tile.center.y));

            tile.vertexScale = [(s / aspect) * tile.scale, s * tile.scale];

            tile.vertexOffset = [(s / aspect) * (this._center.x - tile.center.x), s * (this._center.y - tile.center.y)];

            gl.enableVertexAttribArray(renderer.vertexPositionAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, tile.vertexBuffer);
            gl.vertexAttribPointer(renderer.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);


            gl.enableVertexAttribArray(renderer.featureIdAttr);
            gl.bindBuffer(gl.ARRAY_BUFFER, tile.featureIDBuffer);
            gl.vertexAttribPointer(renderer.featureIdAttr, 2, gl.FLOAT, false, 0, 0);

            if (tile.type == 'line') {
                gl.enableVertexAttribArray(renderer.normalAttr);
                gl.bindBuffer(gl.ARRAY_BUFFER, tile.normalBuffer);
                gl.vertexAttribPointer(renderer.normalAttr, 2, gl.FLOAT, false, 0, 0);
            }

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, tile.texColor);
            gl.uniform1i(renderer.colorTexture, 0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, tile.texWidth);
            gl.uniform1i(renderer.widthTexture, 1);


            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, tile.texFilter);
            gl.uniform1i(renderer.filterTexture, 2);

            if (tile.type == 'point') {
                // Lines and polygons don't support stroke
                gl.activeTexture(gl.TEXTURE3);
                gl.bindTexture(gl.TEXTURE_2D, tile.texStrokeColor);
                gl.uniform1i(renderer.colorStrokeTexture, 3);

                gl.activeTexture(gl.TEXTURE4);
                gl.bindTexture(gl.TEXTURE_2D, tile.texStrokeWidth);
                gl.uniform1i(renderer.strokeWidthTexture, 4);
            }

            gl.drawArrays(tile.type == 'point' ? gl.POINTS : gl.TRIANGLES, 0, tile.numVertex);

            gl.disableVertexAttribArray(renderer.vertexPositionAttribute);
            gl.disableVertexAttribArray(renderer.featureIdAttr);
            if (tile.type == 'line') {
                gl.disableVertexAttribArray(renderer.normalAttr);
            }
        });
        orderingMins.map((_, orderingIndex) => {
            renderDrawPass(orderingIndex);
        });

        if (tiles.length && tiles[0].type != 'point') {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

            gl.useProgram(this._aaBlendShader.program);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this._AATex);
            gl.uniform1i(this._aaBlendShader.readTU, 0);

            gl.enableVertexAttribArray(this._aaBlendShader.vertexAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bigTriangleVBO);
            gl.vertexAttribPointer(this._aaBlendShader.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.disableVertexAttribArray(this._aaBlendShader.vertexAttribute);
        }

        gl.disable(gl.CULL_FACE);
    }


    /**
     * Initialize static shaders
     */
    _initShaders() {
        this.finalRendererProgram = __WEBPACK_IMPORTED_MODULE_0__shaders__["b" /* renderer */].createPointShader(this.gl);
        this.triRendererProgram = __WEBPACK_IMPORTED_MODULE_0__shaders__["b" /* renderer */].createTriShader(this.gl);
        this.lineRendererProgram = __WEBPACK_IMPORTED_MODULE_0__shaders__["b" /* renderer */].createLineShader(this.gl);
        this._aaBlendShader = new __WEBPACK_IMPORTED_MODULE_0__shaders__["a" /* AABlender */](this.gl);
    }
}

function getOrderingRenderBuckets(tiles) {
    let orderer = null;
    if (tiles.length > 0) {
        orderer = tiles[0].style.getOrder();
    }
    let orderingMins = [0];
    let orderingMaxs = [1000];
    if (orderer instanceof __WEBPACK_IMPORTED_MODULE_3__style_functions__["Asc"]) {
        orderingMins = Array.from({ length: 16 }, (_, i) => (15 - i) * 2);
        orderingMaxs = Array.from({ length: 16 }, (_, i) => i == 0 ? 1000 : (15 - i + 1) * 2);
    } else if (orderer instanceof __WEBPACK_IMPORTED_MODULE_3__style_functions__["Desc"]) {
        orderingMins = Array.from({ length: 16 }, (_, i) => i * 2);
        orderingMaxs = Array.from({ length: 16 }, (_, i) => i == 15 ? 1000 : (i + 1) * 2);
    }
    return {
        orderingMins,
        orderingMaxs
    };
}




/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__animate__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__expression__ = __webpack_require__(0);




class Blend extends __WEBPACK_IMPORTED_MODULE_2__expression__["a" /* default */] {
    /**
     * @description Interpolate from *a* to *b* based on *mix*
     * @param {*} a can be a color or a number
     * @param {*} b type must match a's type
     * @param {*} mix interpolation parameter in the [0,1] range
     */
    constructor(a, b, mix, interpolator) {
        a = Object(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* implicitCast */])(a);
        b = Object(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* implicitCast */])(b);
        mix = Object(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* implicitCast */])(mix);
        const originalMix = mix;
        if (interpolator) {
            mix = interpolator(mix);
        }
        super({ a: a, b: b, mix: mix });
        this.originalMix = originalMix;
    }
    _compile(meta) {
        super._compile(meta);
        if (this.mix.type != 'float') {
            throw new Error(`Blending cannot be performed by '${this.mix.type}'`);
        }
        if (this.a.type == 'float' && this.b.type == 'float') {
            this.type = 'float';
        } else if (this.a.type == 'color' && this.b.type == 'color') {
            this.type = 'color';
        } else {
            throw new Error(`Blending cannot be performed between types '${this.a.type}' and '${this.b.type}'`);
        }
        this.inlineMaker = inline => `mix(${inline.a}, ${inline.b}, clamp(${inline.mix}, 0., 1.))`;
    }
    _preDraw(...args) {
        super._preDraw(...args);
        if (this.originalMix instanceof __WEBPACK_IMPORTED_MODULE_1__animate__["a" /* default */] && !this.originalMix.isAnimated()) {
            this.parent._replaceChild(this, this.b);
            this.notify();
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Blend;



/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);



class Float extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    /**
     * @jsapi
     * @param {*} x
     */
    constructor(x) {
        if (!Number.isFinite(x)) {
            throw new Error(`Invalid arguments to Float(): ${x}`);
        }
        super({});
        this.expr = x;
        this.type = 'float';
    }

    _applyToShaderSource(uniformIDMaker) {
        this._uniformID = uniformIDMaker();
        return {
            preface: `uniform float float${this._uniformID};\n`,
            inline: `float${this._uniformID}`
        };
    }

    _postShaderCompile(program, gl) {
        this._uniformLocation = gl.getUniformLocation(program, `float${this._uniformID}`);
    }

    _preDraw(drawMetadata, gl) {
        gl.uniform1f(this._uniformLocation, this.expr);
    }

    isAnimated() {
        return false;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Float;



/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);



class FloatConstant extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    /**
     * @jsapi
     * @param {*} x
     */
    constructor(x) {
        if (!Number.isFinite(x)) {
            throw new Error(`Invalid arguments to Float(): ${x}`);
        }
        super({});
        this.expr = x;
        this.type = 'float';
        this.inlineMaker = ()=> `(${x.toFixed(20)})`;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = FloatConstant;


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);


class Category extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    /**
     * @jsapi
     * @param {*} x
     */
    constructor(x) {
        if (typeof x !== 'string') {
            throw new Error(`Invalid arguments to Category(): ${x}`);
        }
        super({});
        this.expr = x;
    }
    _compile(metadata) {
        this.type = 'category';
        this._metadata = metadata;
    }
    _applyToShaderSource(uniformIDMaker) {
        this._uniformID = uniformIDMaker();
        return {
            preface: `uniform float cat${this._uniformID};\n`,
            inline: `cat${this._uniformID}`
        };
    }
    _postShaderCompile(program, gl) {
        this._uniformLocation = gl.getUniformLocation(program, `cat${this._uniformID}`);
    }
    _preDraw(drawMetadata, gl) {
        const id = this._metadata.categoryIDs[this.expr];
        gl.uniform1f(this._uniformLocation, id);
    }
    isAnimated() {
        return false;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Category;


/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);


class Property extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    /**
     * @jsapi
     * @param {*} name Property/column name
     */
    constructor(name) {
        if (typeof name !== 'string' || name == '') {
            throw new Error(`Invalid property name '${name}'`);
        }
        super({});
        this.name = name;
    }
    _compile(meta) {
        const metaColumn = meta.columns.find(c => c.name == this.name);
        if (!metaColumn) {
            throw new Error(`Property '${this.name}' does not exist`);
        }
        this.type = metaColumn.type;
        if (this.type == 'category') {
            this.numCategories = metaColumn.categoryNames.length;
        }
        super._setGenericGLSL((childInlines, uniformIDMaker, propertyTIDMaker) => `p${propertyTIDMaker(this.name)}`);
    }
    _getMinimumNeededSchema() {
        return {
            columns: [
                this.name
            ]
        };
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Property;


/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__expression__ = __webpack_require__(0);




function IN_INLINE_MAKER(categories) {
    return inline => `(${categories.map((cat, index) => `(${inline.property} == ${inline[`arg${index}`]})`).join(' || ')})? 1.: 0.`;
}

function NIN_INLINE_MAKER(categories) {
    return inline => `(${categories.map((cat, index) => `(${inline.property} != ${inline[`arg${index}`]})`).join(' && ')})? 1.: 0.`;
}

/**
 * Check if property belongs to the acceptedCategories list of categories
 * @param {*} property 
 * @param {*} acceptedCategories 
 * @memberof carto.style.expressions
 * @name in
 * @api
 */
const In = generateBelongsExpression(IN_INLINE_MAKER);
/* harmony export (immutable) */ __webpack_exports__["a"] = In;


/**
 * Check if property does not belong to the categories list of categories
 * @param {*} property 
 * @param {*} categories 
 * @memberof carto.style.expressions
 * @name nin
 * @api
 */
const Nin = generateBelongsExpression(NIN_INLINE_MAKER);
/* harmony export (immutable) */ __webpack_exports__["b"] = Nin;





function generateBelongsExpression(inlineMaker) {

    return class BelongExpression extends __WEBPACK_IMPORTED_MODULE_1__expression__["a" /* default */] {
        constructor(property, ...categories) {
            categories = categories.map(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* implicitCast */]);
            let children = {
                property
            };
            categories.map((arg, index) => children[`arg${index}`] = arg);
            super(children);
            this.categories = categories;
            this.inlineMaker = inlineMaker(this.categories);
        }

        _compile(meta) {
            super._compile(meta);
            if (this.property.type != 'category') {
                throw new Error('In() can only be performed to categorical properties');
            }
            this.categories.map(cat => {
                if (cat.type != 'category') {
                    throw new Error('In() can only be performed to categorical properties');
                }
            });
            this.type = 'float';
        }
    };

}


/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);


/** 
 * Check if a given value belongs to an inclusive range (including limits).
 */
class Between extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    constructor(value, lowerLimit, upperLimit) {
        super({ value, lowerLimit, upperLimit });
        this.type = 'float';
    }

    _compile(meta) {
        super._compile(meta);
        if (this.value.type != 'float') {
            throw new Error('Between() can only be performed to float properties');
        }
        if (this.lowerLimit.type != 'float') {
            throw new Error('Between() can only be performed to float properties');
        }
        if (this.upperLimit.type != 'float') {
            throw new Error('Between() can only be performed to float properties');
        }
        this.inlineMaker = inline => `((${inline.value} >= ${inline.lowerLimit} &&  ${inline.value} <= ${inline.upperLimit}) ? 1. : 0.)`;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Between;



/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__expression__ = __webpack_require__(0);




class ILinear extends genInterpolator(inner => inner) { }
/* harmony export (immutable) */ __webpack_exports__["b"] = ILinear;

class BounceEaseIn extends genInterpolator(inner => `BounceEaseIn(${inner})`,
    `
    #ifndef BOUNCE_EASE_IN
    #define BOUNCE_EASE_IN
    float BounceEaseIn_BounceEaseOut(float p)
    {
        if(p < 4./11.0)
        {
            return (121. * p * p)/16.0;
        }
        else if(p < 8./11.0)
        {
            return (363./40.0 * p * p) - (99./10.0 * p) + 17./5.0;
        }
        else if(p < 9./10.0)
        {
            return (4356./361.0 * p * p) - (35442./1805.0 * p) + 16061./1805.0;
        }
        else
        {
            return (54./5.0 * p * p) - (513./25.0 * p) + 268./25.0;
        }
    }
    float BounceEaseIn(float p)
    {
        return 1. - BounceEaseOut(1. - p);
    }
    #endif

`) { }
/* unused harmony export BounceEaseIn */

class Cubic extends genInterpolator(inner => `cubicEaseInOut(${inner})`,
    `
    #ifndef CUBIC
    #define CUBIC
    float cubicEaseInOut(float p){
        if (p < 0.5) {
            return 4. * p * p * p;
        }else {
            float f = ((2. * p) - 2.);
            return 0.5 * f * f * f + 1.;
        }
    }
    #endif
`) { }
/* harmony export (immutable) */ __webpack_exports__["a"] = Cubic;



// Interpolators
function genInterpolator(inlineMaker, preface) {
    const fn = class Interpolator extends __WEBPACK_IMPORTED_MODULE_1__expression__["a" /* default */] {
        constructor(m) {
            m = Object(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* implicitCast */])(m);
            super({ m: m });
        }
        _compile(meta) {
            super._compile(meta);
            if (this.m.type != 'float') {
                throw new Error(`Blending cannot be performed by '${this.m.type}'`);
            }
            this.type = 'float';
            this._setGenericGLSL(inline => inlineMaker(inline.m), preface);
        }
    };
    fn.type = 'interpolator';
    return fn;

}

/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return renderer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return styler; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AABlender; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__renderer__ = __webpack_require__(51);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__styler__ = __webpack_require__(55);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__aaBlender__ = __webpack_require__(56);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__shader_cache__ = __webpack_require__(57);





const NUM_TEXTURE_LOCATIONS = 4;
const shaderCache = new __WEBPACK_IMPORTED_MODULE_3__shader_cache__["a" /* default */]();

function compileShader(gl, sourceCode, type) {
    if (shaderCache.has(gl, sourceCode)) {
        return shaderCache.get(gl, sourceCode);
    }
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('An error occurred compiling the shaders: ' + log + '\nSource:\n' + sourceCode);
    }
    shaderCache.set(gl, sourceCode, shader);
    return shader;
}

function compileProgram(gl, glslVS, glslFS) {
    const VS = compileShader(gl, glslVS, gl.VERTEX_SHADER);
    const FS = compileShader(gl, glslFS, gl.FRAGMENT_SHADER);
    this.program = gl.createProgram();
    gl.attachShader(this.program, VS);
    gl.attachShader(this.program, FS);
    gl.linkProgram(this.program);
    gl.deleteShader(VS);
    gl.deleteShader(FS);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        throw new Error('Unable to link the shader program: ' + gl.getProgramInfoLog(this.program));
    }
}

class AABlender {
    constructor(gl) {
        compileProgram.call(this, gl, __WEBPACK_IMPORTED_MODULE_2__aaBlender__["b" /* VS */], __WEBPACK_IMPORTED_MODULE_2__aaBlender__["a" /* FS */]);
        this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
        this.readTU = gl.getUniformLocation(this.program, 'aaTex');
    }
}

class Point {
    constructor(gl) {
        compileProgram.call(this, gl, __WEBPACK_IMPORTED_MODULE_0__renderer__["b" /* point */].VS, __WEBPACK_IMPORTED_MODULE_0__renderer__["b" /* point */].FS);
        this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
        this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
        this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
        this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
        this.colorTexture = gl.getUniformLocation(this.program, 'colorTex');
        this.colorStrokeTexture = gl.getUniformLocation(this.program, 'colorStrokeTex');
        this.strokeWidthTexture = gl.getUniformLocation(this.program, 'strokeWidthTex');
        this.widthTexture = gl.getUniformLocation(this.program, 'widthTex');
        this.orderMinWidth = gl.getUniformLocation(this.program, 'orderMinWidth');
        this.orderMaxWidth = gl.getUniformLocation(this.program, 'orderMaxWidth');
        this.filterTexture = gl.getUniformLocation(this.program, 'filterTex');
    }
}
class Tri {
    constructor(gl) {
        compileProgram.call(this, gl, __WEBPACK_IMPORTED_MODULE_0__renderer__["c" /* tris */].VS, __WEBPACK_IMPORTED_MODULE_0__renderer__["c" /* tris */].FS);
        this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
        this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
        this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
        this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
        this.colorTexture = gl.getUniformLocation(this.program, 'colorTex');
        this.filterTexture = gl.getUniformLocation(this.program, 'filterTex');
    }
}
class Line {
    constructor(gl) {
        compileProgram.call(this, gl, __WEBPACK_IMPORTED_MODULE_0__renderer__["a" /* line */].VS, __WEBPACK_IMPORTED_MODULE_0__renderer__["a" /* line */].FS);
        this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
        this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
        this.normalAttr = gl.getAttribLocation(this.program, 'normal');
        this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
        this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
        this.colorTexture = gl.getUniformLocation(this.program, 'colorTex');
        this.widthTexture = gl.getUniformLocation(this.program, 'widthTex');
        this.filterTexture = gl.getUniformLocation(this.program, 'filterTex');
    }
}
class GenericStyler {
    constructor(gl, glsl, preface, inline) {
        const VS = glsl.VS;
        let FS = glsl.FS;
        FS = FS.replace('$PREFACE', preface);
        FS = FS.replace('$INLINE', inline);
        compileProgram.call(this, gl, VS, FS);
        this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
        this.textureLocations = [];
        for (let i = 0; i < NUM_TEXTURE_LOCATIONS; i++) {
            this.textureLocations[i] = gl.getUniformLocation(this.program, `property${i}`);
        }
    }
}
class Color extends GenericStyler {
    constructor(gl, preface, inline) {
        super(gl, __WEBPACK_IMPORTED_MODULE_1__styler__, '/*Color*/' + preface, inline);
    }
}
class Width extends GenericStyler {
    constructor(gl, preface, inline) {
        super(gl, __WEBPACK_IMPORTED_MODULE_1__styler__, '/*Width*/' + preface, `vec4((${inline})/64.)`);
    }
}

class Filter extends GenericStyler {
    constructor(gl, preface, inline) {
        super(gl, __WEBPACK_IMPORTED_MODULE_1__styler__, '/*Filter*/' + preface, `vec4(${inline})`);
    }
}

const renderer = {
    createPointShader: function (gl) {
        return new Point(gl);
    },
    createTriShader: function (gl) {
        return new Tri(gl);
    },
    createLineShader: function (gl) {
        return new Line(gl);
    }
};

const styler = {
    createColorShader: function (gl, preface, inline) {
        return new Color(gl, preface, inline);
    },
    createWidthShader: function (gl, preface, inline) {
        return new Width(gl, preface, inline);
    },
    createFilterShader: function (gl, preface, inline) {
        return new Filter(gl, preface, inline);
    }
};




/***/ }),
/* 21 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var VectorTileFeature = __webpack_require__(23);

module.exports = VectorTileLayer;

function VectorTileLayer(pbf, end) {
    // Public
    this.version = 1;
    this.name = null;
    this.extent = 4096;
    this.length = 0;

    // Private
    this._pbf = pbf;
    this._keys = [];
    this._values = [];
    this._features = [];

    pbf.readFields(readLayer, this, end);

    this.length = this._features.length;
}

function readLayer(tag, layer, pbf) {
    if (tag === 15) layer.version = pbf.readVarint();
    else if (tag === 1) layer.name = pbf.readString();
    else if (tag === 5) layer.extent = pbf.readVarint();
    else if (tag === 2) layer._features.push(pbf.pos);
    else if (tag === 3) layer._keys.push(pbf.readString());
    else if (tag === 4) layer._values.push(readValueMessage(pbf));
}

function readValueMessage(pbf) {
    var value = null,
        end = pbf.readVarint() + pbf.pos;

    while (pbf.pos < end) {
        var tag = pbf.readVarint() >> 3;

        value = tag === 1 ? pbf.readString() :
            tag === 2 ? pbf.readFloat() :
            tag === 3 ? pbf.readDouble() :
            tag === 4 ? pbf.readVarint64() :
            tag === 5 ? pbf.readVarint() :
            tag === 6 ? pbf.readSVarint() :
            tag === 7 ? pbf.readBoolean() : null;
    }

    return value;
}

// return feature `i` from this layer as a `VectorTileFeature`
VectorTileLayer.prototype.feature = function(i) {
    if (i < 0 || i >= this._features.length) throw new Error('feature index out of bounds');

    this._pbf.pos = this._features[i];

    var end = this._pbf.readVarint() + this._pbf.pos;
    return new VectorTileFeature(this._pbf, end, this.extent, this._keys, this._values);
};


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Point = __webpack_require__(74);

module.exports = VectorTileFeature;

function VectorTileFeature(pbf, end, extent, keys, values) {
    // Public
    this.properties = {};
    this.extent = extent;
    this.type = 0;

    // Private
    this._pbf = pbf;
    this._geometry = -1;
    this._keys = keys;
    this._values = values;

    pbf.readFields(readFeature, this, end);
}

function readFeature(tag, feature, pbf) {
    if (tag == 1) feature.id = pbf.readVarint();
    else if (tag == 2) readTag(pbf, feature);
    else if (tag == 3) feature.type = pbf.readVarint();
    else if (tag == 4) feature._geometry = pbf.pos;
}

function readTag(pbf, feature) {
    var end = pbf.readVarint() + pbf.pos;

    while (pbf.pos < end) {
        var key = feature._keys[pbf.readVarint()],
            value = feature._values[pbf.readVarint()];
        feature.properties[key] = value;
    }
}

VectorTileFeature.types = ['Unknown', 'Point', 'LineString', 'Polygon'];

VectorTileFeature.prototype.loadGeometry = function() {
    var pbf = this._pbf;
    pbf.pos = this._geometry;

    var end = pbf.readVarint() + pbf.pos,
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        lines = [],
        line;

    while (pbf.pos < end) {
        if (!length) {
            var cmdLen = pbf.readVarint();
            cmd = cmdLen & 0x7;
            length = cmdLen >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += pbf.readSVarint();
            y += pbf.readSVarint();

            if (cmd === 1) { // moveTo
                if (line) lines.push(line);
                line = [];
            }

            line.push(new Point(x, y));

        } else if (cmd === 7) {

            // Workaround for https://github.com/mapbox/mapnik-vector-tile/issues/90
            if (line) {
                line.push(line[0].clone()); // closePolygon
            }

        } else {
            throw new Error('unknown command ' + cmd);
        }
    }

    if (line) lines.push(line);

    return lines;
};

VectorTileFeature.prototype.bbox = function() {
    var pbf = this._pbf;
    pbf.pos = this._geometry;

    var end = pbf.readVarint() + pbf.pos,
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        x1 = Infinity,
        x2 = -Infinity,
        y1 = Infinity,
        y2 = -Infinity;

    while (pbf.pos < end) {
        if (!length) {
            var cmdLen = pbf.readVarint();
            cmd = cmdLen & 0x7;
            length = cmdLen >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += pbf.readSVarint();
            y += pbf.readSVarint();
            if (x < x1) x1 = x;
            if (x > x2) x2 = x;
            if (y < y1) y1 = y;
            if (y > y2) y2 = y;

        } else if (cmd !== 7) {
            throw new Error('unknown command ' + cmd);
        }
    }

    return [x1, y1, x2, y2];
};

VectorTileFeature.prototype.toGeoJSON = function(x, y, z) {
    var size = this.extent * Math.pow(2, z),
        x0 = this.extent * x,
        y0 = this.extent * y,
        coords = this.loadGeometry(),
        type = VectorTileFeature.types[this.type],
        i, j;

    function project(line) {
        for (var j = 0; j < line.length; j++) {
            var p = line[j], y2 = 180 - (p.y + y0) * 360 / size;
            line[j] = [
                (p.x + x0) * 360 / size - 180,
                360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90
            ];
        }
    }

    switch (this.type) {
    case 1:
        var points = [];
        for (i = 0; i < coords.length; i++) {
            points[i] = coords[i][0];
        }
        coords = points;
        project(coords);
        break;

    case 2:
        for (i = 0; i < coords.length; i++) {
            project(coords[i]);
        }
        break;

    case 3:
        coords = classifyRings(coords);
        for (i = 0; i < coords.length; i++) {
            for (j = 0; j < coords[i].length; j++) {
                project(coords[i][j]);
            }
        }
        break;
    }

    if (coords.length === 1) {
        coords = coords[0];
    } else {
        type = 'Multi' + type;
    }

    var result = {
        type: "Feature",
        geometry: {
            type: type,
            coordinates: coords
        },
        properties: this.properties
    };

    if ('id' in this) {
        result.id = this.id;
    }

    return result;
};

// classifies an array of rings into polygons with outer rings and holes

function classifyRings(rings) {
    var len = rings.length;

    if (len <= 1) return [rings];

    var polygons = [],
        polygon,
        ccw;

    for (var i = 0; i < len; i++) {
        var area = signedArea(rings[i]);
        if (area === 0) continue;

        if (ccw === undefined) ccw = area < 0;

        if (ccw === area < 0) {
            if (polygon) polygons.push(polygon);
            polygon = [rings[i]];

        } else {
            polygon.push(rings[i]);
        }
    }
    if (polygon) polygons.push(polygon);

    return polygons;
}

function signedArea(ring) {
    var sum = 0;
    for (var i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
        p1 = ring[i];
        p2 = ring[j];
        sum += (p2.x - p1.x) * (p1.y + p2.y);
    }
    return sum;
}


/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return setDefaultAuth; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return getDefaultAuth; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return checkAuth; });
/* unused harmony export cleanDefaultAuth */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__error_handling_carto_validation_error__ = __webpack_require__(5);




let defaultAuth = undefined;

/**
 * Set default authentication parameters: apiKey and user.
 *
 * @param {object} auth
 * @param {string} auth.apiKey - API key used to authenticate against CARTO
 * @param {string} auth.user - Name of the user
 *
 * @memberof carto
 * @api
 */
function setDefaultAuth(auth) {
    checkAuth(auth);
    defaultAuth = auth;
}

/**
 * Get default authentication
 * @return {object}
 */
function getDefaultAuth() {
    return defaultAuth;
}

/**
 * Reset the default auth object
 */
function cleanDefaultAuth() {
    defaultAuth = undefined;
}

/**
 * Check a valid auth parameter.
 *
 * @param  {object} auth
 */
function checkAuth(auth) {
    if (__WEBPACK_IMPORTED_MODULE_0__util__["d" /* isUndefined */](auth)) {
        throw new __WEBPACK_IMPORTED_MODULE_1__error_handling_carto_validation_error__["a" /* default */]('setup', 'authRequired');
    }
    if (!__WEBPACK_IMPORTED_MODULE_0__util__["b" /* isObject */](auth)) {
        throw new __WEBPACK_IMPORTED_MODULE_1__error_handling_carto_validation_error__["a" /* default */]('setup', 'authObjectRequired');
    }
    auth.username = auth.user; // API adapter
    checkApiKey(auth.apiKey);
    checkUsername(auth.username);
}

function checkApiKey(apiKey) {
    if (__WEBPACK_IMPORTED_MODULE_0__util__["d" /* isUndefined */](apiKey)) {
        throw new __WEBPACK_IMPORTED_MODULE_1__error_handling_carto_validation_error__["a" /* default */]('setup', 'apiKeyRequired');
    }
    if (!__WEBPACK_IMPORTED_MODULE_0__util__["c" /* isString */](apiKey)) {
        throw new __WEBPACK_IMPORTED_MODULE_1__error_handling_carto_validation_error__["a" /* default */]('setup', 'apiKeyStringRequired');
    }
    if (apiKey === '') {
        throw new __WEBPACK_IMPORTED_MODULE_1__error_handling_carto_validation_error__["a" /* default */]('setup', 'nonValidApiKey');
    }
}

function checkUsername(username) {
    if (__WEBPACK_IMPORTED_MODULE_0__util__["d" /* isUndefined */](username)) {
        throw new __WEBPACK_IMPORTED_MODULE_1__error_handling_carto_validation_error__["a" /* default */]('setup', 'usernameRequired');
    }
    if (!__WEBPACK_IMPORTED_MODULE_0__util__["c" /* isString */](username)) {
        throw new __WEBPACK_IMPORTED_MODULE_1__error_handling_carto_validation_error__["a" /* default */]('setup', 'usernameStringRequired');
    }
    if (username === '') {
        throw new __WEBPACK_IMPORTED_MODULE_1__error_handling_carto_validation_error__["a" /* default */]('setup', 'nonValidUsername');
    }
}




/***/ }),
/* 25 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return setDefaultConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return getDefaultConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return checkConfig; });
/* unused harmony export cleanDefaultConfig */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__error_handling_carto_validation_error__ = __webpack_require__(5);




let defaultConfig = undefined;

/**
 * Set default configuration parameters: serverURL.
 *
 * @param {object} options
 * @param {string} [options.serverURL='https://{user}.carto.com'] - URL of the CARTO Maps API server
 *
 * @memberof carto
 * @api
 */
function setDefaultConfig(config) {
    checkConfig(config);
    defaultConfig = config;
}

/**
 * Get default config
 * @return {object}
 */
function getDefaultConfig() {
    return defaultConfig;
}

/**
 * Clean default config object
 */
function cleanDefaultConfig() {
    defaultConfig = undefined;
}

/**
 * Check a valid config parameter.
 *
 * @param  {object} config
 */
function checkConfig(config) {
    if (config) {
        if (!__WEBPACK_IMPORTED_MODULE_0__util__["b" /* isObject */](config)) {
            throw new __WEBPACK_IMPORTED_MODULE_1__error_handling_carto_validation_error__["a" /* default */]('setup', 'configObjectRequired');
        }
        _checkServerURL(config.serverURL);
    }
}

function _checkServerURL(serverURL) {
    if (!__WEBPACK_IMPORTED_MODULE_0__util__["c" /* isString */](serverURL)) {
        throw new __WEBPACK_IMPORTED_MODULE_1__error_handling_carto_validation_error__["a" /* default */]('setup', 'serverURLStringRequired');
    }
}




/***/ }),
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__core_style_functions__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__core_schema__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__core_shaders__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__core_style_shader_compiler__ = __webpack_require__(78);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__core_style_parser__ = __webpack_require__(79);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__core_style_expressions_expression__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__error_handling_carto_validation_error__ = __webpack_require__(5);










const DEFAULT_RESOLUTION = 1;
const DEFAULT_COLOR_EXPRESSION = __WEBPACK_IMPORTED_MODULE_1__core_style_functions__["rgba"](0, 1, 0, 0.5);
const DEFAULT_WIDTH_EXPRESSION = __WEBPACK_IMPORTED_MODULE_1__core_style_functions__["float"](5);
const DEFAULT_STROKE_COLOR_EXPRESSION = __WEBPACK_IMPORTED_MODULE_1__core_style_functions__["rgba"](0, 1, 0, 0.5);
const DEFAULT_STROKE_WIDTH_EXPRESSION = __WEBPACK_IMPORTED_MODULE_1__core_style_functions__["float"](0);
const DEFAULT_ORDER_EXPRESSION = __WEBPACK_IMPORTED_MODULE_1__core_style_functions__["noOrder"]();
const DEFAULT_FILTER_EXPRESSION = __WEBPACK_IMPORTED_MODULE_1__core_style_functions__["floatConstant"](1);
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

class Style {

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
        return exprs.map(expr => expr._getMinimumNeededSchema()).reduce(__WEBPACK_IMPORTED_MODULE_2__core_schema__["union"], __WEBPACK_IMPORTED_MODULE_2__core_schema__["IDENTITY"]);
    }

    _compileColorShader(gl, metadata) {
        this._styleSpec.color._bind(metadata);
        const r = Object(__WEBPACK_IMPORTED_MODULE_4__core_style_shader_compiler__["a" /* compileShader */])(gl, this._styleSpec.color, __WEBPACK_IMPORTED_MODULE_3__core_shaders__["c" /* styler */].createColorShader);
        this.propertyColorTID = r.tid;
        this.colorShader = r.shader;
    }

    _compileWidthShader(gl, metadata) {
        this._styleSpec.width._bind(metadata);
        const r = Object(__WEBPACK_IMPORTED_MODULE_4__core_style_shader_compiler__["a" /* compileShader */])(gl, this._styleSpec.width, __WEBPACK_IMPORTED_MODULE_3__core_shaders__["c" /* styler */].createWidthShader);
        this.propertyWidthTID = r.tid;
        this.widthShader = r.shader;
    }

    _compileStrokeColorShader(gl, metadata) {
        this._styleSpec.strokeColor._bind(metadata);
        const r = Object(__WEBPACK_IMPORTED_MODULE_4__core_style_shader_compiler__["a" /* compileShader */])(gl, this._styleSpec.strokeColor, __WEBPACK_IMPORTED_MODULE_3__core_shaders__["c" /* styler */].createColorShader);
        this.propertyStrokeColorTID = r.tid;
        this.strokeColorShader = r.shader;
    }

    _compileStrokeWidthShader(gl, metadata) {
        this._styleSpec.strokeWidth._bind(metadata);
        const r = Object(__WEBPACK_IMPORTED_MODULE_4__core_style_shader_compiler__["a" /* compileShader */])(gl, this._styleSpec.strokeWidth, __WEBPACK_IMPORTED_MODULE_3__core_shaders__["c" /* styler */].createWidthShader);
        this.propertyStrokeWidthTID = r.tid;
        this.strokeWidthShader = r.shader;
    }

    _compileFilterShader(gl, metadata) {
        this._styleSpec.filter._bind(metadata);
        const r = Object(__WEBPACK_IMPORTED_MODULE_4__core_style_shader_compiler__["a" /* compileShader */])(gl, this._styleSpec.filter, __WEBPACK_IMPORTED_MODULE_3__core_shaders__["c" /* styler */].createFilterShader);
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
        if (__WEBPACK_IMPORTED_MODULE_0__util__["d" /* isUndefined */](definition)) {
            return this._setDefaults({});
        }
        if (__WEBPACK_IMPORTED_MODULE_0__util__["b" /* isObject */](definition)) {
            return this._setDefaults(definition);
        }
        if (__WEBPACK_IMPORTED_MODULE_0__util__["c" /* isString */](definition)) {
            return this._setDefaults(Object(__WEBPACK_IMPORTED_MODULE_5__core_style_parser__["a" /* parseStyleDefinition */])(definition));
        }
        throw new __WEBPACK_IMPORTED_MODULE_7__error_handling_carto_validation_error__["a" /* default */]('style', 'nonValidDefinition');
    }

    /**
     * Add default values to a styleSpec object.
     *
     * @param {StyleSpec} styleSpec
     * @return {StyleSpec}
     */
    _setDefaults(styleSpec) {
        styleSpec.resolution = __WEBPACK_IMPORTED_MODULE_0__util__["d" /* isUndefined */](styleSpec.resolution) ? DEFAULT_RESOLUTION : styleSpec.resolution;
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

        if (!__WEBPACK_IMPORTED_MODULE_0__util__["a" /* isNumber */](styleSpec.resolution)) {
            throw new __WEBPACK_IMPORTED_MODULE_7__error_handling_carto_validation_error__["a" /* default */]('style', 'resolutionNumberRequired');
        }
        if (!(styleSpec.color instanceof __WEBPACK_IMPORTED_MODULE_6__core_style_expressions_expression__["a" /* default */])) {
            throw new __WEBPACK_IMPORTED_MODULE_7__error_handling_carto_validation_error__["a" /* default */]('style', 'nonValidExpression[color]');
        }
        if (!(styleSpec.width instanceof __WEBPACK_IMPORTED_MODULE_6__core_style_expressions_expression__["a" /* default */])) {
            throw new __WEBPACK_IMPORTED_MODULE_7__error_handling_carto_validation_error__["a" /* default */]('style', 'nonValidExpression[width]');
        }
        if (!(styleSpec.strokeColor instanceof __WEBPACK_IMPORTED_MODULE_6__core_style_expressions_expression__["a" /* default */])) {
            throw new __WEBPACK_IMPORTED_MODULE_7__error_handling_carto_validation_error__["a" /* default */]('style', 'nonValidExpression[strokeColor]');
        }
        if (!(styleSpec.strokeWidth instanceof __WEBPACK_IMPORTED_MODULE_6__core_style_expressions_expression__["a" /* default */])) {
            throw new __WEBPACK_IMPORTED_MODULE_7__error_handling_carto_validation_error__["a" /* default */]('style', 'nonValidExpression[strokeWidth]');
        }
        if (!(styleSpec.order instanceof __WEBPACK_IMPORTED_MODULE_6__core_style_expressions_expression__["a" /* default */])) {
            throw new __WEBPACK_IMPORTED_MODULE_7__error_handling_carto_validation_error__["a" /* default */]('style', 'nonValidExpression[order]');
        }
        if (!(styleSpec.filter instanceof __WEBPACK_IMPORTED_MODULE_6__core_style_expressions_expression__["a" /* default */])) {
            throw new __WEBPACK_IMPORTED_MODULE_7__error_handling_carto_validation_error__["a" /* default */]('style', 'nonValidExpression[filter]');
        }
        for (let key in styleSpec) {
            if (SUPPORTED_PROPERTIES.indexOf(key) === -1) {
                console.warn(`Property '${key}' is not supported`);
            }
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Style;



/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * @description A simple non-interactive map.
 */

class Map {

    /**
     * Create a simple carto.Map by specifying a container `id`.
     *
     * @param  {object} options
     * @param  {string} options.container The element's string `id`.
     *
     * @constructor Map
     * @memberof carto
     */
    constructor(options) {
        options = options || {};

        if (typeof options.container === 'string') {
            const container = window.document.getElementById(options.container);
            if (!container) {
                throw new Error(`Container '${options.container}' not found.`);
            } else {
                this._container = container;
            }
        }
        this._background = options.background || '';

        this._layers = [];
        this._repaint = true;
        this._canvas = this._createCanvas();
        this._container.appendChild(this._canvas);
        this._gl = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');

        this._resizeCanvas(this._containerDimensions());
    }

    addLayer(layer, beforeLayerID) {
        layer.requestData();

        let index;
        for (index = 0; index < this._layers.length; index++) {
            if (this._layers[index].getId() === beforeLayerID) {
                break;
            }
        }
        this._layers.splice(index, 0, layer);

        window.requestAnimationFrame(this.update.bind(this));
    }

    update() {
        this._drawBackground(this._background);

        let loaded = true;
        let animated = false;
        this._layers.forEach((layer) => {
            const hasData = layer.hasDataframes();
            const hasAnimation = layer.getStyle().isAnimated();
            if (hasData || hasAnimation) {
                layer.paintCallback();
            }
            loaded = loaded && hasData;
            animated = animated || hasAnimation;
        });

        // Update until all layers are loaded or there is an animation
        if (!loaded || animated) {
            window.requestAnimationFrame(this.update.bind(this));
        }
    }

    _drawBackground(color) {
        switch (color) {
        case 'black':
            this._gl.clearColor(0, 0, 0, 1);
            this._gl.clear(this._gl.COLOR_BUFFER_BIT);
            break;
        case 'red':
            this._gl.clearColor(1, 0, 0, 1);
            this._gl.clear(this._gl.COLOR_BUFFER_BIT);
            break;
        case 'green':
            this._gl.clearColor(0, 1, 0, 1);
            this._gl.clear(this._gl.COLOR_BUFFER_BIT);
            break;
        case 'blue':
            this._gl.clearColor(0, 0, 1, 1);
            this._gl.clear(this._gl.COLOR_BUFFER_BIT);
            break;
        default:
            // white
        }
    }

    _createCanvas() {
        const canvas = window.document.createElement('canvas');

        canvas.className = 'canvas';
        canvas.style.position = 'absolute';

        return canvas;
    }

    _containerDimensions() {
        let width = 0;
        let height = 0;

        if (this._container) {
            width = this._container.offsetWidth || 400;
            height = this._container.offsetHeight || 300;
        }

        return { width, height };
    }

    _resizeCanvas(size) {
        const pixelRatio = window.devicePixelRatio || 1;

        this._canvas.width = pixelRatio * size.width;
        this._canvas.height = pixelRatio * size.height;

        this._canvas.style.width = `${size.width}px`;
        this._canvas.style.height = `${size.height}px`;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Map;



/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "source", function() { return source; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "style", function() { return style; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_style_functions__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__api_source_dataset__ = __webpack_require__(49);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__api_layer__ = __webpack_require__(77);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__api_source_sql__ = __webpack_require__(83);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__api_style__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__api_setup_auth_service__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__api_setup_config_service__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__api_map__ = __webpack_require__(27);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Layer", function() { return __WEBPACK_IMPORTED_MODULE_2__api_layer__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "setDefaultAuth", function() { return __WEBPACK_IMPORTED_MODULE_5__api_setup_auth_service__["c"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "setDefaultConfig", function() { return __WEBPACK_IMPORTED_MODULE_6__api_setup_config_service__["c"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Style", function() { return __WEBPACK_IMPORTED_MODULE_4__api_style__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Map", function() { return __WEBPACK_IMPORTED_MODULE_7__api_map__["a"]; });
/**
 *  @api
 *  @namespace carto
 *
 *  @description
 *  # CARTO GL
 *  All the library features are exposed through the `carto` namespace.
 */










// Namespaces
const style = { expressions: __WEBPACK_IMPORTED_MODULE_0__core_style_functions__ };
const source = { Dataset: __WEBPACK_IMPORTED_MODULE_1__api_source_dataset__["a" /* default */], SQL: __WEBPACK_IMPORTED_MODULE_3__api_source_sql__["a" /* default */] };




/***/ }),
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return palettes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Inverse; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_cartocolor__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_cartocolor___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_cartocolor__);


class PaletteGenerator {
    constructor(name, subPalettes) {
        this.type = 'paletteGenerator';
        this.name = name;
        this.subPalettes = subPalettes;
        this.tags = subPalettes.tags;
    }
    getLongestSubPalette() {
        const s = this.subPalettes;
        for (let i = 20; i >= 0; i--) {
            if (s[i]) {
                return s[i];
            }
        }
    }
}

const palettes = {};

Object.keys(__WEBPACK_IMPORTED_MODULE_0_cartocolor__).map(name => {
    palettes[`${name.toLowerCase()}`] = new PaletteGenerator(name, __WEBPACK_IMPORTED_MODULE_0_cartocolor__[name]);
});

class Inverse {
    constructor(palette) {
        this.type = 'paletteGenerator';
        this._originalPalette = palette;
        this.tags = palette.tags;
        this.subPalettes = new Proxy(palette.subPalettes, {
            get: (target, name) => {
                if (Number.isFinite(Number(name)) && Array.isArray(target[name])) {
                    return this._reversePalette(target[name]);
                }
                return target[name];
            }
        });
    }
    getLongestSubPalette() {
        return this._reversePalette(this._originalPalette.getLongestSubPalette());
    }
    _reversePalette(palette) {
        if (this.tags.includes('qualitative')) {
            // Last color is 'others', therefore, we shouldn't change the order of that one
            const copy = [...palette];
            const others = copy.pop();
            return [...copy.reverse(), others];

        }
        return [...palette].reverse();
    }
}




/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(31);


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;!function() {

var cartocolor = {
    "Burg": {
        "2": [
            "#ffc6c4",
            "#672044"
        ],
        "3": [
            "#ffc6c4",
            "#cc607d",
            "#672044"
        ],
        "4": [
            "#ffc6c4",
            "#e38191",
            "#ad466c",
            "#672044"
        ],
        "5": [
            "#ffc6c4",
            "#ee919b",
            "#cc607d",
            "#9e3963",
            "#672044"
        ],
        "6": [
            "#ffc6c4",
            "#f29ca3",
            "#da7489",
            "#b95073",
            "#93345d",
            "#672044"
        ],
        "7": [
            "#ffc6c4",
            "#f4a3a8",
            "#e38191",
            "#cc607d",
            "#ad466c",
            "#8b3058",
            "#672044"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "BurgYl": {
        "2": [
            "#fbe6c5",
            "#70284a"
        ],
        "3": [
            "#fbe6c5",
            "#dc7176",
            "#70284a"
        ],
        "4": [
            "#fbe6c5",
            "#ee8a82",
            "#c8586c",
            "#70284a"
        ],
        "5": [
            "#fbe6c5",
            "#f2a28a",
            "#dc7176",
            "#b24b65",
            "#70284a"
        ],
        "6": [
            "#fbe6c5",
            "#f4b191",
            "#e7807d",
            "#d06270",
            "#a44360",
            "#70284a"
        ],
        "7": [
            "#fbe6c5",
            "#f5ba98",
            "#ee8a82",
            "#dc7176",
            "#c8586c",
            "#9c3f5d",
            "#70284a"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "RedOr": {
        "2": [
            "#f6d2a9",
            "#b13f64"
        ],
        "3": [
            "#f6d2a9",
            "#ea8171",
            "#b13f64"
        ],
        "4": [
            "#f6d2a9",
            "#f19c7c",
            "#dd686c",
            "#b13f64"
        ],
        "5": [
            "#f6d2a9",
            "#f3aa84",
            "#ea8171",
            "#d55d6a",
            "#b13f64"
        ],
        "6": [
            "#f6d2a9",
            "#f4b28a",
            "#ef9177",
            "#e3726d",
            "#cf5669",
            "#b13f64"
        ],
        "7": [
            "#f6d2a9",
            "#f5b78e",
            "#f19c7c",
            "#ea8171",
            "#dd686c",
            "#ca5268",
            "#b13f64"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "OrYel": {
        "2": [
            "#ecda9a",
            "#ee4d5a"
        ],
        "3": [
            "#ecda9a",
            "#f7945d",
            "#ee4d5a"
        ],
        "4": [
            "#ecda9a",
            "#f3ad6a",
            "#f97b57",
            "#ee4d5a"
        ],
        "5": [
            "#ecda9a",
            "#f1b973",
            "#f7945d",
            "#f86f56",
            "#ee4d5a"
        ],
        "6": [
            "#ecda9a",
            "#f0c079",
            "#f5a363",
            "#f98558",
            "#f76856",
            "#ee4d5a"
        ],
        "7": [
            "#ecda9a",
            "#efc47e",
            "#f3ad6a",
            "#f7945d",
            "#f97b57",
            "#f66356",
            "#ee4d5a"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "Peach": {
        "2": [
            "#fde0c5",
            "#eb4a40"
        ],
        "3": [
            "#fde0c5",
            "#f59e72",
            "#eb4a40"
        ],
        "4": [
            "#fde0c5",
            "#f8b58b",
            "#f2855d",
            "#eb4a40"
        ],
        "5": [
            "#fde0c5",
            "#f9c098",
            "#f59e72",
            "#f17854",
            "#eb4a40"
        ],
        "6": [
            "#fde0c5",
            "#fac7a1",
            "#f7ac80",
            "#f38f65",
            "#f0704f",
            "#eb4a40"
        ],
        "7": [
            "#fde0c5",
            "#facba6",
            "#f8b58b",
            "#f59e72",
            "#f2855d",
            "#ef6a4c",
            "#eb4a40"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "PinkYl": {
        "2": [
            "#fef6b5",
            "#e15383"
        ],
        "3": [
            "#fef6b5",
            "#ffa679",
            "#e15383"
        ],
        "4": [
            "#fef6b5",
            "#ffc285",
            "#fa8a76",
            "#e15383"
        ],
        "5": [
            "#fef6b5",
            "#ffd08e",
            "#ffa679",
            "#f67b77",
            "#e15383"
        ],
        "6": [
            "#fef6b5",
            "#ffd795",
            "#ffb77f",
            "#fd9576",
            "#f37378",
            "#e15383"
        ],
        "7": [
            "#fef6b5",
            "#ffdd9a",
            "#ffc285",
            "#ffa679",
            "#fa8a76",
            "#f16d7a",
            "#e15383"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "Mint": {
        "2": [
            "#e4f1e1",
            "#0d585f"
        ],
        "3": [
            "#e4f1e1",
            "#63a6a0",
            "#0d585f"
        ],
        "4": [
            "#e4f1e1",
            "#89c0b6",
            "#448c8a",
            "#0d585f"
        ],
        "5": [
            "#E4F1E1",
            "#9CCDC1",
            "#63A6A0",
            "#337F7F",
            "#0D585F"
        ],
        "6": [
            "#e4f1e1",
            "#abd4c7",
            "#7ab5ad",
            "#509693",
            "#2c7778",
            "#0d585f"
        ],
        "7": [
            "#e4f1e1",
            "#b4d9cc",
            "#89c0b6",
            "#63a6a0",
            "#448c8a",
            "#287274",
            "#0d585f"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "BluGrn": {
        "2": [
            "#c4e6c3",
            "#1d4f60"
        ],
        "3": [
            "#c4e6c3",
            "#4da284",
            "#1d4f60"
        ],
        "4": [
            "#c4e6c3",
            "#6dbc90",
            "#36877a",
            "#1d4f60"
        ],
        "5": [
            "#c4e6c3",
            "#80c799",
            "#4da284",
            "#2d7974",
            "#1d4f60"
        ],
        "6": [
            "#c4e6c3",
            "#8dce9f",
            "#5fb28b",
            "#3e927e",
            "#297071",
            "#1d4f60"
        ],
        "7": [
            "#c4e6c3",
            "#96d2a4",
            "#6dbc90",
            "#4da284",
            "#36877a",
            "#266b6e",
            "#1d4f60"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "DarkMint": {
        "2": [
            "#d2fbd4",
            "#123f5a"
        ],
        "3": [
            "#d2fbd4",
            "#559c9e",
            "#123f5a"
        ],
        "4": [
            "#d2fbd4",
            "#7bbcb0",
            "#3a7c89",
            "#123f5a"
        ],
        "5": [
            "#d2fbd4",
            "#8eccb9",
            "#559c9e",
            "#2b6c7f",
            "#123f5a"
        ],
        "6": [
            "#d2fbd4",
            "#9cd5be",
            "#6cafa9",
            "#458892",
            "#266377",
            "#123f5a"
        ],
        "7": [
            "#d2fbd4",
            "#a5dbc2",
            "#7bbcb0",
            "#559c9e",
            "#3a7c89",
            "#235d72",
            "#123f5a"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "Emrld": {
        "2": [
            "#d3f2a3",
            "#074050"
        ],
        "3": [
            "#d3f2a3",
            "#4c9b82",
            "#074050"
        ],
        "4": [
            "#d3f2a3",
            "#6cc08b",
            "#217a79",
            "#074050"
        ],
        "5": [
            "#d3f2a3",
            "#82d091",
            "#4c9b82",
            "#19696f",
            "#074050"
        ],
        "6": [
            "#d3f2a3",
            "#8fda94",
            "#60b187",
            "#35877d",
            "#145f69",
            "#074050"
        ],
        "7": [
            "#d3f2a3",
            "#97e196",
            "#6cc08b",
            "#4c9b82",
            "#217a79",
            "#105965",
            "#074050"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "ag_GrnYl": {
        "2": [
            "#245668",
            "#EDEF5D"
        ],
        "3": [
            "#245668",
            "#39AB7E",
            "#EDEF5D"
        ],
        "4": [
            "#245668",
            "#0D8F81",
            "#6EC574",
            "#EDEF5D"
        ],
        "5": [
            "#245668",
            "#04817E",
            "#39AB7E",
            "#8BD16D",
            "#EDEF5D"
        ],
        "6": [
            "#245668",
            "#09787C",
            "#1D9A81",
            "#58BB79",
            "#9DD869",
            "#EDEF5D"
        ],
        "7": [
            "#245668",
            "#0F7279",
            "#0D8F81",
            "#39AB7E",
            "#6EC574",
            "#A9DC67",
            "#EDEF5D"
        ],
        "tags": [
            "aggregation"
        ]
    },
    "BluYl": {
        "2": [
            "#f7feae",
            "#045275"
        ],
        "3": [
            "#f7feae",
            "#46aea0",
            "#045275"
        ],
        "4": [
            "#f7feae",
            "#7ccba2",
            "#089099",
            "#045275"
        ],
        "5": [
            "#f7feae",
            "#9bd8a4",
            "#46aea0",
            "#058092",
            "#045275"
        ],
        "6": [
            "#f7feae",
            "#ace1a4",
            "#68bfa1",
            "#2a9c9c",
            "#02778e",
            "#045275"
        ],
        "7": [
            "#f7feae",
            "#b7e6a5",
            "#7ccba2",
            "#46aea0",
            "#089099",
            "#00718b",
            "#045275"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "Teal": {
        "2": [
            "#d1eeea",
            "#2a5674"
        ],
        "3": [
            "#d1eeea",
            "#68abb8",
            "#2a5674"
        ],
        "4": [
            "#d1eeea",
            "#85c4c9",
            "#4f90a6",
            "#2a5674"
        ],
        "5": [
            "#d1eeea",
            "#96d0d1",
            "#68abb8",
            "#45829b",
            "#2a5674"
        ],
        "6": [
            "#d1eeea",
            "#a1d7d6",
            "#79bbc3",
            "#599bae",
            "#3f7994",
            "#2a5674"
        ],
        "7": [
            "#d1eeea",
            "#a8dbd9",
            "#85c4c9",
            "#68abb8",
            "#4f90a6",
            "#3b738f",
            "#2a5674"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "TealGrn": {
        "2": [
            "#b0f2bc",
            "#257d98"
        ],
        "3": [
            "#b0f2bc",
            "#4cc8a3",
            "#257d98"
        ],
        "4": [
            "#b0f2bc",
            "#67dba5",
            "#38b2a3",
            "#257d98"
        ],
        "5": [
            "#b0f2bc",
            "#77e2a8",
            "#4cc8a3",
            "#31a6a2",
            "#257d98"
        ],
        "6": [
            "#b0f2bc",
            "#82e6aa",
            "#5bd4a4",
            "#3fbba3",
            "#2e9ea1",
            "#257d98"
        ],
        "7": [
            "#b0f2bc",
            "#89e8ac",
            "#67dba5",
            "#4cc8a3",
            "#38b2a3",
            "#2c98a0",
            "#257d98"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "Purp": {
        "2": [
            "#f3e0f7",
            "#63589f"
        ],
        "3": [
            "#f3e0f7",
            "#b998dd",
            "#63589f"
        ],
        "4": [
            "#f3e0f7",
            "#d1afe8",
            "#9f82ce",
            "#63589f"
        ],
        "5": [
            "#f3e0f7",
            "#dbbaed",
            "#b998dd",
            "#9178c4",
            "#63589f"
        ],
        "6": [
            "#f3e0f7",
            "#e0c2ef",
            "#c8a5e4",
            "#aa8bd4",
            "#8871be",
            "#63589f"
        ],
        "7": [
            "#f3e0f7",
            "#e4c7f1",
            "#d1afe8",
            "#b998dd",
            "#9f82ce",
            "#826dba",
            "#63589f"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "PurpOr": {
        "3": [
            "#f9ddda",
            "#ce78b3",
            "#573b88"
        ],
        "4": [
            "#f9ddda",
            "#e597b9",
            "#ad5fad",
            "#573b88"
        ],
        "5": [
            "#f9ddda",
            "#eda8bd",
            "#ce78b3",
            "#9955a8",
            "#573b88"
        ],
        "6": [
            "#f9ddda",
            "#f0b2c1",
            "#dd8ab6",
            "#bb69b0",
            "#8c4fa4",
            "#573b88"
        ],
        "7": [
            "#f9ddda",
            "#f2b9c4",
            "#e597b9",
            "#ce78b3",
            "#ad5fad",
            "#834ba0",
            "#573b88"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "Sunset": {
        "2": [
            "#f3e79b",
            "#5c53a5"
        ],
        "3": [
            "#f3e79b",
            "#eb7f86",
            "#5c53a5"
        ],
        "4": [
            "#f3e79b",
            "#f8a07e",
            "#ce6693",
            "#5c53a5"
        ],
        "5": [
            "#f3e79b",
            "#fab27f",
            "#eb7f86",
            "#b95e9a",
            "#5c53a5"
        ],
        "6": [
            "#f3e79b",
            "#fabc82",
            "#f59280",
            "#dc6f8e",
            "#ab5b9e",
            "#5c53a5"
        ],
        "7": [
            "#f3e79b",
            "#fac484",
            "#f8a07e",
            "#eb7f86",
            "#ce6693",
            "#a059a0",
            "#5c53a5"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "Magenta": {
        "2": [
            "#f3cbd3",
            "#6c2167"
        ],
        "3": [
            "#f3cbd3",
            "#ca699d",
            "#6c2167"
        ],
        "4": [
            "#f3cbd3",
            "#dd88ac",
            "#b14d8e",
            "#6c2167"
        ],
        "5": [
            "#f3cbd3",
            "#e498b4",
            "#ca699d",
            "#a24186",
            "#6c2167"
        ],
        "6": [
            "#f3cbd3",
            "#e7a2b9",
            "#d67ba5",
            "#bc5894",
            "#983a81",
            "#6c2167"
        ],
        "7": [
            "#f3cbd3",
            "#eaa9bd",
            "#dd88ac",
            "#ca699d",
            "#b14d8e",
            "#91357d",
            "#6c2167"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "SunsetDark": {
        "2": [
            "#fcde9c",
            "#7c1d6f"
        ],
        "3": [
            "#fcde9c",
            "#e34f6f",
            "#7c1d6f"
        ],
        "4": [
            "#fcde9c",
            "#f0746e",
            "#dc3977",
            "#7c1d6f"
        ],
        "5": [
            "#fcde9c",
            "#f58670",
            "#e34f6f",
            "#d72d7c",
            "#7c1d6f"
        ],
        "6": [
            "#fcde9c",
            "#f89872",
            "#ec666d",
            "#df4273",
            "#c5287b",
            "#7c1d6f"
        ],
        "7": [
            "#fcde9c",
            "#faa476",
            "#f0746e",
            "#e34f6f",
            "#dc3977",
            "#b9257a",
            "#7c1d6f"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "ag_Sunset": {
        "2": [
            "#4b2991",
            "#edd9a3"
        ],
        "3": [
            "#4b2991",
            "#ea4f88",
            "#edd9a3"
        ],
        "4": [
            "#4b2991",
            "#c0369d",
            "#fa7876",
            "#edd9a3"
        ],
        "5": [
            "#4b2991",
            "#a52fa2",
            "#ea4f88",
            "#fa9074",
            "#edd9a3"
        ],
        "6": [
            "#4b2991",
            "#932da3",
            "#d43f96",
            "#f7667c",
            "#f89f77",
            "#edd9a3"
        ],
        "7": [
            "#4b2991",
            "#872ca2",
            "#c0369d",
            "#ea4f88",
            "#fa7876",
            "#f6a97a",
            "#edd9a3"
        ],
        "tags": [
            "aggregation"
        ]
    },
    "BrwnYl": {
        "2": [
            "#ede5cf",
            "#541f3f"
        ],
        "3": [
            "#ede5cf",
            "#c1766f",
            "#541f3f"
        ],
        "4": [
            "#ede5cf",
            "#d39c83",
            "#a65461",
            "#541f3f"
        ],
        "5": [
            "#ede5cf",
            "#daaf91",
            "#c1766f",
            "#95455a",
            "#541f3f"
        ],
        "6": [
            "#ede5cf",
            "#ddba9b",
            "#cd8c7a",
            "#b26166",
            "#8a3c56",
            "#541f3f"
        ],
        "7": [
            "#ede5cf",
            "#e0c2a2",
            "#d39c83",
            "#c1766f",
            "#a65461",
            "#813753",
            "#541f3f"
        ],
        "tags": [
            "quantitative"
        ]
    },
    "ArmyRose": {
        "2": [
            "#929b4f",
            "#db8195"
        ],
        "3": [
            "#a3ad62",
            "#fdfbe4",
            "#df91a3"
        ],
        "4": [
            "#929b4f",
            "#d9dbaf",
            "#f3d1ca",
            "#db8195"
        ],
        "5": [
            "#879043",
            "#c1c68c",
            "#fdfbe4",
            "#ebb4b8",
            "#d8758b"
        ],
        "6": [
            "#7f883b",
            "#b0b874",
            "#e3e4be",
            "#f6ddd1",
            "#e4a0ac",
            "#d66d85"
        ],
        "7": [
            "#798234",
            "#a3ad62",
            "#d0d3a2",
            "#fdfbe4",
            "#f0c6c3",
            "#df91a3",
            "#d46780"
        ],
        "tags": [
            "diverging"
        ]
    },
    "Fall": {
        "2": [
            "#3d5941",
            "#ca562c"
        ],
        "3": [
            "#3d5941",
            "#f6edbd",
            "#ca562c"
        ],
        "4": [
            "#3d5941",
            "#b5b991",
            "#edbb8a",
            "#ca562c"
        ],
        "5": [
            "#3d5941",
            "#96a07c",
            "#f6edbd",
            "#e6a272",
            "#ca562c"
        ],
        "6": [
            "#3d5941",
            "#839170",
            "#cecea2",
            "#f1cf9e",
            "#e19464",
            "#ca562c"
        ],
        "7": [
            "#3d5941",
            "#778868",
            "#b5b991",
            "#f6edbd",
            "#edbb8a",
            "#de8a5a",
            "#ca562c"
        ],
        "tags": [
            "diverging"
        ]
    },
    "Geyser": {
        "2": [
            "#008080",
            "#ca562c"
        ],
        "3": [
            "#008080",
            "#f6edbd",
            "#ca562c"
        ],
        "4": [
            "#008080",
            "#b4c8a8",
            "#edbb8a",
            "#ca562c"
        ],
        "5": [
            "#008080",
            "#92b69e",
            "#f6edbd",
            "#e6a272",
            "#ca562c"
        ],
        "6": [
            "#008080",
            "#7eab98",
            "#ced7b1",
            "#f1cf9e",
            "#e19464",
            "#ca562c"
        ],
        "7": [
            "#008080",
            "#70a494",
            "#b4c8a8",
            "#f6edbd",
            "#edbb8a",
            "#de8a5a",
            "#ca562c"
        ],
        "tags": [
            "diverging"
        ]
    },
    "Temps": {
        "2": [
            "#009392",
            "#cf597e"
        ],
        "3": [
            "#009392",
            "#e9e29c",
            "#cf597e"
        ],
        "4": [
            "#009392",
            "#9ccb86",
            "#eeb479",
            "#cf597e"
        ],
        "5": [
            "#009392",
            "#71be83",
            "#e9e29c",
            "#ed9c72",
            "#cf597e"
        ],
        "6": [
            "#009392",
            "#52b684",
            "#bcd48c",
            "#edc783",
            "#eb8d71",
            "#cf597e"
        ],
        "7": [
            "#009392",
            "#39b185",
            "#9ccb86",
            "#e9e29c",
            "#eeb479",
            "#e88471",
            "#cf597e"
        ],
        "tags": [
            "diverging"
        ]
    },
    "TealRose": {
        "2": [
            "#009392",
            "#d0587e"
        ],
        "3": [
            "#009392",
            "#f1eac8",
            "#d0587e"
        ],
        "4": [
            "#009392",
            "#91b8aa",
            "#f1eac8",
            "#dfa0a0",
            "#d0587e"
        ],
        "5": [
            "#009392",
            "#91b8aa",
            "#f1eac8",
            "#dfa0a0",
            "#d0587e"
        ],
        "6": [
            "#009392",
            "#72aaa1",
            "#b1c7b3",
            "#e5b9ad",
            "#d98994",
            "#d0587e"
        ],
        "7": [
            "#009392",
            "#72aaa1",
            "#b1c7b3",
            "#f1eac8",
            "#e5b9ad",
            "#d98994",
            "#d0587e"
        ],
        "tags": [
            "diverging"
        ]
    },
    "Tropic": {
        "2": [
            "#009B9E",
            "#C75DAB"
        ],
        "3": [
            "#009B9E",
            "#F1F1F1",
            "#C75DAB"
        ],
        "4": [
            "#009B9E",
            "#A7D3D4",
            "#E4C1D9",
            "#C75DAB"
        ],
        "5": [
            "#009B9E",
            "#7CC5C6",
            "#F1F1F1",
            "#DDA9CD",
            "#C75DAB"
        ],
        "6": [
            "#009B9E",
            "#5DBCBE",
            "#C6DFDF",
            "#E9D4E2",
            "#D99BC6",
            "#C75DAB"
        ],
        "7": [
            "#009B9E",
            "#42B7B9",
            "#A7D3D4",
            "#F1F1F1",
            "#E4C1D9",
            "#D691C1",
            "#C75DAB"
        ],
        "tags": [
            "diverging"
        ]
    },
    "Earth": {
        "2": [
            "#A16928",
            "#2887a1"
        ],
        "3": [
            "#A16928",
            "#edeac2",
            "#2887a1"
        ],
        "4": [
            "#A16928",
            "#d6bd8d",
            "#b5c8b8",
            "#2887a1"
        ],
        "5": [
            "#A16928",
            "#caa873",
            "#edeac2",
            "#98b7b2",
            "#2887a1"
        ],
        "6": [
            "#A16928",
            "#c29b64",
            "#e0cfa2",
            "#cbd5bc",
            "#85adaf",
            "#2887a1"
        ],
        "7": [
            "#A16928",
            "#bd925a",
            "#d6bd8d",
            "#edeac2",
            "#b5c8b8",
            "#79a7ac",
            "#2887a1"
        ],
        "tags": [
            "diverging"
        ]
    },
    "Antique": {
        "2": [
            "#855C75",
            "#D9AF6B",
            "#7C7C7C"
        ],
        "3": [
            "#855C75",
            "#D9AF6B",
            "#AF6458",
            "#7C7C7C"
        ],
        "4": [
            "#855C75",
            "#D9AF6B",
            "#AF6458",
            "#736F4C",
            "#7C7C7C"
        ],
        "5": [
            "#855C75",
            "#D9AF6B",
            "#AF6458",
            "#736F4C",
            "#526A83",
            "#7C7C7C"
        ],
        "6": [
            "#855C75",
            "#D9AF6B",
            "#AF6458",
            "#736F4C",
            "#526A83",
            "#625377",
            "#7C7C7C"
        ],
        "7": [
            "#855C75",
            "#D9AF6B",
            "#AF6458",
            "#736F4C",
            "#526A83",
            "#625377",
            "#68855C",
            "#7C7C7C"
        ],
        "8": [
            "#855C75",
            "#D9AF6B",
            "#AF6458",
            "#736F4C",
            "#526A83",
            "#625377",
            "#68855C",
            "#9C9C5E",
            "#7C7C7C"
        ],
        "9": [
            "#855C75",
            "#D9AF6B",
            "#AF6458",
            "#736F4C",
            "#526A83",
            "#625377",
            "#68855C",
            "#9C9C5E",
            "#A06177",
            "#7C7C7C"
        ],
        "10": [
            "#855C75",
            "#D9AF6B",
            "#AF6458",
            "#736F4C",
            "#526A83",
            "#625377",
            "#68855C",
            "#9C9C5E",
            "#A06177",
            "#8C785D",
            "#7C7C7C"
        ],
        "11": [
            "#855C75",
            "#D9AF6B",
            "#AF6458",
            "#736F4C",
            "#526A83",
            "#625377",
            "#68855C",
            "#9C9C5E",
            "#A06177",
            "#8C785D",
            "#467378",
            "#7C7C7C"
        ],
        "tags": [
            "qualitative"
        ]
    },
    "Bold": {
        "2": [
            "#7F3C8D",
            "#11A579",
            "#A5AA99"
        ],
        "3": [
            "#7F3C8D",
            "#11A579",
            "#3969AC",
            "#A5AA99"
        ],
        "4": [
            "#7F3C8D",
            "#11A579",
            "#3969AC",
            "#F2B701",
            "#A5AA99"
        ],
        "5": [
            "#7F3C8D",
            "#11A579",
            "#3969AC",
            "#F2B701",
            "#E73F74",
            "#A5AA99"
        ],
        "6": [
            "#7F3C8D",
            "#11A579",
            "#3969AC",
            "#F2B701",
            "#E73F74",
            "#80BA5A",
            "#A5AA99"
        ],
        "7": [
            "#7F3C8D",
            "#11A579",
            "#3969AC",
            "#F2B701",
            "#E73F74",
            "#80BA5A",
            "#E68310",
            "#A5AA99"
        ],
        "8": [
            "#7F3C8D",
            "#11A579",
            "#3969AC",
            "#F2B701",
            "#E73F74",
            "#80BA5A",
            "#E68310",
            "#008695",
            "#A5AA99"
        ],
        "9": [
            "#7F3C8D",
            "#11A579",
            "#3969AC",
            "#F2B701",
            "#E73F74",
            "#80BA5A",
            "#E68310",
            "#008695",
            "#CF1C90",
            "#A5AA99"
        ],
        "10": [
            "#7F3C8D",
            "#11A579",
            "#3969AC",
            "#F2B701",
            "#E73F74",
            "#80BA5A",
            "#E68310",
            "#008695",
            "#CF1C90",
            "#f97b72",
            "#A5AA99"
        ],
        "11": [
            "#7F3C8D",
            "#11A579",
            "#3969AC",
            "#F2B701",
            "#E73F74",
            "#80BA5A",
            "#E68310",
            "#008695",
            "#CF1C90",
            "#f97b72",
            "#4b4b8f",
            "#A5AA99"
        ],
        "tags": [
            "qualitative"
        ]
    },
    "Pastel": {
        "2": [
            "#66C5CC",
            "#F6CF71",
            "#B3B3B3"
        ],
        "3": [
            "#66C5CC",
            "#F6CF71",
            "#F89C74",
            "#B3B3B3"
        ],
        "4": [
            "#66C5CC",
            "#F6CF71",
            "#F89C74",
            "#DCB0F2",
            "#B3B3B3"
        ],
        "5": [
            "#66C5CC",
            "#F6CF71",
            "#F89C74",
            "#DCB0F2",
            "#87C55F",
            "#B3B3B3"
        ],
        "6": [
            "#66C5CC",
            "#F6CF71",
            "#F89C74",
            "#DCB0F2",
            "#87C55F",
            "#9EB9F3",
            "#B3B3B3"
        ],
        "7": [
            "#66C5CC",
            "#F6CF71",
            "#F89C74",
            "#DCB0F2",
            "#87C55F",
            "#9EB9F3",
            "#FE88B1",
            "#B3B3B3"
        ],
        "8": [
            "#66C5CC",
            "#F6CF71",
            "#F89C74",
            "#DCB0F2",
            "#87C55F",
            "#9EB9F3",
            "#FE88B1",
            "#C9DB74",
            "#B3B3B3"
        ],
        "9": [
            "#66C5CC",
            "#F6CF71",
            "#F89C74",
            "#DCB0F2",
            "#87C55F",
            "#9EB9F3",
            "#FE88B1",
            "#C9DB74",
            "#8BE0A4",
            "#B3B3B3"
        ],
        "10": [
            "#66C5CC",
            "#F6CF71",
            "#F89C74",
            "#DCB0F2",
            "#87C55F",
            "#9EB9F3",
            "#FE88B1",
            "#C9DB74",
            "#8BE0A4",
            "#B497E7",
            "#B3B3B3"
        ],
        "11": [
            "#66C5CC",
            "#F6CF71",
            "#F89C74",
            "#DCB0F2",
            "#87C55F",
            "#9EB9F3",
            "#FE88B1",
            "#C9DB74",
            "#8BE0A4",
            "#B497E7",
            "#D3B484",
            "#B3B3B3"
        ],
        "tags": [
            "qualitative"
        ]
    },
    "Prism": {
        "2": [
            "#5F4690",
            "#1D6996",
            "#666666"
        ],
        "3": [
            "#5F4690",
            "#1D6996",
            "#38A6A5",
            "#666666"
        ],
        "4": [
            "#5F4690",
            "#1D6996",
            "#38A6A5",
            "#0F8554",
            "#666666"
        ],
        "5": [
            "#5F4690",
            "#1D6996",
            "#38A6A5",
            "#0F8554",
            "#73AF48",
            "#666666"
        ],
        "6": [
            "#5F4690",
            "#1D6996",
            "#38A6A5",
            "#0F8554",
            "#73AF48",
            "#EDAD08",
            "#666666"
        ],
        "7": [
            "#5F4690",
            "#1D6996",
            "#38A6A5",
            "#0F8554",
            "#73AF48",
            "#EDAD08",
            "#E17C05",
            "#666666"
        ],
        "8": [
            "#5F4690",
            "#1D6996",
            "#38A6A5",
            "#0F8554",
            "#73AF48",
            "#EDAD08",
            "#E17C05",
            "#CC503E",
            "#666666"
        ],
        "9": [
            "#5F4690",
            "#1D6996",
            "#38A6A5",
            "#0F8554",
            "#73AF48",
            "#EDAD08",
            "#E17C05",
            "#CC503E",
            "#94346E",
            "#666666"
        ],
        "10": [
            "#5F4690",
            "#1D6996",
            "#38A6A5",
            "#0F8554",
            "#73AF48",
            "#EDAD08",
            "#E17C05",
            "#CC503E",
            "#94346E",
            "#6F4070",
            "#666666"
        ],
        "11": [
            "#5F4690",
            "#1D6996",
            "#38A6A5",
            "#0F8554",
            "#73AF48",
            "#EDAD08",
            "#E17C05",
            "#CC503E",
            "#94346E",
            "#6F4070",
            "#994E95",
            "#666666"
        ],
        "tags": [
            "qualitative"
        ]
    },
    "Safe": {
        "2": [
            "#88CCEE",
            "#CC6677",
            "#888888"
        ],
        "3": [
            "#88CCEE",
            "#CC6677",
            "#DDCC77",
            "#888888"
        ],
        "4": [
            "#88CCEE",
            "#CC6677",
            "#DDCC77",
            "#117733",
            "#888888"
        ],
        "5": [
            "#88CCEE",
            "#CC6677",
            "#DDCC77",
            "#117733",
            "#332288",
            "#888888"
        ],
        "6": [
            "#88CCEE",
            "#CC6677",
            "#DDCC77",
            "#117733",
            "#332288",
            "#AA4499",
            "#888888"
        ],
        "7": [
            "#88CCEE",
            "#CC6677",
            "#DDCC77",
            "#117733",
            "#332288",
            "#AA4499",
            "#44AA99",
            "#888888"
        ],
        "8": [
            "#88CCEE",
            "#CC6677",
            "#DDCC77",
            "#117733",
            "#332288",
            "#AA4499",
            "#44AA99",
            "#999933",
            "#888888"
        ],
        "9": [
            "#88CCEE",
            "#CC6677",
            "#DDCC77",
            "#117733",
            "#332288",
            "#AA4499",
            "#44AA99",
            "#999933",
            "#882255",
            "#888888"
        ],
        "10": [
            "#88CCEE",
            "#CC6677",
            "#DDCC77",
            "#117733",
            "#332288",
            "#AA4499",
            "#44AA99",
            "#999933",
            "#882255",
            "#661100",
            "#888888"
        ],
        "11": [
            "#88CCEE",
            "#CC6677",
            "#DDCC77",
            "#117733",
            "#332288",
            "#AA4499",
            "#44AA99",
            "#999933",
            "#882255",
            "#661100",
            "#6699CC",
            "#888888"
        ],
        "tags": [
            "qualitative",
            "colorblind"
        ]
    },
    "Vivid": {
        "2": [
            "#E58606",
            "#5D69B1",
            "#A5AA99"
        ],
        "3": [
            "#E58606",
            "#5D69B1",
            "#52BCA3",
            "#A5AA99"
        ],
        "4": [
            "#E58606",
            "#5D69B1",
            "#52BCA3",
            "#99C945",
            "#A5AA99"
        ],
        "5": [
            "#E58606",
            "#5D69B1",
            "#52BCA3",
            "#99C945",
            "#CC61B0",
            "#A5AA99"
        ],
        "6": [
            "#E58606",
            "#5D69B1",
            "#52BCA3",
            "#99C945",
            "#CC61B0",
            "#24796C",
            "#A5AA99"
        ],
        "7": [
            "#E58606",
            "#5D69B1",
            "#52BCA3",
            "#99C945",
            "#CC61B0",
            "#24796C",
            "#DAA51B",
            "#A5AA99"
        ],
        "8": [
            "#E58606",
            "#5D69B1",
            "#52BCA3",
            "#99C945",
            "#CC61B0",
            "#24796C",
            "#DAA51B",
            "#2F8AC4",
            "#A5AA99"
        ],
        "9": [
            "#E58606",
            "#5D69B1",
            "#52BCA3",
            "#99C945",
            "#CC61B0",
            "#24796C",
            "#DAA51B",
            "#2F8AC4",
            "#764E9F",
            "#A5AA99"
        ],
        "10": [
            "#E58606",
            "#5D69B1",
            "#52BCA3",
            "#99C945",
            "#CC61B0",
            "#24796C",
            "#DAA51B",
            "#2F8AC4",
            "#764E9F",
            "#ED645A",
            "#A5AA99"
        ],
        "11": [
            "#E58606",
            "#5D69B1",
            "#52BCA3",
            "#99C945",
            "#CC61B0",
            "#24796C",
            "#DAA51B",
            "#2F8AC4",
            "#764E9F",
            "#ED645A",
            "#CC3A8E",
            "#A5AA99"
        ],
        "tags": [
            "qualitative"
        ]
    }
};

var colorbrewer_tags = {
  "Blues": { "tags": ["quantitative"] },
  "BrBG": { "tags": ["diverging"] },
  "Greys": { "tags": ["quantitative"] },
  "PiYG": { "tags": ["diverging"] },
  "PRGn": { "tags": ["diverging"] },
  "Purples": { "tags": ["quantitative"] },
  "RdYlGn": { "tags": ["diverging"] },
  "Spectral": { "tags": ["diverging"] },
  "YlOrBr": { "tags": ["quantitative"] },
  "YlGn": { "tags": ["quantitative"] },
  "YlGnBu": { "tags": ["quantitative"] },
  "YlOrRd": { "tags": ["quantitative"] }
}

var colorbrewer = __webpack_require__(32);

// augment colorbrewer with tags
for (var r in colorbrewer) {
  var ramps = colorbrewer[r];
  var augmentedRamps = {};
  for (var i in ramps) {
    augmentedRamps[i] = ramps[i];
  }

  if (r in colorbrewer_tags) {
    augmentedRamps.tags = colorbrewer_tags[r].tags;
  }

  cartocolor['cb_' + r] = augmentedRamps;
}

if (true) {
    !(__WEBPACK_AMD_DEFINE_FACTORY__ = (cartocolor),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else if (typeof module === "object" && module.exports) {
    module.exports = cartocolor;
} else {
    this.colorbrewer = cartocolor;
}

}();


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(33);


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;// This product includes color specifications and designs developed by Cynthia Brewer (http://colorbrewer.org/).
// JavaScript specs as packaged in the D3 library (d3js.org). Please see license at http://colorbrewer.org/export/LICENSE.txt
!function() {

var colorbrewer = {YlGn: {
3: ["#f7fcb9","#addd8e","#31a354"],
4: ["#ffffcc","#c2e699","#78c679","#238443"],
5: ["#ffffcc","#c2e699","#78c679","#31a354","#006837"],
6: ["#ffffcc","#d9f0a3","#addd8e","#78c679","#31a354","#006837"],
7: ["#ffffcc","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#005a32"],
8: ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#005a32"],
9: ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"]
},YlGnBu: {
3: ["#edf8b1","#7fcdbb","#2c7fb8"],
4: ["#ffffcc","#a1dab4","#41b6c4","#225ea8"],
5: ["#ffffcc","#a1dab4","#41b6c4","#2c7fb8","#253494"],
6: ["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#2c7fb8","#253494"],
7: ["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"],
8: ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#0c2c84"],
9: ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]
},GnBu: {
3: ["#e0f3db","#a8ddb5","#43a2ca"],
4: ["#f0f9e8","#bae4bc","#7bccc4","#2b8cbe"],
5: ["#f0f9e8","#bae4bc","#7bccc4","#43a2ca","#0868ac"],
6: ["#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#43a2ca","#0868ac"],
7: ["#f0f9e8","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#08589e"],
8: ["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#08589e"],
9: ["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#0868ac","#084081"]
},BuGn: {
3: ["#e5f5f9","#99d8c9","#2ca25f"],
4: ["#edf8fb","#b2e2e2","#66c2a4","#238b45"],
5: ["#edf8fb","#b2e2e2","#66c2a4","#2ca25f","#006d2c"],
6: ["#edf8fb","#ccece6","#99d8c9","#66c2a4","#2ca25f","#006d2c"],
7: ["#edf8fb","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"],
8: ["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"],
9: ["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#006d2c","#00441b"]
},PuBuGn: {
3: ["#ece2f0","#a6bddb","#1c9099"],
4: ["#f6eff7","#bdc9e1","#67a9cf","#02818a"],
5: ["#f6eff7","#bdc9e1","#67a9cf","#1c9099","#016c59"],
6: ["#f6eff7","#d0d1e6","#a6bddb","#67a9cf","#1c9099","#016c59"],
7: ["#f6eff7","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016450"],
8: ["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016450"],
9: ["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016c59","#014636"]
},PuBu: {
3: ["#ece7f2","#a6bddb","#2b8cbe"],
4: ["#f1eef6","#bdc9e1","#74a9cf","#0570b0"],
5: ["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe","#045a8d"],
6: ["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#2b8cbe","#045a8d"],
7: ["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],
8: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],
9: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]
},BuPu: {
3: ["#e0ecf4","#9ebcda","#8856a7"],
4: ["#edf8fb","#b3cde3","#8c96c6","#88419d"],
5: ["#edf8fb","#b3cde3","#8c96c6","#8856a7","#810f7c"],
6: ["#edf8fb","#bfd3e6","#9ebcda","#8c96c6","#8856a7","#810f7c"],
7: ["#edf8fb","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#6e016b"],
8: ["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#6e016b"],
9: ["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#810f7c","#4d004b"]
},RdPu: {
3: ["#fde0dd","#fa9fb5","#c51b8a"],
4: ["#feebe2","#fbb4b9","#f768a1","#ae017e"],
5: ["#feebe2","#fbb4b9","#f768a1","#c51b8a","#7a0177"],
6: ["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#c51b8a","#7a0177"],
7: ["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"],
8: ["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177"],
9: ["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177","#49006a"]
},PuRd: {
3: ["#e7e1ef","#c994c7","#dd1c77"],
4: ["#f1eef6","#d7b5d8","#df65b0","#ce1256"],
5: ["#f1eef6","#d7b5d8","#df65b0","#dd1c77","#980043"],
6: ["#f1eef6","#d4b9da","#c994c7","#df65b0","#dd1c77","#980043"],
7: ["#f1eef6","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#91003f"],
8: ["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#91003f"],
9: ["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#980043","#67001f"]
},OrRd: {
3: ["#fee8c8","#fdbb84","#e34a33"],
4: ["#fef0d9","#fdcc8a","#fc8d59","#d7301f"],
5: ["#fef0d9","#fdcc8a","#fc8d59","#e34a33","#b30000"],
6: ["#fef0d9","#fdd49e","#fdbb84","#fc8d59","#e34a33","#b30000"],
7: ["#fef0d9","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#990000"],
8: ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#990000"],
9: ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"]
},YlOrRd: {
3: ["#ffeda0","#feb24c","#f03b20"],
4: ["#ffffb2","#fecc5c","#fd8d3c","#e31a1c"],
5: ["#ffffb2","#fecc5c","#fd8d3c","#f03b20","#bd0026"],
6: ["#ffffb2","#fed976","#feb24c","#fd8d3c","#f03b20","#bd0026"],
7: ["#ffffb2","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],
8: ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],
9: ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]
},YlOrBr: {
3: ["#fff7bc","#fec44f","#d95f0e"],
4: ["#ffffd4","#fed98e","#fe9929","#cc4c02"],
5: ["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"],
6: ["#ffffd4","#fee391","#fec44f","#fe9929","#d95f0e","#993404"],
7: ["#ffffd4","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
8: ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
9: ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]
},Purples: {
3: ["#efedf5","#bcbddc","#756bb1"],
4: ["#f2f0f7","#cbc9e2","#9e9ac8","#6a51a3"],
5: ["#f2f0f7","#cbc9e2","#9e9ac8","#756bb1","#54278f"],
6: ["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#756bb1","#54278f"],
7: ["#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"],
8: ["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"],
9: ["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"]
},Blues: {
3: ["#deebf7","#9ecae1","#3182bd"],
4: ["#eff3ff","#bdd7e7","#6baed6","#2171b5"],
5: ["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"],
6: ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#3182bd","#08519c"],
7: ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],
8: ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],
9: ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"]
},Greens: {
3: ["#e5f5e0","#a1d99b","#31a354"],
4: ["#edf8e9","#bae4b3","#74c476","#238b45"],
5: ["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"],
6: ["#edf8e9","#c7e9c0","#a1d99b","#74c476","#31a354","#006d2c"],
7: ["#edf8e9","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],
8: ["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],
9: ["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"]
},Oranges: {
3: ["#fee6ce","#fdae6b","#e6550d"],
4: ["#feedde","#fdbe85","#fd8d3c","#d94701"],
5: ["#feedde","#fdbe85","#fd8d3c","#e6550d","#a63603"],
6: ["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#e6550d","#a63603"],
7: ["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"],
8: ["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#8c2d04"],
9: ["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#a63603","#7f2704"]
},Reds: {
3: ["#fee0d2","#fc9272","#de2d26"],
4: ["#fee5d9","#fcae91","#fb6a4a","#cb181d"],
5: ["#fee5d9","#fcae91","#fb6a4a","#de2d26","#a50f15"],
6: ["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#de2d26","#a50f15"],
7: ["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],
8: ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],
9: ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"]
},Greys: {
3: ["#f0f0f0","#bdbdbd","#636363"],
4: ["#f7f7f7","#cccccc","#969696","#525252"],
5: ["#f7f7f7","#cccccc","#969696","#636363","#252525"],
6: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#636363","#252525"],
7: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],
8: ["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],
9: ["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525","#000000"]
},PuOr: {
3: ["#f1a340","#f7f7f7","#998ec3"],
4: ["#e66101","#fdb863","#b2abd2","#5e3c99"],
5: ["#e66101","#fdb863","#f7f7f7","#b2abd2","#5e3c99"],
6: ["#b35806","#f1a340","#fee0b6","#d8daeb","#998ec3","#542788"],
7: ["#b35806","#f1a340","#fee0b6","#f7f7f7","#d8daeb","#998ec3","#542788"],
8: ["#b35806","#e08214","#fdb863","#fee0b6","#d8daeb","#b2abd2","#8073ac","#542788"],
9: ["#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788"],
10: ["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"],
11: ["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"]
},BrBG: {
3: ["#d8b365","#f5f5f5","#5ab4ac"],
4: ["#a6611a","#dfc27d","#80cdc1","#018571"],
5: ["#a6611a","#dfc27d","#f5f5f5","#80cdc1","#018571"],
6: ["#8c510a","#d8b365","#f6e8c3","#c7eae5","#5ab4ac","#01665e"],
7: ["#8c510a","#d8b365","#f6e8c3","#f5f5f5","#c7eae5","#5ab4ac","#01665e"],
8: ["#8c510a","#bf812d","#dfc27d","#f6e8c3","#c7eae5","#80cdc1","#35978f","#01665e"],
9: ["#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e"],
10: ["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"],
11: ["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"]
},PRGn: {
3: ["#af8dc3","#f7f7f7","#7fbf7b"],
4: ["#7b3294","#c2a5cf","#a6dba0","#008837"],
5: ["#7b3294","#c2a5cf","#f7f7f7","#a6dba0","#008837"],
6: ["#762a83","#af8dc3","#e7d4e8","#d9f0d3","#7fbf7b","#1b7837"],
7: ["#762a83","#af8dc3","#e7d4e8","#f7f7f7","#d9f0d3","#7fbf7b","#1b7837"],
8: ["#762a83","#9970ab","#c2a5cf","#e7d4e8","#d9f0d3","#a6dba0","#5aae61","#1b7837"],
9: ["#762a83","#9970ab","#c2a5cf","#e7d4e8","#f7f7f7","#d9f0d3","#a6dba0","#5aae61","#1b7837"],
10: ["#40004b","#762a83","#9970ab","#c2a5cf","#e7d4e8","#d9f0d3","#a6dba0","#5aae61","#1b7837","#00441b"],
11: ["#40004b","#762a83","#9970ab","#c2a5cf","#e7d4e8","#f7f7f7","#d9f0d3","#a6dba0","#5aae61","#1b7837","#00441b"]
},PiYG: {
3: ["#e9a3c9","#f7f7f7","#a1d76a"],
4: ["#d01c8b","#f1b6da","#b8e186","#4dac26"],
5: ["#d01c8b","#f1b6da","#f7f7f7","#b8e186","#4dac26"],
6: ["#c51b7d","#e9a3c9","#fde0ef","#e6f5d0","#a1d76a","#4d9221"],
7: ["#c51b7d","#e9a3c9","#fde0ef","#f7f7f7","#e6f5d0","#a1d76a","#4d9221"],
8: ["#c51b7d","#de77ae","#f1b6da","#fde0ef","#e6f5d0","#b8e186","#7fbc41","#4d9221"],
9: ["#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221"],
10: ["#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419"],
11: ["#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419"]
},RdBu: {
3: ["#ef8a62","#f7f7f7","#67a9cf"],
4: ["#ca0020","#f4a582","#92c5de","#0571b0"],
5: ["#ca0020","#f4a582","#f7f7f7","#92c5de","#0571b0"],
6: ["#b2182b","#ef8a62","#fddbc7","#d1e5f0","#67a9cf","#2166ac"],
7: ["#b2182b","#ef8a62","#fddbc7","#f7f7f7","#d1e5f0","#67a9cf","#2166ac"],
8: ["#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac"],
9: ["#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac"],
10: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"],
11: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"]
},RdGy: {
3: ["#ef8a62","#ffffff","#999999"],
4: ["#ca0020","#f4a582","#bababa","#404040"],
5: ["#ca0020","#f4a582","#ffffff","#bababa","#404040"],
6: ["#b2182b","#ef8a62","#fddbc7","#e0e0e0","#999999","#4d4d4d"],
7: ["#b2182b","#ef8a62","#fddbc7","#ffffff","#e0e0e0","#999999","#4d4d4d"],
8: ["#b2182b","#d6604d","#f4a582","#fddbc7","#e0e0e0","#bababa","#878787","#4d4d4d"],
9: ["#b2182b","#d6604d","#f4a582","#fddbc7","#ffffff","#e0e0e0","#bababa","#878787","#4d4d4d"],
10: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#e0e0e0","#bababa","#878787","#4d4d4d","#1a1a1a"],
11: ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#ffffff","#e0e0e0","#bababa","#878787","#4d4d4d","#1a1a1a"]
},RdYlBu: {
3: ["#fc8d59","#ffffbf","#91bfdb"],
4: ["#d7191c","#fdae61","#abd9e9","#2c7bb6"],
5: ["#d7191c","#fdae61","#ffffbf","#abd9e9","#2c7bb6"],
6: ["#d73027","#fc8d59","#fee090","#e0f3f8","#91bfdb","#4575b4"],
7: ["#d73027","#fc8d59","#fee090","#ffffbf","#e0f3f8","#91bfdb","#4575b4"],
8: ["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"],
9: ["#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4"],
10: ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"],
11: ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"]
},Spectral: {
3: ["#fc8d59","#ffffbf","#99d594"],
4: ["#d7191c","#fdae61","#abdda4","#2b83ba"],
5: ["#d7191c","#fdae61","#ffffbf","#abdda4","#2b83ba"],
6: ["#d53e4f","#fc8d59","#fee08b","#e6f598","#99d594","#3288bd"],
7: ["#d53e4f","#fc8d59","#fee08b","#ffffbf","#e6f598","#99d594","#3288bd"],
8: ["#d53e4f","#f46d43","#fdae61","#fee08b","#e6f598","#abdda4","#66c2a5","#3288bd"],
9: ["#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd"],
10: ["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"],
11: ["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"]
},RdYlGn: {
3: ["#fc8d59","#ffffbf","#91cf60"],
4: ["#d7191c","#fdae61","#a6d96a","#1a9641"],
5: ["#d7191c","#fdae61","#ffffbf","#a6d96a","#1a9641"],
6: ["#d73027","#fc8d59","#fee08b","#d9ef8b","#91cf60","#1a9850"],
7: ["#d73027","#fc8d59","#fee08b","#ffffbf","#d9ef8b","#91cf60","#1a9850"],
8: ["#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850"],
9: ["#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850"],
10: ["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"],
11: ["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"]
},Accent: {
3: ["#7fc97f","#beaed4","#fdc086"],
4: ["#7fc97f","#beaed4","#fdc086","#ffff99"],
5: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0"],
6: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f"],
7: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17"],
8: ["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17","#666666"]
},Dark2: {
3: ["#1b9e77","#d95f02","#7570b3"],
4: ["#1b9e77","#d95f02","#7570b3","#e7298a"],
5: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e"],
6: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02"],
7: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d"],
8: ["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666"]
},Paired: {
3: ["#a6cee3","#1f78b4","#b2df8a"],
4: ["#a6cee3","#1f78b4","#b2df8a","#33a02c"],
5: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99"],
6: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c"],
7: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f"],
8: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00"],
9: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6"],
10: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a"],
11: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99"],
12: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]
},Pastel1: {
3: ["#fbb4ae","#b3cde3","#ccebc5"],
4: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4"],
5: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6"],
6: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc"],
7: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd"],
8: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec"],
9: ["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec","#f2f2f2"]
},Pastel2: {
3: ["#b3e2cd","#fdcdac","#cbd5e8"],
4: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4"],
5: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9"],
6: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae"],
7: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc"],
8: ["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc","#cccccc"]
},Set1: {
3: ["#e41a1c","#377eb8","#4daf4a"],
4: ["#e41a1c","#377eb8","#4daf4a","#984ea3"],
5: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00"],
6: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33"],
7: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628"],
8: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf"],
9: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"]
},Set2: {
3: ["#66c2a5","#fc8d62","#8da0cb"],
4: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3"],
5: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854"],
6: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f"],
7: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494"],
8: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"]
},Set3: {
3: ["#8dd3c7","#ffffb3","#bebada"],
4: ["#8dd3c7","#ffffb3","#bebada","#fb8072"],
5: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3"],
6: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462"],
7: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69"],
8: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5"],
9: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9"],
10: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd"],
11: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5"],
12: ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]
}};

if (true) {
    !(__WEBPACK_AMD_DEFINE_FACTORY__ = (colorbrewer),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else if (typeof module === "object" && module.exports) {
    module.exports = colorbrewer;
} else {
    this.colorbrewer = colorbrewer;
}

}();


/***/ }),
/* 34 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(3);



let bucketUID = 0;

class Buckets extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    /*
        If input is numeric => args is a breakpoint list
        If input is categorical => args is a list of category names to map input
    */
    constructor(input, ...args) {
        args = args.map(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */]);
        let children = {
            input
        };
        args.map((arg, index) => children[`arg${index}`] = arg);
        super(children);
        this.bucketUID = bucketUID++;
        this.numCategories = args.length + 1;
        this.args = args;
    }
    _compile(metadata) {
        super._compile(metadata);
        this.type = 'category';
        this.othersBucket = this.input.type == 'category';
        this.args.map(breakpoint => {
            if (breakpoint.type != this.input.type) {
                throw new Error('Buckets() argument types mismatch');
            }
        });
    }
    _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
        const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(uniformIDMaker, propertyTIDMaker));
        let childInlines = {};
        childSources.map((source, index) => childInlines[this.childrenNames[index]] = source.inline);
        const funcName = `buckets${this.bucketUID}`;
        const cmp = this.input.type == 'category' ? '==' : '<';
        const elif = (_, index) =>
            `${index > 0 ? 'else' : ''} if (x${cmp}(${childInlines[`arg${index}`]})){
                return ${index}.;
            }`;
        const funcBody = this.args.map(elif).join('');
        const preface = `float ${funcName}(float x){
            ${funcBody}
            return ${this.numCategories - 1}.;
        }`;

        return {
            preface: childSources.map(s => s.preface).reduce((a, b) => a + b, '') + preface,
            inline: `${funcName}(${childInlines.input})`
        };
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Buckets;


/***/ }),
/* 35 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(3);



class CIELab extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    constructor(l, a, b) {
        l = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(l);
        a = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(a);
        b = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(b);
        super({ l: l, a: a, b: b });
    }
    _compile(meta) {
        super._compile(meta);
        if (this.l.type != 'float' || this.a.type != 'float' || this.b.type != 'float') {
            throw new Error('CIELab() invalid parameters');
        }
        this.type = 'color';
        this._setGenericGLSL(inline =>
            `vec4(xyztosrgb(cielabtoxyz(
                vec3(
                    clamp(${inline.l}, 0., 100.),
                    clamp(${inline.a}, -128., 128.),
                    clamp(${inline.b}, -128., 128.)
                )
            )), 1)`
            , `
        #ifndef cielabtoxyz_fn
        #define cielabtoxyz_fn

        const mat3 XYZ_2_RGB = (mat3(
            3.2404542,-1.5371385,-0.4985314,
           -0.9692660, 1.8760108, 0.0415560,
            0.0556434,-0.2040259, 1.0572252
       ));
       const float SRGB_GAMMA = 1.0 / 2.2;

       vec3 rgb_to_srgb_approx(vec3 rgb) {
        return pow(rgb, vec3(SRGB_GAMMA));
    }
        float f1(float t){
            const float sigma = 6./29.;
            if (t>sigma){
                return t*t*t;
            }else{
                return 3.*sigma*sigma*(t-4./29.);
            }
        }
        vec3 cielabtoxyz(vec3 c) {
            const float xn = 95.047/100.;
            const float yn = 100./100.;
            const float zn = 108.883/100.;
            return vec3(xn*f1((c.x+16.)/116.  + c.y/500. ),
                        yn*f1((c.x+16.)/116.),
                        zn*f1((c.x+16.)/116.  - c.z/200. )
                    );
        }
        vec3 xyztorgb(vec3 c){
            return c *XYZ_2_RGB;
        }

        vec3 xyztosrgb(vec3 c) {
            return rgb_to_srgb_approx(xyztorgb(c));
        }
        #endif
        `);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = CIELab;


/***/ }),
/* 36 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(3);



class HSV extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    /**
     * @description Color constructor for Hue Saturation Value (HSV) color space
     * @param {*} hue   hue is the color hue, the coordinates goes from 0 to 1 and is cyclic, i.e.: 0.5=1.5=2.5=-0.5
     * @param {*} saturation saturation of the color in the [0,1] range
     * @param {*} value value (brightness) of the color in the [0,1] range
     */
    constructor(h, s, v) {
        h = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(h);
        s = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(s);
        v = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(v);
        super({ h: h, s: s, v: v });
    }
    _compile(metadata) {
        super._compile(metadata);
        function typeCheck(v) {
            return !(v.type == 'float' || v.type == 'category');
        }
        if (typeCheck(this.h) || typeCheck(this.s) || typeCheck(this.v)) {
            throw new Error('CIELab() invalid parameters');
        }
        this.type = 'color';
        const normalize = (v, hue = false) => {
            if (v.type == 'category') {
                return `/${hue ? v.numCategories + 1 : v.numCategories}.`;
            }
            return '';
        };
        super._setGenericGLSL(inline =>
            `vec4(hsv2rgb(vec3(${inline.h}${normalize(this.h, true)}, clamp(${inline.s}${normalize(this.s)}, 0.,1.), clamp(${inline.v}${normalize(this.v)}, 0.,1.))), 1)`
            , `
    #ifndef HSV2RGB
    #define HSV2RGB
    vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    #endif
    `);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = HSV;



/***/ }),
/* 37 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);


class Linear extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    /**
     * @description get the current timestamp
     */
    constructor(input, min, max) {
        super({ input, min, max });
    }
    _compile(metadata) {
        this.type = 'float';
        super._compile(metadata);
        this.inlineMaker = (inline) => `((${inline.input}-${inline.min})/(${inline.max}-${inline.min}))`;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Linear;



/***/ }),
/* 38 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(3);



//
class Near extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    /**
     * @description Near returns zero for inputs that are far away from center.
     * This can be useful for filtering out features by setting their size to zero.
     *
     *       _____
     * _____/     \_____
     *
     * @param {*} input
     * @param {*} center
     * @param {*} threshold size of the allowed distance between input and center that is filtered in (returning one)
     * @param {*} falloff size of the distance to be used as a falloff to linearly interpolate between zero and one
     */
    constructor(input, center, threshold, falloff) {
        input = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(input);
        center = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(center);
        threshold = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(threshold);
        falloff = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(falloff);
        super({ input: input, center: center, threshold: threshold, falloff: falloff });
    }
    _compile(meta) {
        super._compile(meta);
        if (this.input.type != 'float' || this.center.type != 'float' || this.threshold.type != 'float' || this.falloff.type != 'float') {
            throw new Error('Near(): invalid parameter type');
        }
        this.type = 'float';
        this.inlineMaker = (inline) =>
            `(1.-clamp((abs(${inline.input}-${inline.center})-${inline.threshold})/${inline.falloff},
        0., 1.))`;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Near;



/***/ }),
/* 39 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__functions__ = __webpack_require__(1);



const nowInit = Date.now();

class Now extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    /**
     * @description get the current timestamp
     */
    constructor() {
        super({ now: Object(__WEBPACK_IMPORTED_MODULE_1__functions__["float"])(0) });
    }
    _compile(metadata) {
        super._compile(metadata);
        this.type = 'float';
        super.inlineMaker = inline => inline.now;
    }
    _preDraw(...args) {
        this.now.expr = (Date.now() - nowInit) / 1000.;
        this.now._preDraw(...args);
    }
    isAnimated() {
        return true;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Now;



/***/ }),
/* 40 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(3);



class Ramp extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    /**
     * @description Creates a color ramp based on input and within the range defined by *minKey* and *maxKey*
     * @param {*} input
     * @param {*} palette
     */
    constructor(input, palette, ...args) {
        if (args.length > 0) {
            throw new Error('ramp(input, palette) only accepts two parameters');
        }
        input = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(input);
        palette = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(palette);
        super({ input: input });
        this.minKey = 0;
        this.maxKey = 1;
        this.palette = palette;
    }
    _compile(meta) {
        super._compile(meta);
        this.type = 'color';
        if (this.input.type == 'category') {
            this.maxKey = this.input.numCategories - 1;
        }
    }
    _free(gl) {
        gl.deleteTexture(this.texture);
    }
    _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
        this._UID = uniformIDMaker();
        const input = this.input._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
        return {
            preface: input.preface + `
        uniform sampler2D texRamp${this._UID};
        uniform float keyMin${this._UID};
        uniform float keyWidth${this._UID};
        `,
            inline: `texture2D(texRamp${this._UID}, vec2((${input.inline}-keyMin${this._UID})/keyWidth${this._UID}, 0.5)).rgba`
        };
    }
    _getColorsFromPalette(input, palette) {
        if (palette.type == 'paletteGenerator') {
            let colors;
            if (input.numCategories) {
                // If we are not gonna pop the others we don't need to get the extra color
                const subPalette = (palette.tags.includes('qualitative') && !input.othersBucket) ? input.numCategories : input.numCategories - 1;
                if (palette.subPalettes[subPalette]) {
                    colors = palette.subPalettes[subPalette];
                } else {
                    // More categories than palettes, new colors will be created by linear interpolation
                    colors = palette.getLongestSubPalette();
                }
            } else {
                colors = palette.getLongestSubPalette();
            }
            // We need to remove the 'others' color if the palette has it (it is a qualitative palette) and if the input doesn't have a 'others' bucket
            if (palette.tags.includes('qualitative') && !input.othersBucket) {
                colors = colors.slice(0, colors.length - 1);
            }
            return colors;
        } else {
            return palette;
        }
    }
    _postShaderCompile(program, gl) {
        if (!this.init) {
            this.init = true;
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            const level = 0;
            const internalFormat = gl.RGBA;
            const width = 256;
            const height = 1;
            const border = 0;
            const srcFormat = gl.RGBA;
            const srcType = gl.UNSIGNED_BYTE;
            const pixel = new Uint8Array(4 * width);
            const colors = this._getColorsFromPalette(this.input, this.palette);
            // console.log(this.input.numCategories, this.input.othersBucket, colors, this);
            for (var i = 0; i < width; i++) {
                const vlowRaw = colors[Math.floor(i / width * (colors.length - 1))];
                const vhighRaw = colors[Math.ceil(i / width * (colors.length - 1))];
                const vlow = [Object(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* hexToRgb */])(vlowRaw).r, Object(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* hexToRgb */])(vlowRaw).g, Object(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* hexToRgb */])(vlowRaw).b, 255];
                const vhigh = [Object(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* hexToRgb */])(vhighRaw).r, Object(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* hexToRgb */])(vhighRaw).g, Object(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* hexToRgb */])(vhighRaw).b, 255];
                const m = i / width * (colors.length - 1) - Math.floor(i / width * (colors.length - 1));
                const v = vlow.map((low, index) => low * (1. - m) + vhigh[index] * m);
                pixel[4 * i + 0] = v[0];
                pixel[4 * i + 1] = v[1];
                pixel[4 * i + 2] = v[2];
                pixel[4 * i + 3] = v[3];
            }
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
        this.input._postShaderCompile(program, gl);
        this._texLoc = gl.getUniformLocation(program, `texRamp${this._UID}`);
        this._keyMinLoc = gl.getUniformLocation(program, `keyMin${this._UID}`);
        this._keyWidthLoc = gl.getUniformLocation(program, `keyWidth${this._UID}`);
    }
    _preDraw(drawMetadata, gl) {
        this.input._preDraw(drawMetadata, gl);
        gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this._texLoc, drawMetadata.freeTexUnit);
        gl.uniform1f(this._keyMinLoc, (this.minKey));
        gl.uniform1f(this._keyWidthLoc, (this.maxKey) - (this.minKey));
        drawMetadata.freeTexUnit++;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Ramp;



/***/ }),
/* 41 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__functions__ = __webpack_require__(1);



//TODO refactor to uniformcolor, write color (plain, literal)
class RGBA extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    /**
     * @description RGBA color constructor
     * @param {*} r red component in the [0,1] range
     * @param {*} g green component in the [0,1] range
     * @param {*} b blue component in the [0,1] range
     * @param {*} a alpha/opacity component in the [0,1] range
     */
    constructor(r, g, b, a) {
        var color = [r, g, b, a];
        color = color.map(x => Number.isFinite(x) ? Object(__WEBPACK_IMPORTED_MODULE_1__functions__["float"])(x) : x);
        r = color[0];
        g = color[1];
        b = color[2];
        a = color[3];
        super({ r, g, b, a });
    }
    _compile(meta) {
        super._compile(meta);
        if (this.r.type != 'float' || this.g.type != 'float' || this.b.type != 'float' || this.a.type != 'float') {
            throw new Error('Invalid parameters for RGBA()');
        }
        this.type = 'color'; // TODO this kind of thing can be refactored into Color class and use: extends ColorExpression
        this.inlineMaker = inline => `vec4(${inline.r}, ${inline.g}, ${inline.b}, ${inline.a})`;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = RGBA;



/***/ }),
/* 42 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__functions__ = __webpack_require__(1);



class Opacity extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    /**
     * @description Override the input color opacity
     * @param {*} color input color
     * @param {*} opacity new opacity
     */
    constructor(a, b) {
        if (Number.isFinite(b)) {
            b = Object(__WEBPACK_IMPORTED_MODULE_1__functions__["float"])(b);
        }
        super({ a: a, b: b });
    }
    _compile(meta) {
        super._compile(meta);
        if (!(this.a.type == 'color' && this.b.type == 'float')) {
            throw new Error(`Opacity cannot be performed between '${this.a.type}' and '${this.b.type}'`);
        }
        this.type = 'color';
        this.inlineMaker = inlines => `vec4((${inlines.a}).rgb, ${inlines.b})`;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Opacity;



/***/ }),
/* 43 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);


class Top extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    constructor(property, buckets) {
        // TODO 'cat'
        super({ property: property });
        this.buckets = buckets; //TODO force fixed literal
    }
    _compile(metadata) {
        super._compile(metadata);
        if (this.property.type != 'category') {
            throw new Error(`top() first argument must be of type category, but it is of type '${this.property.type}'`);
        }
        this.type = 'category';
        this.numCategories = this.buckets + 1;
        this.othersBucket = true;
        this._meta = metadata;
    }
    _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
        this._UID = uniformIDMaker();
        const property = this.property._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
        return {
            preface: property.preface + `uniform sampler2D topMap${this._UID};\n`,
            inline: `(255.*texture2D(topMap${this._UID}, vec2(${property.inline}/1024., 0.5)).a)`
        };
    }
    _postShaderCompile(program, gl) {
        if (!this.init) {
            if (this.buckets > this.property.numCategories) {
                this.buckets = this.property.numCategories;
            }
            this.init = true;
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            const width = 1024;
            let pixels = new Uint8Array(4 * width);
            const metaColumn = this._meta.columns.find(c => c.name == this.property.name);
            metaColumn.categoryNames.map((name, i) => {
                if (i < this.buckets) {
                    pixels[4 * this._meta.categoryIDs[name] + 3] = (i + 1);
                }
            });
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                width, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                pixels);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
        this.property._postShaderCompile(program);
        this._texLoc = gl.getUniformLocation(program, `topMap${this._UID}`);
    }
    _preDraw(drawMetadata, gl) {
        this.property._preDraw(drawMetadata);
        gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this._texLoc, drawMetadata.freeTexUnit);
        drawMetadata.freeTexUnit++;
    }
    //TODO _free
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Top;


/***/ }),
/* 44 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(3);




class XYZ extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    constructor(x, y, z) {
        x = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(x);
        y = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(y);
        z = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* implicitCast */])(z);
        super({ x: x, y: y, z: z });
    }
    _compile(meta) {
        super._compile(meta);
        if (this.x.type != 'float' || this.y.type != 'float' || this.z.type != 'float') {
            throw new Error('XYZ() invalid parameters');
        }
        this.type = 'color';
        this._setGenericGLSL(inline =>
            `vec4(xyztosrgb((
                vec3(
                    clamp(${inline.x}, -100000., 10000.),
                    clamp(${inline.y}, -12800., 12800.),
                    clamp(${inline.z}, -12800., 12800.)
                )
            )), 1)`
            , `
        #ifndef cielabtoxyz_fn
        #define cielabtoxyz_fn

        const mat3 XYZ_2_RGB = (mat3(
            3.2404542,-1.5371385,-0.4985314,
           -0.9692660, 1.8760108, 0.0415560,
            0.0556434,-0.2040259, 1.0572252
       ));
       const mat3 XYZ_2_RGB_T = (mat3(
        3.2404542,-0.9692660,0.0556434,
        -1.5371385, 1.8760108, -0.2040259,
        -0.4985314,0.0415560, 1.0572252
   ));
       const float SRGB_GAMMA = 1.0 / 2.2;

       vec3 rgb_to_srgb_approx(vec3 rgb) {
        return pow(rgb, vec3(SRGB_GAMMA));
    }
        float f1(float t){
            const float sigma = 6./29.;
            if (t>sigma){
                return t*t*t;
            }else{
                return 3.*sigma*sigma*(t-4./29.);
            }
        }
        vec3 cielabtoxyz(vec3 c) {
            const float xn = 95.047;
            const float yn = 100.;
            const float zn = 108.883;
            return vec3(xn*f1((c.x+16.)/116.  + c.y/500. ),
                        yn*f1((c.x+16.)/116.),
                        zn*f1((c.x+16.)/116.  - c.z/200. )
                    );
        }
        vec3 xyztorgb(vec3 c){
            return c * XYZ_2_RGB;
        }

        vec3 xyztosrgb(vec3 c) {
            return rgb_to_srgb_approx(xyztorgb(c));
        }
        #endif
        `);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = XYZ;


/***/ }),
/* 45 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__functions__ = __webpack_require__(1);



class Zoom extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    /**
     * @description get the current zoom level
     */
    constructor() {
        super({ zoom: Object(__WEBPACK_IMPORTED_MODULE_1__functions__["float"])(0) });
    }
    _compile(metadata) {
        super._compile(metadata);
        this.type = 'float';
        super.inlineMaker = inline => inline.zoom;
    }
    _preDraw(drawMetadata, gl) {
        this.zoom.expr = drawMetadata.zoom;
        this.zoom._preDraw(drawMetadata, gl);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Zoom;



/***/ }),
/* 46 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__functions__ = __webpack_require__(1);



let quantilesUID = 0;

function genQuantiles(global) {
    return class Quantiles extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
        constructor(input, buckets) {
            if (!Number.isFinite(buckets)) {
                throw new Error('Quantiles() only accepts a fixed number of buckets');
            }
            let children = {
                input
            };
            let breakpoints = [];
            for (let i = 0; i < buckets - 1; i++) {
                children[`arg${i}`] = Object(__WEBPACK_IMPORTED_MODULE_1__functions__["float"])(i * 10);
                breakpoints.push(children[`arg${i}`]);
            }
            super(children);
            this.quantilesUID = quantilesUID++;
            this.numCategories = buckets;
            this.buckets = buckets;
            this.breakpoints = breakpoints;
        }
        _compile(metadata) {
            super._compile(metadata);
            this.type = 'category';
            if (global) {
                const copy = metadata.sample.map(s => s[this.input.name]);
                copy.sort((x, y) => x - y);
                this.breakpoints.map((breakpoint, index) => {
                    const p = (index + 1) / this.buckets;
                    breakpoint.expr = copy[Math.floor(p * copy.length)];
                });
            }
        }
        _getDrawMetadataRequirements() {
            return { columns: [this.input.name] };
        }
        _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
            const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(uniformIDMaker, propertyTIDMaker));
            let childInlines = {};
            childSources.map((source, index) => childInlines[this.childrenNames[index]] = source.inline);
            const funcName = `quantiles${this.quantilesUID}`;
            const elif = (_, index) =>
                `${index > 0 ? 'else' : ''} if (x<(${childInlines[`arg${index}`]})){
            return ${index + 1}.;
        }`;
            const funcBody = this.breakpoints.map(elif).join('');
            const preface = `float ${funcName}(float x){
        ${funcBody}
        return 0.;
    }`;
            return {
                preface: childSources.map(s => s.preface).reduce((a, b) => a + b, '') + preface,
                inline: `${funcName}(${childInlines.input})`
            };
        }
        _preDraw(drawMetadata, gl) {
            const column = drawMetadata.columns.find(c => c.name == this.input.name);
            let i = 0;
            const total = column.accumHistogram[column.histogramBuckets - 1];
            const r = Math.random();
            let brs = [];

            // TODO OPT: this could be faster with binary search
            if (!global) {
                this.breakpoints.map((breakpoint, index) => {
                    for (i; i < column.histogramBuckets; i++) {
                        if (column.accumHistogram[i] >= (index + 1) / this.buckets * total) {
                            break;
                        }
                    }
                    const percentileValue = i / column.histogramBuckets * (column.max - column.min) + column.min;
                    brs.push(percentileValue);
                    breakpoint.expr = percentileValue;
                });
            }
            if (r > 0.99) {
                console.log(this.breakpoints.map(br => br.expr));
            }
            super._preDraw(drawMetadata, gl);
        }
        getBreakpointList() {
            return this.breakpoints.map(br => br.expr);
        }
    };
}

const Quantiles = genQuantiles(false);
/* harmony export (immutable) */ __webpack_exports__["b"] = Quantiles;

const GlobalQuantiles = genQuantiles(true);
/* harmony export (immutable) */ __webpack_exports__["a"] = GlobalQuantiles;



/***/ }),
/* 47 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__functions__ = __webpack_require__(1);



const ViewportMax = generateAggregattion('max');
/* harmony export (immutable) */ __webpack_exports__["i"] = ViewportMax;

const ViewportMin = generateAggregattion('min');
/* harmony export (immutable) */ __webpack_exports__["j"] = ViewportMin;

const ViewportAvg = generateAggregattion('avg');
/* harmony export (immutable) */ __webpack_exports__["g"] = ViewportAvg;

const ViewportSum = generateAggregattion('sum');
/* harmony export (immutable) */ __webpack_exports__["l"] = ViewportSum;

const ViewportCount = generateAggregattion('count');
/* harmony export (immutable) */ __webpack_exports__["h"] = ViewportCount;


const GlobalMax = generateAggregattion('max', true);
/* harmony export (immutable) */ __webpack_exports__["c"] = GlobalMax;

const GlobalMin = generateAggregattion('min', true);
/* harmony export (immutable) */ __webpack_exports__["d"] = GlobalMin;

const GlobalAvg = generateAggregattion('avg', true);
/* harmony export (immutable) */ __webpack_exports__["a"] = GlobalAvg;

const GlobalSum = generateAggregattion('sum', true);
/* harmony export (immutable) */ __webpack_exports__["f"] = GlobalSum;

const GlobalCount = generateAggregattion('count', true);
/* harmony export (immutable) */ __webpack_exports__["b"] = GlobalCount;


const ViewportPercentile = generatePercentile();
/* harmony export (immutable) */ __webpack_exports__["k"] = ViewportPercentile;

const GlobalPercentile = generatePercentile(true);
/* harmony export (immutable) */ __webpack_exports__["e"] = GlobalPercentile;


function generateAggregattion(metadataPropertyName, global) {
    return class Aggregattion extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
        /**
         * @jsapi
         * @param {*} property
         */
        constructor(property) {
            super({ value: Object(__WEBPACK_IMPORTED_MODULE_1__functions__["float"])(0) });
            this.property = property;
        }
        _compile(metadata) {
            console.log(metadata);
            super._compile(metadata);
            this.property._compile(metadata);
            this.type = 'float';
            super.inlineMaker = inline => inline.value;
            if (global) {
                this.value.expr = metadata.columns.find(c => c.name == this.property.name)[metadataPropertyName];
            }
        }
        _getMinimumNeededSchema() {
            return this.property._getMinimumNeededSchema();
        }
        _getDrawMetadataRequirements() {
            return { columns: [this.property.name] };
        }
        _preDraw(drawMetadata, gl) {
            const column = drawMetadata.columns.find(c => c.name == this.property.name);
            if (!global) {
                this.value.expr = column[metadataPropertyName];
            }
            if (Math.random() > 0.999) {
                console.log(metadataPropertyName, this.property.name, this.value.expr);
            }
            this.value._preDraw(drawMetadata, gl);
        }
        getValue() {
            return this.value.expr;
        }
    };
}

function generatePercentile(global) {
    return class Percentile extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
        /**
         * @jsapi
         * @param {*} property
         */
        constructor(property, percentile) {
            if (!Number.isFinite(percentile)) {
                throw new Error('Percentile must be a fixed literal number');
            }
            super({ value: Object(__WEBPACK_IMPORTED_MODULE_1__functions__["float"])(0) });
            this.property = property;
            this.percentile = percentile;
        }
        _compile(metadata) {
            super._compile(metadata);
            this.property._compile(metadata);
            this.type = 'float';
            super.inlineMaker = inline => inline.value;
            if (global) {
                const copy = metadata.sample.map(s => s[this.property.name]);
                copy.sort((x, y) => x - y);
                const p = this.percentile / 100;
                this.value.expr = copy[Math.floor(p * copy.length)];
            }
        }
        _getMinimumNeededSchema() {
            return this.property._getMinimumNeededSchema();
        }
        _getDrawMetadataRequirements() {
            return { columns: [this.property.name] };
        }
        _preDraw(drawMetadata, gl) {
            if (!global) {
                const column = drawMetadata.columns.find(c => c.name == this.property.name);
                const total = column.accumHistogram[999];
                // TODO OPT: this could be faster with binary search
                for (var i = 0; i < column.histogramBuckets; i++) {
                    if (column.accumHistogram[i] >= this.percentile / 100 * total) {
                        break;
                    }
                }
                const br = i / column.histogramBuckets * (column.max - column.min) + column.min;
                this.value.expr = br;
            }

            if (Math.random() > 0.99) {
                console.log(`percentile${this.percentile}`, this.property.name, this.value.expr);
            }
            this.value._preDraw(drawMetadata, gl);
        }
        getValue() {
            return this.value.expr;
        }
    };
}


/***/ }),
/* 48 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__expression__ = __webpack_require__(0);


class Width extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    constructor() {
        super({});
        this.type = 'propertyReference';
    }
}
/* harmony export (immutable) */ __webpack_exports__["d"] = Width;


class Asc extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    constructor(by) {
        super({});
        if (!(by instanceof Width)) {
            throw new Error('Asc() only accepts \'width()\' for now');
        }
        this.type = 'orderer';
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Asc;


class Desc extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    constructor(by) {
        super({});
        if (!(by instanceof Width)) {
            throw new Error('Desc() only accepts \'width()\' for now');
        }
        this.type = 'orderer';
    }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = Desc;


class NoOrder extends __WEBPACK_IMPORTED_MODULE_0__expression__["a" /* default */] {
    constructor() {
        super({});
        this.type = 'orderer';
    }
}
/* harmony export (immutable) */ __webpack_exports__["c"] = NoOrder;



/***/ }),
/* 49 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__base__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__error_handling_carto_validation_error__ = __webpack_require__(5);





class Dataset extends __WEBPACK_IMPORTED_MODULE_1__base__["a" /* default */] {

    /**
     * Create a carto.source.Dataset.
     *
     * @param {string} tableName - The name of an existing table
     * @param {object} auth
     * @param {string} auth.apiKey - API key used to authenticate against CARTO
     * @param {string} auth.user - Name of the user
     * @param {object} config
     * @param {string} [config.serverURL='https://{user}.carto.com'] - URL of the CARTO Maps API server
     *
     * @example
     * new carto.source.Dataset('european_cities', {
     *   apiKey: 'YOUR_API_KEY_HERE',
     *   user: 'YOUR_USERNAME_HERE'
     * });
     *
     * @fires CartoError
     *
     * @constructor Dataset
     * @extends carto.source.Base
     * @memberof carto.source
     * @api
     */
    constructor(tableName, auth, config) {
        super();
        this._checkTableName(tableName);
        this._tableName = tableName;
        this.initialize(auth, config);
    }

    _checkTableName(tableName) {
        if (__WEBPACK_IMPORTED_MODULE_0__util__["d" /* isUndefined */](tableName)) {
            throw new __WEBPACK_IMPORTED_MODULE_2__error_handling_carto_validation_error__["a" /* default */]('source', 'tableNameRequired');
        }
        if (!__WEBPACK_IMPORTED_MODULE_0__util__["c" /* isString */](tableName)) {
            throw new __WEBPACK_IMPORTED_MODULE_2__error_handling_carto_validation_error__["a" /* default */]('source', 'tableNameStringRequired');
        }
        if (tableName === '') {
            throw new __WEBPACK_IMPORTED_MODULE_2__error_handling_carto_validation_error__["a" /* default */]('source', 'nonValidTableName');
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Dataset;



/***/ }),
/* 50 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_renderer__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__rsys__ = __webpack_require__(60);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_pbf__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_pbf___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_pbf__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_lru_cache__ = __webpack_require__(63);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_lru_cache___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_lru_cache__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__windshaft_filtering__ = __webpack_require__(71);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__mapbox_vector_tile__ = __webpack_require__(72);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__mapbox_vector_tile___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__mapbox_vector_tile__);








const SAMPLE_ROWS = 1000;
const MIN_FILTERING = 500000;

// Get dataframes <- MVT <- Windshaft
// Get metadata
// Instantiate map Windshaft
// Requrest SQL API (temp)
// Cache dataframe

class Windshaft {

    constructor(source) {
        this._source = source;

        this._requestGroupID = 0;
        this._oldDataframes = [];
        this._MNS = null;
        this._promiseMNS = null;
        this._categoryStringToIDMap = {};
        this._numCategories = 0;
        const lruOptions = {
            max: 1000
            // TODO improve cache length heuristic
            , length: function () { return 1; }
            , dispose: (key, promise) => {
                promise.then(dataframe => {
                    if (!dataframe.empty) {
                        dataframe.free();
                        this._removeDataframe(dataframe);
                    }
                });
            }
            , maxAge: 1000 * 60 * 60
        };
        this.cache = __WEBPACK_IMPORTED_MODULE_3_lru_cache__(lruOptions);
        this.inProgressInstantiations = {};
        this._subdomainCounter = 0;
    }

    _bindLayer(addDataframe, removeDataframe, dataLoadedCallback) {
        this._addDataframe = addDataframe;
        this._removeDataframe = removeDataframe;
        this._dataLoadedCallback = dataLoadedCallback;
    }

    _getInstantiationID(MNS, resolution, filtering) {
        return JSON.stringify({
            MNS,
            resolution,
            filtering: this.metadata && this.metadata.featureCount > MIN_FILTERING ? filtering : null
        });
    }

    /**
     * Should be called whenever the viewport or the style changes
     * Returns falseable if the metadata didn't changed, or a promise to a Metadata if it did change
     * @param {*} viewport
     * @param {*} MNS
     * @param {*} addDataframe
     * @param {*} styleDataframe
     */
    async getData(viewport, style) {
        const MNS = style.getMinimumNeededSchema();
        const resolution = style.getResolution();
        const filtering = __WEBPACK_IMPORTED_MODULE_4__windshaft_filtering__["a" /* getFiltering */](style);
        const tiles = __WEBPACK_IMPORTED_MODULE_1__rsys__["b" /* rTiles */](viewport);
        if (this._needToInstantiate(MNS, resolution, filtering)) {
            await this._instantiate(MNS, resolution, filtering);
        }
        this._getTiles(tiles);
        return this.metadata;
    }

    _getTiles(tiles) {
        this._requestGroupID++;
        var completedTiles = [];
        var needToComplete = tiles.length;
        const requestGroupID = this._requestGroupID;
        tiles.forEach(t => {
            const { x, y, z } = t;
            this.getDataframe(x, y, z).then(dataframe => {
                if (dataframe.empty) {
                    needToComplete--;
                } else {
                    completedTiles.push(dataframe);
                }
                if (completedTiles.length == needToComplete && requestGroupID == this._requestGroupID) {
                    this._oldDataframes.map(d => d.active = false);
                    completedTiles.map(d => d.active = true);
                    this._oldDataframes = completedTiles;
                    this._dataLoadedCallback();
                }
            });
        });
    }

    /**
     * Check if the map needs to be reinstantiated
     * This happens:
     *  - When the minimun required schema changed.
     *  - When the resolution changed.
     *  - When the filter conditions changed and the dataset should be server-filtered.
     */
    _needToInstantiate(MNS, resolution, filtering) {
        return !__WEBPACK_IMPORTED_MODULE_0__core_renderer__["c" /* schema */].equals(this._MNS, MNS) || resolution != this.resolution || (JSON.stringify(filtering) != JSON.stringify(this.filtering) && this.metadata.featureCount > MIN_FILTERING);
    }

    _getCategoryIDFromString(category) {
        if (this._categoryStringToIDMap[category] !== undefined) {
            return this._categoryStringToIDMap[category];
        }
        this._categoryStringToIDMap[category] = this._numCategories;
        this._numCategories++;
        return this._categoryStringToIDMap[category];
    }


    async _instantiateUncached(MNS, resolution, filters){
        const conf = this._getConfig();
        const agg = await this._generateAggregation(MNS, resolution);
        const select = this._buildSelectClause(MNS);
        let aggSQL = this._buildQuery(select);

        const query = `(${aggSQL}) AS tmp`;
        const metadata = await this.getMetadata(query, MNS, conf);

        // If the number of features is higher than the minimun, enable server filtering.
        if (metadata.featureCount > MIN_FILTERING) {
            aggSQL = `SELECT ${select.filter((item, pos) => select.indexOf(item) == pos).join()} FROM ${this._source._query ? `(${this._source._query}) as _cdb_query_wrapper` : this._source._tableName} ${__WEBPACK_IMPORTED_MODULE_4__windshaft_filtering__["b" /* getSQLWhere */](filters)}`;
        }

        const urlTemplate = await this._getUrlPromise(query, conf, agg, aggSQL);
        this._oldDataframes = [];
        this.cache.reset();
        this.urlTemplate = urlTemplate;
        this.metadata = metadata;
        this._MNS = MNS;
        this.filtering = filters;
        this.resolution = resolution;

        // Store instantiation
        return metadata;
    }
    async _instantiate(MNS, resolution, filters) {
        if (this.inProgressInstantiations[this._getInstantiationID(MNS, resolution, filters)]) {
            return this.inProgressInstantiations[this._getInstantiationID(MNS, resolution, filters)];
        }
        console.log(this._getInstantiationID(MNS, resolution, filters));
        const promise = this._instantiateUncached(MNS, resolution, filters);
        this.inProgressInstantiations[this._getInstantiationID(MNS, resolution, filters)] = promise;
        return promise;
    }

    _generateAggregation(MRS, resolution) {
        let aggregation = {
            columns: {},
            dimensions: {},
            placement: 'centroid',
            resolution: resolution,
            threshold: 1,
        };

        MRS.columns
            .forEach(name => {
                if (name.startsWith('_cdb_agg_')) {
                    aggregation.columns[name] = {
                        aggregate_function: getAggFN(name),
                        aggregated_column: getBase(name)
                    };
                } else {
                    aggregation.dimensions[name] = name;
                }
            });

        return aggregation;
    }

    _buildSelectClause(MRS) {
        return MRS.columns.map(name => name.startsWith('_cdb_agg_') ? getBase(name) : name).concat(['the_geom', 'the_geom_webmercator']);
    }

    _buildQuery(select) {
        return `SELECT ${select.filter((item, pos) => select.indexOf(item) == pos).join()} FROM ${this._source._query ? `(${this._source._query}) as _cdb_query_wrapper` : this._source._tableName}`;
    }

    _getConfig() {
        return {
            apiKey: this._source._apiKey,
            username: this._source._username,
            serverURL: this._source._serverURL
        };
    }

    free() {
        this.cache.reset();
    }

    _generateDataFrame(rs, geometry, properties, size, type) {
        // TODO: Should the dataframe constructor have type and size parameters?
        const dataframe = new __WEBPACK_IMPORTED_MODULE_0__core_renderer__["a" /* Dataframe */](
            rs.center,
            rs.scale,
            geometry,
            properties,
        );
        dataframe.type = type;
        dataframe.size = size;

        return dataframe;
    }

    async _getUrlPromise(query, conf, agg, aggSQL) {
        const LAYER_INDEX = 0;
        this.geomType = await this.getGeometryType(query, conf);

        if (this.geomType != 'point') {
            agg = false;
        }

        const mapConfigAgg = {
            buffersize: {
                'mvt': 0
            },
            layers: [
                {
                    type: 'mapnik',
                    options: {
                        sql: aggSQL,
                        aggregation: agg
                    }
                }
            ]
        };
        const response = await fetch(endpoint(conf), this._getRequestConfig(mapConfigAgg));
        const layergroup = await response.json();
        this._subdomains = layergroup.cdn_url.templates.https.subdomains;
        return getLayerUrl(layergroup, LAYER_INDEX, conf);
    }

    _getRequestConfig(mapConfigAgg) {
        return {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mapConfigAgg),
        };
    }

    getDataframe(x, y, z) {
        const id = `${x},${y},${z}`;
        const c = this.cache.get(id);
        if (c) {
            return c;
        }
        const promise = this.requestDataframe(x, y, z);
        this.cache.set(id, promise);
        return promise;
    }

    requestDataframe(x, y, z) {
        const mvt_extent = 4096;

        return fetch(this._getTileUrl(x, y, z))
            .then(rawData => rawData.arrayBuffer())
            .then(response => {

                if (response.byteLength == 0 || response == 'null') {
                    return { empty: true };
                }
                var tile = new __WEBPACK_IMPORTED_MODULE_5__mapbox_vector_tile__["VectorTile"](new __WEBPACK_IMPORTED_MODULE_2_pbf__(response));
                const mvtLayer = tile.layers[Object.keys(tile.layers)[0]];
                var fieldMap = {};

                const numFields = [];
                const catFields = [];
                const catFieldsReal = [];
                const numFieldsReal = [];
                this._MNS.columns.map(name => {
                    const basename = name.startsWith('_cdb_agg_') ? getBase(name) : name;
                    if (this.metadata.columns.find(c => c.name == basename).type == 'category') {
                        catFields.push(name);
                        catFieldsReal.push(name);
                    } else {
                        numFields.push(name);
                        numFieldsReal.push(name);
                    }

                }
                );
                catFieldsReal.map((name, i) => fieldMap[name] = i);
                numFieldsReal.map((name, i) => fieldMap[name] = i + catFields.length);

                const { points, featureGeometries, properties } = this._decodeMVTLayer(mvtLayer, this.metadata, mvt_extent, catFields, catFieldsReal, numFields);

                var rs = __WEBPACK_IMPORTED_MODULE_1__rsys__["a" /* getRsysFromTile */](x, y, z);
                let dataframeProperties = {};
                Object.keys(fieldMap).map((name, pid) => {
                    dataframeProperties[name] = properties[pid];
                });
                let dataFrameGeometry = this.geomType == 'point' ? points : featureGeometries;
                const dataframe = this._generateDataFrame(rs, dataFrameGeometry, dataframeProperties, mvtLayer.length, this.geomType);
                this._addDataframe(dataframe);
                return dataframe;
            });
    }

    _getTileUrl(x, y, z) {
        const s = this._subdomains[this._subdomainCounter++ % this._subdomains.length];
        return this.urlTemplate.replace('{x}', x).replace('{y}', y).replace('{z}', z).replace('{s}', s);
    }

    _decodePolygons(geom, featureGeometries, mvt_extent) {
        let polygon = null;
        let geometry = [];
        /*
            All this clockwise non-sense is needed because the MVT decoder dont decode the MVT fully.
            It doesn't distinguish between internal polygon rings (which defines holes) or external ones, which defines more polygons (mulipolygons)
            See:
                https://github.com/mapbox/vector-tile-spec/tree/master/2.1
                https://en.wikipedia.org/wiki/Shoelace_formula
        */
        for (let j = 0; j < geom.length; j++) {
            //if exterior
            //   push current polygon & set new empty
            //else=> add index to holes
            if (isClockWise(geom[j])) {
                if (polygon) {
                    geometry.push(polygon);
                }
                polygon = {
                    flat: [],
                    holes: []
                };
            } else {
                if (j == 0) {
                    throw new Error('Invalid MVT tile: first polygon ring MUST be external');
                }
                polygon.holes.push(polygon.flat.length / 2);
            }
            for (let k = 0; k < geom[j].length; k++) {
                polygon.flat.push(2 * geom[j][k].x / mvt_extent - 1.);
                polygon.flat.push(2 * (1. - geom[j][k].y / mvt_extent) - 1.);
            }
        }
        //if current polygon is not empty=> push it
        if (polygon && polygon.flat.length > 0) {
            geometry.push(polygon);
        }
        featureGeometries.push(geometry);
    }

    _decodeLines(geom, featureGeometries, mvt_extent) {
        let geometry = [];
        geom.map(l => {
            let line = [];
            l.map(point => {
                line.push(2 * point.x / mvt_extent - 1, 2 * (1 - point.y / mvt_extent) - 1);
            });
            geometry.push(line);
        });
        featureGeometries.push(geometry);
    }

    _decodeMVTLayer(mvtLayer, metadata, mvt_extent, catFields, catFieldsReal, numFields) {
        var properties = [new Float32Array(mvtLayer.length + 1024), new Float32Array(mvtLayer.length + 1024), new Float32Array(mvtLayer.length + 1024), new Float32Array(mvtLayer.length + 1024)];
        if (this.geomType == 'point') {
            var points = new Float32Array(mvtLayer.length * 2);
        }
        let featureGeometries = [];
        for (var i = 0; i < mvtLayer.length; i++) {
            const f = mvtLayer.feature(i);
            const geom = f.loadGeometry();
            if (this.geomType == 'point') {
                points[2 * i + 0] = 2 * (geom[0][0].x) / mvt_extent - 1.;
                points[2 * i + 1] = 2 * (1. - (geom[0][0].y) / mvt_extent) - 1.;
            } else if (this.geomType == 'polygon') {
                this._decodePolygons(geom, featureGeometries, mvt_extent);
            } else if (this.geomType == 'line') {
                this._decodeLines(geom, featureGeometries, mvt_extent);
            } else {
                throw new Error(`Unimplemented geometry type: '${this.geomType}'`);
            }

            catFields.map((name, index) => {
                properties[index][i] = this._getCategoryIDFromString(f.properties[name]);
            });
            numFields.map((name, index) => {
                properties[index + catFields.length][i] = Number(f.properties[name]);
            });
        }

        return { properties, points, featureGeometries };
    }
    async getMetadata(query, proto, conf) {
        //Get column names and types with a limit 0
        //Get min,max,sum and count of numerics
        //for each category type
        //Get category names and counts by grouping by
        //Assign ids
        const metadata = {
            columns: [],
        };
        const fields = await this.getColumnTypes(query, conf);
        let numerics = [];
        let categories = [];
        Object.keys(fields).map(name => {
            const type = fields[name].type;
            if (type == 'number') {
                numerics.push(name);
            } else if (type == 'string') {
                categories.push(name);
            }
        });

        metadata.featureCount = await this.getFeatureCount(query, conf);
        const numericsTypes = await this.getNumericTypes(numerics, query, conf);
        const categoriesTypes = await this.getCategoryTypes(categories, query, conf);
        const sampling = Math.min(SAMPLE_ROWS / metadata.featureCount, 1);
        const sample = await this.getSample(conf, sampling);

        numerics.map((name, index) => {
            const t = numericsTypes[index];
            metadata.columns.push(t);
        });
        metadata.categoryIDs = {};
        metadata.sample = sample;
        categories.map((name, index) => {
            const t = categoriesTypes[index];
            t.categoryNames.map(name => metadata.categoryIDs[name] = this._getCategoryIDFromString(name));
            metadata.columns.push(t);
        });
        return metadata;
    }

    async getSample(conf, sampling) {
        let q;
        if (this._source._tableName) {
            q = `SELECT * FROM ${this._source._tableName} TABLESAMPLE BERNOULLI (${100 * sampling}) REPEATABLE (0);`;
        } else {
            // Fallback to random() since 'TABLESAMPLE BERNOULLI' is not supported on queries
            q = `WITH _rndseed as (SELECT setseed(0.5))
                    SELECT * FROM (${this._source._query}) as _cdb_query_wrapper WHERE random() < ${sampling};`;
        }

        const response = await fetch(`${conf.serverURL}/api/v2/sql?q=` + encodeURIComponent(q));
        const json = await response.json();
        console.log(json);
        return json.rows;
    }

    async getFeatureCount(query, conf) {
        const q = `SELECT COUNT(*) FROM ${query};`;
        const response = await fetch(`${conf.serverURL}/api/v2/sql?q=` + encodeURIComponent(q));
        const json = await response.json();
        return json.rows[0].count;
    }

    async getColumnTypes(query, conf) {
        const columnListQuery = `select * from ${query} limit 0;`;
        const response = await fetch(`${conf.serverURL}/api/v2/sql?q=` + encodeURIComponent(columnListQuery));
        const json = await response.json();
        return json.fields;
    }

    async getGeometryType(query, conf) {
        const columnListQuery = `SELECT ST_GeometryType(the_geom) AS type FROM ${query} WHERE the_geom IS NOT NULL LIMIT 1;`;
        const response = await fetch(`${conf.serverURL}/api/v2/sql?q=` + encodeURIComponent(columnListQuery));
        const json = await response.json();
        const type = json.rows[0].type;
        switch (type) {
        case 'ST_MultiPolygon':
            return 'polygon';
        case 'ST_Point':
            return 'point';
        case 'ST_MultiLineString':
            return 'line';
        default:
            throw new Error(`Unimplemented geometry type ''${type}'`);
        }
    }

    async getNumericTypes(names, query, conf) {
        const aggFns = ['min', 'max', 'sum', 'avg'];
        const numericsSelect = names.map(name =>
            aggFns.map(fn => `${fn}(${name}) AS ${name}_${fn}`)
        ).concat(['COUNT(*)']).join();
        const numericsQuery = `SELECT ${numericsSelect} FROM ${query};`;
        const response = await fetch(`${conf.serverURL}/api/v2/sql?q=` + encodeURIComponent(numericsQuery));
        const json = await response.json();
        return names.map(name => {
            return {
                name,
                type: 'float',
                min: json.rows[0][`${name}_min`],
                max: json.rows[0][`${name}_max`],
                avg: json.rows[0][`${name}_avg`],
                sum: json.rows[0][`${name}_sum`],
            };
        }
        );
    }

    async getCategoryTypes(names, query, conf) {
        return Promise.all(names.map(async name => {
            const catQuery = `SELECT COUNT(*), ${name} AS name FROM ${query} GROUP BY ${name} ORDER BY COUNT(*) DESC;`;
            const response = await fetch(`${conf.serverURL}/api/v2/sql?q=` + encodeURIComponent(catQuery));
            const json = await response.json();
            let counts = [];
            let names = [];
            json.rows.map(row => {
                counts.push(row.count);
                names.push(row.name);
            });
            return {
                name,
                type: 'category',
                categoryNames: names,
                categoryCounts: counts
            };
        }));
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Windshaft;



function isClockWise(vertices) {
    let a = 0;
    for (let i = 0; i < vertices.length; i++) {
        let j = (i + 1) % vertices.length;
        a += vertices[i].x * vertices[j].y;
        a -= vertices[j].x * vertices[i].y;
    }
    return a > 0;
}

function getBase(name) {
    return name.replace(/_cdb_agg_[a-zA-Z0-9]+_/g, '');
}

function getAggFN(name) {
    let s = name.substr('_cdb_agg_'.length);
    return s.substr(0, s.indexOf('_'));
}

const endpoint = (conf) => {
    return `${conf.serverURL}/api/v1/map?api_key=${conf.apiKey}`;
};

function getLayerUrl(layergroup, layerIndex, conf) {
    if (layergroup.cdn_url && layergroup.cdn_url.templates) {
        const urlTemplates = layergroup.cdn_url.templates.https;
        return `${urlTemplates.url}/${conf.username}/api/v1/map/${layergroup.layergroupid}/${layerIndex}/{z}/{x}/{y}.mvt?api_key=${conf.apiKey}`;
    }
    return `${endpoint(conf)}/${layergroup.layergroupid}/${layerIndex}/{z}/{x}/{y}.mvt`;
}

/**
 * Responsabilities: get tiles, decode tiles, return dataframe promises, optionally: cache, coalesce all layer with a source engine, return bound dataframes
 */


/***/ }),
/* 51 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__point__ = __webpack_require__(52);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__tris__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__lines__ = __webpack_require__(54);
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_0__point__; });
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_1__tris__; });
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_2__lines__; });





/***/ }),
/* 52 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//TODO performance optimization: direct stroke/color/widths from uniform instead of texture read when possible

/*
    Antialiasing

    I think that the current antialiasing method is correct.
    It is certainly fast since it uses the distance to the circumference.
    The results have been checked against a reference 4x4 sampling method.

    The vertex shader is responsible for the oversizing of the points to "enable" conservative rasterization.
    See https://developer.nvidia.com/content/dont-be-conservative-conservative-rasterization
    This oversizing requires a change of the coordinate space that must be reverted in the fragment shader.
    This is done with `sizeNormalizer`.


    Debugging antialiasing is hard. I'm gonna leave here a few helpers:

    float referenceAntialias(vec2 p){
        float alpha=0.;
        for (float x=-0.75; x<1.; x+=0.5){
            for (float y=-0.75; y<1.; y+=0.5){
                vec2 p2 = p + vec2(x,y)*dp;
                if (length(p2)<1.){
                    alpha+=1.;
                }
            }
        }
        return alpha/16.;
    }
    float noAntialias(vec2 p){
        if (length(p)<1.){
            return 1.;
        }
        return 0.;
    }

    Use this to check that the affected antiliased pixels are ok:

    if (c.a==1.||c.a==0.){
        gl_FragColor = vec4(1,0,0,1);
        return;
    }

 */

const VS = `

precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;
uniform float orderMinWidth;
uniform float orderMaxWidth;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D colorStrokeTex;
uniform sampler2D strokeWidthTex;
uniform sampler2D filterTex;
//TODO order bucket texture

varying highp vec4 color;
varying highp vec4 stroke;
varying highp float dp;
varying highp float sizeNormalizer;
varying highp float fillScale;
varying highp float strokeScale;

void main(void) {
    color = texture2D(colorTex, featureID);
    stroke = texture2D(colorStrokeTex, featureID);
    float filtering = texture2D(filterTex, featureID).a;
    color.a *= filtering;
    stroke.a *= filtering;

    float size = 64.*texture2D(widthTex, featureID).a;
    float fillSize = size;
    float strokeSize = 64.*texture2D(strokeWidthTex, featureID).a;
    size+=strokeSize*0.5;
    fillScale=size/fillSize;
    strokeScale=size/max(0.001, (fillSize-strokeSize*0.5));
    if (fillScale==strokeScale){
        stroke.a=0.;
    }
    gl_PointSize = size+2.;
    dp = 1.0/(size+1.);
    sizeNormalizer = (size+1.)/(size);

    vec4 p = vec4(vertexScale*vertexPosition-vertexOffset, 0.5, 1.);
    if (size==0. || (stroke.a==0. && color.a==0.) || size<orderMinWidth || size>orderMaxWidth){
        p.x=10000.;
    }
    gl_Position  = p;
}`;
/* harmony export (immutable) */ __webpack_exports__["VS"] = VS;


const FS = `
precision highp float;

varying lowp vec4 color;
varying lowp vec4 stroke;
varying highp float dp;
varying highp float sizeNormalizer;
varying highp float fillScale;
varying highp float strokeScale;

float distanceAntialias(vec2 p){
    return 1. - smoothstep(1.-dp*1.4142, 1.+dp*1.4142, length(p));
}


void main(void) {
    vec2 p = (2.*gl_PointCoord-vec2(1.))*sizeNormalizer;
    vec4 c = color;

    vec4 s = stroke;

    c.a *= distanceAntialias(p*fillScale);
    c.rgb*=c.a;

    s.a *= distanceAntialias(p);
    s.a *= 1.-distanceAntialias((strokeScale)*p);
    s.rgb*=s.a;

    c=s+(1.-s.a)*c;

    gl_FragColor = c;
}`;
/* harmony export (immutable) */ __webpack_exports__["FS"] = FS;


/***/ }),
/* 53 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
const VS = `

precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;

uniform sampler2D colorTex;
uniform sampler2D filterTex;

varying highp vec4 color;


void main(void) {
    vec4 c = texture2D(colorTex, featureID);
    float filtering = texture2D(filterTex, featureID).a;
    c.a *= filtering;
    vec4 p = vec4(vertexScale*vertexPosition-vertexOffset, 0.5, 1.);
    if (c.a==0.){
        p.x=10000.;
    }
    color = vec4(c.rgb*c.a, c.a);
    gl_Position  = p;
}`;
/* harmony export (immutable) */ __webpack_exports__["VS"] = VS;


const FS = `
precision highp float;

varying highp vec4 color;

void main(void) {
    gl_FragColor = color;
}`;
/* harmony export (immutable) */ __webpack_exports__["FS"] = FS;


/***/ }),
/* 54 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
const VS = `

precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;
attribute vec2 normal;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D filterTex;

varying lowp vec4 color;

void main(void) {
    color = texture2D(colorTex, featureID);
    float filtering = texture2D(filterTex, featureID).a;
    color.a *= filtering;
    color.rgb *= color.a;
    float size = 64.*texture2D(widthTex, featureID).a;

    vec4 p = vec4(vertexScale*(vertexPosition)+normal*0.001*size-vertexOffset, 0.5, 1.);
    if (size==0. || color.a==0.){
        p.x=10000.;
    }
    gl_Position  = p;
}`;
/* harmony export (immutable) */ __webpack_exports__["VS"] = VS;


const FS = `
precision highp float;

varying lowp vec4 color;

void main(void) {
    gl_FragColor = color;
}`;
/* harmony export (immutable) */ __webpack_exports__["FS"] = FS;


/***/ }),
/* 55 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//TODO Discuss size scaling constant, maybe we need to remap using an exponential map

const VS = `

precision highp float;
attribute vec2 vertex;

varying  vec2 uv;

void main(void) {
    uv = vertex*0.5+vec2(0.5);
    gl_Position = vec4(vertex, 0.5, 1.);
}
`;
/* harmony export (immutable) */ __webpack_exports__["VS"] = VS;


const FS = `

precision highp float;

varying  vec2 uv;

$PREFACE

uniform sampler2D property0;
uniform sampler2D property1;
uniform sampler2D property2;
uniform sampler2D property3;

void main(void) {
    // TODO texture reads should be dynamic to improve Texture Unit utilization
    float p0=texture2D(property0, uv).a;
    float p1=texture2D(property1, uv).a;
    float p2=texture2D(property2, uv).a;
    float p3=texture2D(property3, uv).a;
    gl_FragColor = $INLINE;
}
`;
/* harmony export (immutable) */ __webpack_exports__["FS"] = FS;



/***/ }),
/* 56 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

const VS = `

precision highp float;
attribute vec2 vertex;

varying  vec2 uv;

void main(void) {
    uv = vertex*0.5+vec2(0.5);
    gl_Position = vec4(vertex, 0.5, 1.);
}
`;
/* harmony export (immutable) */ __webpack_exports__["b"] = VS;


const FS = `

precision highp float;

varying  vec2 uv;

uniform sampler2D aaTex;

void main(void) {
    vec4 aa = texture2D(aaTex, uv);
    gl_FragColor = aa;
}
`;
/* harmony export (immutable) */ __webpack_exports__["a"] = FS;



/***/ }),
/* 57 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/** 
 * To avoid recompiling the shaders we keep a shader cache.
 * We need a different shader per webgl context so we use a 2 level cache where at the first level
 * the webgl context is the key and at the second level the shader code is the cache key.
 */
class ShaderCache {
    constructor() {
        this.caches = new WeakMap();
    }

    get(gl, shadercode) {
        if (this.caches.has(gl)) {
            let cache = this.caches.get(gl);
            if (cache[shadercode]) {
                return cache[shadercode];
            }
        }
    }

    set(gl, shadercode, shader) {
        if (this.caches.has(gl)) {
            let cache = this.caches.get(gl);
            cache[shadercode] = shader;
        } else {
            let cache = new WeakMap;
            cache[shadercode] = shader;
            this.caches.set(gl, cache);
        }
    }

    has(gl, shadercode) {
        return this.get(gl, shadercode) !== undefined;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ShaderCache;



/***/ }),
/* 58 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_earcut__ = __webpack_require__(59);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_earcut___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_earcut__);


/**
 * @typedef {object} Dataframe - Point in renderer coordinates space
 * @property {RPoint} center
 * @property {number} scale
 * @property {geom} geometry
 * @property {Properties} properties
 */
class Dataframe {
    constructor(center, scale, geom, properties) {
        this.center = center;
        this.scale = scale;
        this.geom = geom;
        this.properties = properties;
    }
    bind(renderer) {
        const gl = renderer.gl;
        this.renderer = renderer;

        this.propertyTex = [];

        const decodedGeom = decodeGeom(this.type, this.geom);
        var points = decodedGeom.geometry;
        this.numVertex = points.length / 2;
        this.breakpointList = decodedGeom.breakpointList;
        this.numFeatures = this.breakpointList.length || this.numVertex;
        this._genDataframePropertyTextures(gl);

        const width = this.renderer.RTT_WIDTH;
        const height = Math.ceil(this.numFeatures / width);

        this.setStyle = (style) => {
            this.style = style;
        };
        this.style = null;

        this.vertexBuffer = gl.createBuffer();
        this.featureIDBuffer = gl.createBuffer();

        this.texColor = this._createStyleTileTexture(this.numFeatures);
        this.texWidth = this._createStyleTileTexture(this.numFeatures);
        this.texStrokeColor = this._createStyleTileTexture(this.numFeatures);
        this.texStrokeWidth = this._createStyleTileTexture(this.numFeatures);
        this.texFilter = this._createStyleTileTexture(this.numFeatures);

        var ids = new Float32Array(points.length);
        let index = 0;
        for (var i = 0; i < points.length; i += 2) {
            if ((!this.breakpointList.length && i > 0) || i == this.breakpointList[index]) {
                index++;
            }
            ids[i + 0] = ((index) % width) / (width - 1);
            ids[i + 1] = height > 1 ? Math.floor((index) / width) / (height - 1) : 0.5;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

        if (decodedGeom.normals) {
            this.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, decodedGeom.normals, gl.STATIC_DRAW);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.featureIDBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);
    }
    _genDataframePropertyTextures() {
        const gl = this.renderer.gl;
        const width = this.renderer.RTT_WIDTH;
        const height = Math.ceil(this.numFeatures / width);

        this.height = height;
        this.propertyID = {}; //Name => PID
        this.propertyCount = 0;
        for (var k in this.properties) {
            if (this.properties.hasOwnProperty(k) && this.properties[k].length > 0) {
                var propertyID = this.propertyID[k];
                if (propertyID === undefined) {
                    propertyID = this.propertyCount;
                    this.propertyCount++;
                    this.propertyID[k] = propertyID;
                }
                this.propertyTex[propertyID] = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, this.propertyTex[propertyID]);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA,
                    width, height, 0, gl.ALPHA, gl.FLOAT,
                    this.properties[k]);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
        }
    }
    _createStyleTileTexture(numFeatures) {
        // TODO we are wasting 75% of the memory for the scalar attributes (width, strokeWidth),
        // since RGB components are discarded
        const gl = this.renderer.gl;
        const width = this.renderer.RTT_WIDTH;
        const height = Math.ceil(numFeatures / width);
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return texture;
    }
    free() {
        if (this.propertyTex) {
            const gl = this.renderer.gl;
            this.propertyTex.map(tex => gl.deleteTexture(tex));
            gl.deleteTexture(this.texColor);
            gl.deleteTexture(this.texStrokeColor);
            gl.deleteTexture(this.texWidth);
            gl.deleteTexture(this.texStrokeWidth);
            gl.deleteTexture(this.texFilter);
            gl.deleteBuffer(this.vertexBuffer);
            gl.deleteBuffer(this.featureIDBuffer);
            this.texColor = 'freed';
            this.texWidth = 'freed';
            this.texStrokeColor = 'freed';
            this.texStrokeWidth = 'freed';
            this.texFilter = 'freed';
            this.vertexBuffer = 'freed';
            this.featureIDBuffer = 'freed';
            this.propertyTex = null;
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Dataframe;



function getLineNormal(a, b) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    return normalize([-dy, dx]);
}

function normalize(v) {
    const s = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / s, v[1] / s];
}
// Decode a tile geometry
// If the geometry type is 'point' it will pass trough the geom (the vertex array)
// If the geometry type is 'polygon' it will triangulate the polygon list (geom)
//      geom will be a list of polygons in which each polygon will have a flat array of vertices and a list of holes indices
//      Example:
/*         let geom = [
                {
                    flat: [
                        0.,0., 1.,0., 1.,1., 0.,1., 0.,0, //A square
                        0.25,0.25, 0.75,0.25, 0.75,0.75, 0.25,0.75, 0.25,0.25//A small square
                    ]
                    holes: [5]
                }
            ]
*/
// If the geometry type is 'line' it will generate the appropriate zero-sized, vertex-shader expanded triangle list with mitter joints.
// The geom will be an array of coordinates in this case
function decodeGeom(geomType, geom) {
    if (geomType == 'point') {
        return {
            geometry: geom,
            breakpointList: []
        };
    } else if (geomType == 'polygon') {
        let vertexArray = []; //Array of triangle vertices
        let breakpointList = []; // Array of indices (to vertexArray) that separate each feature
        geom.map(feature => {
            feature.map(polygon => {
                const triangles = __WEBPACK_IMPORTED_MODULE_0_earcut__(polygon.flat, polygon.holes);
                triangles.map(index => {
                    vertexArray.push(polygon.flat[2 * index]);
                    vertexArray.push(polygon.flat[2 * index + 1]);
                });
            });
            breakpointList.push(vertexArray.length);
        });
        return {
            geometry: new Float32Array(vertexArray),
            breakpointList
        };
    } else if (geomType == 'line') {
        let geometry = [];
        let normals = [];
        let breakpointList = []; // Array of indices (to vertexArray) that separate each feature
        geom.map(feature => {
            feature.map(line => {
                // Create triangulation
                for (let i = 0; i < line.length - 2; i += 2) {
                    const a = [line[i + 0], line[i + 1]];
                    const b = [line[i + 2], line[i + 3]];
                    if (i > 0) {
                        var prev = [line[i + -2], line[i + -1]];
                        var nprev = getLineNormal(a, prev);
                    }
                    if (i < line.length - 4) {
                        var next = [line[i + 4], line[i + 5]];
                        var nnext = getLineNormal(next, b);
                    }
                    let normal = getLineNormal(b, a);
                    let na = normal;
                    let nb = normal;
                    //TODO bug, cartesian interpolation is not correct, should use polar coordinates for the interpolation
                    if (prev) {
                        na = normalize([
                            normal[0] * 0.5 + nprev[0] * 0.5,
                            normal[1] * 0.5 + nprev[1] * 0.5,
                        ]);
                    }
                    if (next) {
                        nb = normalize([
                            normal[0] * 0.5 + nnext[0] * 0.5,
                            normal[1] * 0.5 + nnext[1] * 0.5,
                        ]);
                    }
                    normals.push(-na[0], -na[1]);
                    normals.push(na[0], na[1]);
                    normals.push(-nb[0], -nb[1]);

                    normals.push(na[0], na[1]);
                    normals.push(nb[0], nb[1]);
                    normals.push(-nb[0], -nb[1]);

                    normal = [0, 0];


                    //First triangle
                    geometry.push(a[0] - 0.01 * normal[0]);
                    geometry.push(a[1] - 0.01 * normal[1]);

                    geometry.push(a[0] + 0.01 * normal[0]);
                    geometry.push(a[1] + 0.01 * normal[1]);

                    geometry.push(b[0] - 0.01 * normal[0]);
                    geometry.push(b[1] - 0.01 * normal[1]);

                    //Second triangle
                    geometry.push(a[0] + 0.01 * normal[0]);
                    geometry.push(a[1] + 0.01 * normal[1]);

                    geometry.push(b[0] + 0.01 * normal[0]);
                    geometry.push(b[1] + 0.01 * normal[1]);

                    geometry.push(b[0] - 0.01 * normal[0]);
                    geometry.push(b[1] - 0.01 * normal[1]);
                }
            });
            breakpointList.push(geometry.length);
        });
        return {
            geometry: new Float32Array(geometry),
            breakpointList,
            normals: new Float32Array(normals)
        };
    } else {
        throw new Error(`Unimplemented geometry type: '${geomType}'`);
    }
}


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = earcut;
module.exports.default = earcut;

function earcut(data, holeIndices, dim) {

    dim = dim || 2;

    var hasHoles = holeIndices && holeIndices.length,
        outerLen = hasHoles ? holeIndices[0] * dim : data.length,
        outerNode = linkedList(data, 0, outerLen, dim, true),
        triangles = [];

    if (!outerNode) return triangles;

    var minX, minY, maxX, maxY, x, y, invSize;

    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);

    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
    if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];

        for (var i = dim; i < outerLen; i += dim) {
            x = data[i];
            y = data[i + 1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }

        // minX, minY and invSize are later used to transform coords into integers for z-order calculation
        invSize = Math.max(maxX - minX, maxY - minY);
        invSize = invSize !== 0 ? 1 / invSize : 0;
    }

    earcutLinked(outerNode, triangles, dim, minX, minY, invSize);

    return triangles;
}

// create a circular doubly linked list from polygon points in the specified winding order
function linkedList(data, start, end, dim, clockwise) {
    var i, last;

    if (clockwise === (signedArea(data, start, end, dim) > 0)) {
        for (i = start; i < end; i += dim) last = insertNode(i, data[i], data[i + 1], last);
    } else {
        for (i = end - dim; i >= start; i -= dim) last = insertNode(i, data[i], data[i + 1], last);
    }

    if (last && equals(last, last.next)) {
        removeNode(last);
        last = last.next;
    }

    return last;
}

// eliminate colinear or duplicate points
function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;

    var p = start,
        again;
    do {
        again = false;

        if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
            removeNode(p);
            p = end = p.prev;
            if (p === p.next) break;
            again = true;

        } else {
            p = p.next;
        }
    } while (again || p !== end);

    return end;
}

// main ear slicing loop which triangulates a polygon (given as a linked list)
function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
    if (!ear) return;

    // interlink polygon nodes in z-order
    if (!pass && invSize) indexCurve(ear, minX, minY, invSize);

    var stop = ear,
        prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;

        if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
            // cut off the triangle
            triangles.push(prev.i / dim);
            triangles.push(ear.i / dim);
            triangles.push(next.i / dim);

            removeNode(ear);

            // skipping the next vertice leads to less sliver triangles
            ear = next.next;
            stop = next.next;

            continue;
        }

        ear = next;

        // if we looped through the whole remaining polygon and can't find any more ears
        if (ear === stop) {
            // try filtering points and slicing again
            if (!pass) {
                earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);

            // if this didn't work, try curing all small self-intersections locally
            } else if (pass === 1) {
                ear = cureLocalIntersections(ear, triangles, dim);
                earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);

            // as a last resort, try splitting the remaining polygon into two
            } else if (pass === 2) {
                splitEarcut(ear, triangles, dim, minX, minY, invSize);
            }

            break;
        }
    }
}

// check whether a polygon node forms a valid ear with adjacent nodes
function isEar(ear) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear
    var p = ear.next.next;

    while (p !== ear.prev) {
        if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.next;
    }

    return true;
}

function isEarHashed(ear, minX, minY, invSize) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // triangle bbox; min & max are calculated like this for speed
    var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x),
        minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y),
        maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x),
        maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);

    // z-order range for the current triangle bbox;
    var minZ = zOrder(minTX, minTY, minX, minY, invSize),
        maxZ = zOrder(maxTX, maxTY, minX, minY, invSize);

    var p = ear.prevZ,
        n = ear.nextZ;

    // look for points inside the triangle in both directions
    while (p && p.z >= minZ && n && n.z <= maxZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;

        if (n !== ear.prev && n !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
            area(n.prev, n, n.next) >= 0) return false;
        n = n.nextZ;
    }

    // look for remaining points in decreasing z-order
    while (p && p.z >= minZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;
    }

    // look for remaining points in increasing z-order
    while (n && n.z <= maxZ) {
        if (n !== ear.prev && n !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
            area(n.prev, n, n.next) >= 0) return false;
        n = n.nextZ;
    }

    return true;
}

// go through all polygon nodes and cure small local self-intersections
function cureLocalIntersections(start, triangles, dim) {
    var p = start;
    do {
        var a = p.prev,
            b = p.next.next;

        if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {

            triangles.push(a.i / dim);
            triangles.push(p.i / dim);
            triangles.push(b.i / dim);

            // remove two nodes involved
            removeNode(p);
            removeNode(p.next);

            p = start = b;
        }
        p = p.next;
    } while (p !== start);

    return p;
}

// try splitting polygon into two and triangulate them independently
function splitEarcut(start, triangles, dim, minX, minY, invSize) {
    // look for a valid diagonal that divides the polygon into two
    var a = start;
    do {
        var b = a.next.next;
        while (b !== a.prev) {
            if (a.i !== b.i && isValidDiagonal(a, b)) {
                // split the polygon in two by the diagonal
                var c = splitPolygon(a, b);

                // filter colinear points around the cuts
                a = filterPoints(a, a.next);
                c = filterPoints(c, c.next);

                // run earcut on each half
                earcutLinked(a, triangles, dim, minX, minY, invSize);
                earcutLinked(c, triangles, dim, minX, minY, invSize);
                return;
            }
            b = b.next;
        }
        a = a.next;
    } while (a !== start);
}

// link every hole into the outer loop, producing a single-ring polygon without holes
function eliminateHoles(data, holeIndices, outerNode, dim) {
    var queue = [],
        i, len, start, end, list;

    for (i = 0, len = holeIndices.length; i < len; i++) {
        start = holeIndices[i] * dim;
        end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        list = linkedList(data, start, end, dim, false);
        if (list === list.next) list.steiner = true;
        queue.push(getLeftmost(list));
    }

    queue.sort(compareX);

    // process holes from left to right
    for (i = 0; i < queue.length; i++) {
        eliminateHole(queue[i], outerNode);
        outerNode = filterPoints(outerNode, outerNode.next);
    }

    return outerNode;
}

function compareX(a, b) {
    return a.x - b.x;
}

// find a bridge between vertices that connects hole with an outer ring and and link it
function eliminateHole(hole, outerNode) {
    outerNode = findHoleBridge(hole, outerNode);
    if (outerNode) {
        var b = splitPolygon(outerNode, hole);
        filterPoints(b, b.next);
    }
}

// David Eberly's algorithm for finding a bridge between hole and outer polygon
function findHoleBridge(hole, outerNode) {
    var p = outerNode,
        hx = hole.x,
        hy = hole.y,
        qx = -Infinity,
        m;

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
        if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
            var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
            if (x <= hx && x > qx) {
                qx = x;
                if (x === hx) {
                    if (hy === p.y) return p;
                    if (hy === p.next.y) return p.next;
                }
                m = p.x < p.next.x ? p : p.next;
            }
        }
        p = p.next;
    } while (p !== outerNode);

    if (!m) return null;

    if (hx === qx) return m.prev; // hole touches outer segment; pick lower endpoint

    // look for points inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var stop = m,
        mx = m.x,
        my = m.y,
        tanMin = Infinity,
        tan;

    p = m.next;

    while (p !== stop) {
        if (hx >= p.x && p.x >= mx && hx !== p.x &&
                pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {

            tan = Math.abs(hy - p.y) / (hx - p.x); // tangential

            if ((tan < tanMin || (tan === tanMin && p.x > m.x)) && locallyInside(p, hole)) {
                m = p;
                tanMin = tan;
            }
        }

        p = p.next;
    }

    return m;
}

// interlink polygon nodes in z-order
function indexCurve(start, minX, minY, invSize) {
    var p = start;
    do {
        if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, invSize);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
    } while (p !== start);

    p.prevZ.nextZ = null;
    p.prevZ = null;

    sortLinked(p);
}

// Simon Tatham's linked list merge sort algorithm
// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
function sortLinked(list) {
    var i, p, q, e, tail, numMerges, pSize, qSize,
        inSize = 1;

    do {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;

        while (p) {
            numMerges++;
            q = p;
            pSize = 0;
            for (i = 0; i < inSize; i++) {
                pSize++;
                q = q.nextZ;
                if (!q) break;
            }
            qSize = inSize;

            while (pSize > 0 || (qSize > 0 && q)) {

                if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                }

                if (tail) tail.nextZ = e;
                else list = e;

                e.prevZ = tail;
                tail = e;
            }

            p = q;
        }

        tail.nextZ = null;
        inSize *= 2;

    } while (numMerges > 1);

    return list;
}

// z-order of a point given coords and inverse of the longer side of data bbox
function zOrder(x, y, minX, minY, invSize) {
    // coords are transformed into non-negative 15-bit integer range
    x = 32767 * (x - minX) * invSize;
    y = 32767 * (y - minY) * invSize;

    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;

    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;

    return x | (y << 1);
}

// find the leftmost node of a polygon ring
function getLeftmost(start) {
    var p = start,
        leftmost = start;
    do {
        if (p.x < leftmost.x) leftmost = p;
        p = p.next;
    } while (p !== start);

    return leftmost;
}

// check if a point lies within a convex triangle
function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
           (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
           (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
}

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
function isValidDiagonal(a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) &&
           locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b);
}

// signed area of a triangle
function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

// check if two points are equal
function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

// check if two segments intersect
function intersects(p1, q1, p2, q2) {
    if ((equals(p1, q1) && equals(p2, q2)) ||
        (equals(p1, q2) && equals(p2, q1))) return true;
    return area(p1, q1, p2) > 0 !== area(p1, q1, q2) > 0 &&
           area(p2, q2, p1) > 0 !== area(p2, q2, q1) > 0;
}

// check if a polygon diagonal intersects any polygon segments
function intersectsPolygon(a, b) {
    var p = a;
    do {
        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
                intersects(p, p.next, a, b)) return true;
        p = p.next;
    } while (p !== a);

    return false;
}

// check if a polygon diagonal is locally inside the polygon
function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0 ?
        area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 :
        area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
}

// check if the middle point of a polygon diagonal is inside the polygon
function middleInside(a, b) {
    var p = a,
        inside = false,
        px = (a.x + b.x) / 2,
        py = (a.y + b.y) / 2;
    do {
        if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y &&
                (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
            inside = !inside;
        p = p.next;
    } while (p !== a);

    return inside;
}

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring
function splitPolygon(a, b) {
    var a2 = new Node(a.i, a.x, a.y),
        b2 = new Node(b.i, b.x, b.y),
        an = a.next,
        bp = b.prev;

    a.next = b;
    b.prev = a;

    a2.next = an;
    an.prev = a2;

    b2.next = a2;
    a2.prev = b2;

    bp.next = b2;
    b2.prev = bp;

    return b2;
}

// create a node and optionally link it with previous one (in a circular doubly linked list)
function insertNode(i, x, y, last) {
    var p = new Node(i, x, y);

    if (!last) {
        p.prev = p;
        p.next = p;

    } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
    }
    return p;
}

function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;

    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
}

function Node(i, x, y) {
    // vertice index in coordinates array
    this.i = i;

    // vertex coordinates
    this.x = x;
    this.y = y;

    // previous and next vertice nodes in a polygon ring
    this.prev = null;
    this.next = null;

    // z-order curve value
    this.z = null;

    // previous and next nodes in z-order
    this.prevZ = null;
    this.nextZ = null;

    // indicates whether this is a steiner point
    this.steiner = false;
}

// return a percentage difference between the polygon area and its triangulation area;
// used to verify correctness of triangulation
earcut.deviation = function (data, holeIndices, dim, triangles) {
    var hasHoles = holeIndices && holeIndices.length;
    var outerLen = hasHoles ? holeIndices[0] * dim : data.length;

    var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
    if (hasHoles) {
        for (var i = 0, len = holeIndices.length; i < len; i++) {
            var start = holeIndices[i] * dim;
            var end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
            polygonArea -= Math.abs(signedArea(data, start, end, dim));
        }
    }

    var trianglesArea = 0;
    for (i = 0; i < triangles.length; i += 3) {
        var a = triangles[i] * dim;
        var b = triangles[i + 1] * dim;
        var c = triangles[i + 2] * dim;
        trianglesArea += Math.abs(
            (data[a] - data[c]) * (data[b + 1] - data[a + 1]) -
            (data[a] - data[b]) * (data[c + 1] - data[a + 1]));
    }

    return polygonArea === 0 && trianglesArea === 0 ? 0 :
        Math.abs((trianglesArea - polygonArea) / polygonArea);
};

function signedArea(data, start, end, dim) {
    var sum = 0;
    for (var i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
    }
    return sum;
}

// turn a polygon in a multi-dimensional array form (e.g. as in GeoJSON) into a form Earcut accepts
earcut.flatten = function (data) {
    var dim = data[0][0].length,
        result = {vertices: [], holes: [], dimensions: dim},
        holeIndex = 0;

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            for (var d = 0; d < dim; d++) result.vertices.push(data[i][j][d]);
        }
        if (i > 0) {
            holeIndex += data[i - 1].length;
            result.holes.push(holeIndex);
        }
    }
    return result;
};


/***/ }),
/* 60 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return rTiles; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return getRsysFromTile; });
/**
 * An RSys defines a local coordinate system that maps the coordinates
 * in the range -1 <= x <= +1; -1 <= y <= +1 to an arbitrary rectangle
 * in an external coordinate system. (e.g. Dataframe coordinates to World coordinates)
 * It is the combination of a translation and anisotropic scaling.
 * @typedef {object} RSys - Renderer relative coordinate system
 * @property {RPoint} center - Position of the local system in external coordinates
 * @property {number} scale - Y-scale (local Y-distance / external Y-distance)
*/

/*
 * Random notes
 *
 * We can redefine Dataframe to use a Rsys instead of center, scale
 * and we can use an Rsys for the Renderer's canvas.
 *
 * Some interesting World coordinate systems:
 *
 * WM (Webmercator): represents a part of the world (excluding polar regions)
 * with coordinates in the range +/-WM_R for both X and Y. (positive orientation: E,N)
 *
 * NWMC (Normalized Webmercator Coordinates): represents the Webmercator *square*
 * with coordinates in the range +/-1. Results from dividing Webmercator coordinates
 * by WM_R. (positive orientation: E,N)
 *
 * TC (Tile coordinates): integers in [0, 2^Z) for zoom level Z. Example: the tile 0/0/0 (zoom, x, y) is the root tile.
 * (positive orientation: E,S)
 *
 * An RSys's rectangle (its bounds) is the area covered by the local coordinates in
 * the range +/-1.
 *
 * When an RSys external coordinate system is WM or NWMC, we can compute:
 * * Minimum zoom level for which tiles are no larger than the RSys rectangle:
 *   Math.ceil(Math.log2(1 / r.scale));
 * * Maximum zoom level for which tiles are no smaller than the rectangle:
 *   Math.floor(Math.log2(1 / r.scale));
 * (note that 1 / r.scale is the fraction of the World height that the local rectangle's height represents)
 *
 * We'll use the term World coordinates below for the *external* reference system
 * of an RSys (usually NWMC).
 */

/*eslint no-unused-vars: ["off"] */

/**
 * R coordinates to World
 * @param {RSys} r - ref. of the passed coordinates
 * @param {number} x - x coordinate in r
 * @param {number} y - y coordinate in r
 * @return {RPoint} World coordinates
 */
function rToW(r, x, y) {
    return { x: x * r.scale + r.center.x, y: y * r.scale + r.center.y };
}

/**
 * World coordinates to local RSys
 * @param {number} x - x W-coordinate
 * @param {number} y - y W-coordinate
 * @param {RSys} r - target ref. system
 * @return {RPoint} R coordinates
 */
function wToR(x, y, r) {
    return { x: (x - r.center.x) / r.scale, y: (y - r.center.y) / r.scale };
}

/**
 * RSys of a tile (mapping local tile coordinates in +/-1 to NWMC)
 * @param {number} x - TC x coordinate
 * @param {number} y - TC y coordinate
 * @param {number} z - Tile zoom level
 * @return {RSys}
 */
function tileRsys(x, y, z) {
    let max = Math.pow(2, z);
    return { scale: 1 / max, center: { x: 2 * (x + 0.5) / max - 1, y: 1 - 2 * (y + 0.5) / max } };
}

/**
 * Minimum zoom level for which tiles are no larger than the RSys rectangle
 * @param {RSys} rsys
 * @return {number}
 */
function rZoom(zoom) {
    return Math.ceil(Math.log2(1. / zoom));
}

/**
 * TC tiles that intersect the local rectangle of an RSys
 * (with the largest tile size no larger than the rectangle)
 * @param {RSys} rsys
 * @return {Array} - array of TC tiles {x, y, z}
 */
function rTiles(bounds) {
    return wRectangleTiles(rZoom((bounds[3] - bounds[1]) / 2.), bounds);
}

/**
 * TC tiles of a given zoom level that intersect a W rectangle
 * @param {number} z
 * @param {Array} - rectangle extents [minx, miny, maxx, maxy]
 * @return {Array} - array of TC tiles {x, y, z}
 */
function wRectangleTiles(z, wr) {
    const [w_minx, w_miny, w_maxx, w_maxy] = wr;
    const n = (1 << z); // for 0 <= z <= 30 equals Math.pow(2, z)

    const clamp = x => Math.min(Math.max(x, 0), n - 1);
    // compute tile coordinate ranges
    const t_minx = clamp(Math.floor(n * (w_minx + 1) * 0.5));
    const t_maxx = clamp(Math.ceil(n * (w_maxx + 1) * 0.5) - 1);
    const t_miny = clamp(Math.floor(n * (1 - w_maxy) * 0.5));
    const t_maxy = clamp(Math.ceil(n * (1 - w_miny) * 0.5) - 1);
    let tiles = [];
    for (let x = t_minx; x <= t_maxx; ++x) {
        for (let y = t_miny; y <= t_maxy; ++y) {
            tiles.push({ x: x, y: y, z: z });
        }
    }
    return tiles;
}

/**
 * Get the Rsys of a tile where the Rsys's center is the tile center and the Rsys's scale is the tile extent.
 * @param {*} x
 * @param {*} y
 * @param {*} z
 * @returns {RSys}
 */
function getRsysFromTile(x, y, z) {
    return {
        center: {
            x: ((x + 0.5) / Math.pow(2, z)) * 2. - 1,
            y: (1. - (y + 0.5) / Math.pow(2, z)) * 2. - 1.
        },
        scale: 1 / Math.pow(2, z)
    };
}




/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = Pbf;

var ieee754 = __webpack_require__(62);

function Pbf(buf) {
    this.buf = ArrayBuffer.isView && ArrayBuffer.isView(buf) ? buf : new Uint8Array(buf || 0);
    this.pos = 0;
    this.type = 0;
    this.length = this.buf.length;
}

Pbf.Varint  = 0; // varint: int32, int64, uint32, uint64, sint32, sint64, bool, enum
Pbf.Fixed64 = 1; // 64-bit: double, fixed64, sfixed64
Pbf.Bytes   = 2; // length-delimited: string, bytes, embedded messages, packed repeated fields
Pbf.Fixed32 = 5; // 32-bit: float, fixed32, sfixed32

var SHIFT_LEFT_32 = (1 << 16) * (1 << 16),
    SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;

Pbf.prototype = {

    destroy: function() {
        this.buf = null;
    },

    // === READING =================================================================

    readFields: function(readField, result, end) {
        end = end || this.length;

        while (this.pos < end) {
            var val = this.readVarint(),
                tag = val >> 3,
                startPos = this.pos;

            this.type = val & 0x7;
            readField(tag, result, this);

            if (this.pos === startPos) this.skip(val);
        }
        return result;
    },

    readMessage: function(readField, result) {
        return this.readFields(readField, result, this.readVarint() + this.pos);
    },

    readFixed32: function() {
        var val = readUInt32(this.buf, this.pos);
        this.pos += 4;
        return val;
    },

    readSFixed32: function() {
        var val = readInt32(this.buf, this.pos);
        this.pos += 4;
        return val;
    },

    // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)

    readFixed64: function() {
        var val = readUInt32(this.buf, this.pos) + readUInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
        this.pos += 8;
        return val;
    },

    readSFixed64: function() {
        var val = readUInt32(this.buf, this.pos) + readInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
        this.pos += 8;
        return val;
    },

    readFloat: function() {
        var val = ieee754.read(this.buf, this.pos, true, 23, 4);
        this.pos += 4;
        return val;
    },

    readDouble: function() {
        var val = ieee754.read(this.buf, this.pos, true, 52, 8);
        this.pos += 8;
        return val;
    },

    readVarint: function(isSigned) {
        var buf = this.buf,
            val, b;

        b = buf[this.pos++]; val  =  b & 0x7f;        if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 7;  if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 14; if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 21; if (b < 0x80) return val;
        b = buf[this.pos];   val |= (b & 0x0f) << 28;

        return readVarintRemainder(val, isSigned, this);
    },

    readVarint64: function() { // for compatibility with v2.0.1
        return this.readVarint(true);
    },

    readSVarint: function() {
        var num = this.readVarint();
        return num % 2 === 1 ? (num + 1) / -2 : num / 2; // zigzag encoding
    },

    readBoolean: function() {
        return Boolean(this.readVarint());
    },

    readString: function() {
        var end = this.readVarint() + this.pos,
            str = readUtf8(this.buf, this.pos, end);
        this.pos = end;
        return str;
    },

    readBytes: function() {
        var end = this.readVarint() + this.pos,
            buffer = this.buf.subarray(this.pos, end);
        this.pos = end;
        return buffer;
    },

    // verbose for performance reasons; doesn't affect gzipped size

    readPackedVarint: function(arr, isSigned) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readVarint(isSigned));
        return arr;
    },
    readPackedSVarint: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readSVarint());
        return arr;
    },
    readPackedBoolean: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readBoolean());
        return arr;
    },
    readPackedFloat: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readFloat());
        return arr;
    },
    readPackedDouble: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readDouble());
        return arr;
    },
    readPackedFixed32: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readFixed32());
        return arr;
    },
    readPackedSFixed32: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readSFixed32());
        return arr;
    },
    readPackedFixed64: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readFixed64());
        return arr;
    },
    readPackedSFixed64: function(arr) {
        var end = readPackedEnd(this);
        arr = arr || [];
        while (this.pos < end) arr.push(this.readSFixed64());
        return arr;
    },

    skip: function(val) {
        var type = val & 0x7;
        if (type === Pbf.Varint) while (this.buf[this.pos++] > 0x7f) {}
        else if (type === Pbf.Bytes) this.pos = this.readVarint() + this.pos;
        else if (type === Pbf.Fixed32) this.pos += 4;
        else if (type === Pbf.Fixed64) this.pos += 8;
        else throw new Error('Unimplemented type: ' + type);
    },

    // === WRITING =================================================================

    writeTag: function(tag, type) {
        this.writeVarint((tag << 3) | type);
    },

    realloc: function(min) {
        var length = this.length || 16;

        while (length < this.pos + min) length *= 2;

        if (length !== this.length) {
            var buf = new Uint8Array(length);
            buf.set(this.buf);
            this.buf = buf;
            this.length = length;
        }
    },

    finish: function() {
        this.length = this.pos;
        this.pos = 0;
        return this.buf.subarray(0, this.length);
    },

    writeFixed32: function(val) {
        this.realloc(4);
        writeInt32(this.buf, val, this.pos);
        this.pos += 4;
    },

    writeSFixed32: function(val) {
        this.realloc(4);
        writeInt32(this.buf, val, this.pos);
        this.pos += 4;
    },

    writeFixed64: function(val) {
        this.realloc(8);
        writeInt32(this.buf, val & -1, this.pos);
        writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
        this.pos += 8;
    },

    writeSFixed64: function(val) {
        this.realloc(8);
        writeInt32(this.buf, val & -1, this.pos);
        writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
        this.pos += 8;
    },

    writeVarint: function(val) {
        val = +val || 0;

        if (val > 0xfffffff || val < 0) {
            writeBigVarint(val, this);
            return;
        }

        this.realloc(4);

        this.buf[this.pos++] =           val & 0x7f  | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] =   (val >>> 7) & 0x7f;
    },

    writeSVarint: function(val) {
        this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
    },

    writeBoolean: function(val) {
        this.writeVarint(Boolean(val));
    },

    writeString: function(str) {
        str = String(str);
        this.realloc(str.length * 4);

        this.pos++; // reserve 1 byte for short string length

        var startPos = this.pos;
        // write the string directly to the buffer and see how much was written
        this.pos = writeUtf8(this.buf, str, this.pos);
        var len = this.pos - startPos;

        if (len >= 0x80) makeRoomForExtraLength(startPos, len, this);

        // finally, write the message length in the reserved place and restore the position
        this.pos = startPos - 1;
        this.writeVarint(len);
        this.pos += len;
    },

    writeFloat: function(val) {
        this.realloc(4);
        ieee754.write(this.buf, val, this.pos, true, 23, 4);
        this.pos += 4;
    },

    writeDouble: function(val) {
        this.realloc(8);
        ieee754.write(this.buf, val, this.pos, true, 52, 8);
        this.pos += 8;
    },

    writeBytes: function(buffer) {
        var len = buffer.length;
        this.writeVarint(len);
        this.realloc(len);
        for (var i = 0; i < len; i++) this.buf[this.pos++] = buffer[i];
    },

    writeRawMessage: function(fn, obj) {
        this.pos++; // reserve 1 byte for short message length

        // write the message directly to the buffer and see how much was written
        var startPos = this.pos;
        fn(obj, this);
        var len = this.pos - startPos;

        if (len >= 0x80) makeRoomForExtraLength(startPos, len, this);

        // finally, write the message length in the reserved place and restore the position
        this.pos = startPos - 1;
        this.writeVarint(len);
        this.pos += len;
    },

    writeMessage: function(tag, fn, obj) {
        this.writeTag(tag, Pbf.Bytes);
        this.writeRawMessage(fn, obj);
    },

    writePackedVarint:   function(tag, arr) { this.writeMessage(tag, writePackedVarint, arr);   },
    writePackedSVarint:  function(tag, arr) { this.writeMessage(tag, writePackedSVarint, arr);  },
    writePackedBoolean:  function(tag, arr) { this.writeMessage(tag, writePackedBoolean, arr);  },
    writePackedFloat:    function(tag, arr) { this.writeMessage(tag, writePackedFloat, arr);    },
    writePackedDouble:   function(tag, arr) { this.writeMessage(tag, writePackedDouble, arr);   },
    writePackedFixed32:  function(tag, arr) { this.writeMessage(tag, writePackedFixed32, arr);  },
    writePackedSFixed32: function(tag, arr) { this.writeMessage(tag, writePackedSFixed32, arr); },
    writePackedFixed64:  function(tag, arr) { this.writeMessage(tag, writePackedFixed64, arr);  },
    writePackedSFixed64: function(tag, arr) { this.writeMessage(tag, writePackedSFixed64, arr); },

    writeBytesField: function(tag, buffer) {
        this.writeTag(tag, Pbf.Bytes);
        this.writeBytes(buffer);
    },
    writeFixed32Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed32);
        this.writeFixed32(val);
    },
    writeSFixed32Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed32);
        this.writeSFixed32(val);
    },
    writeFixed64Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed64);
        this.writeFixed64(val);
    },
    writeSFixed64Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed64);
        this.writeSFixed64(val);
    },
    writeVarintField: function(tag, val) {
        this.writeTag(tag, Pbf.Varint);
        this.writeVarint(val);
    },
    writeSVarintField: function(tag, val) {
        this.writeTag(tag, Pbf.Varint);
        this.writeSVarint(val);
    },
    writeStringField: function(tag, str) {
        this.writeTag(tag, Pbf.Bytes);
        this.writeString(str);
    },
    writeFloatField: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed32);
        this.writeFloat(val);
    },
    writeDoubleField: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed64);
        this.writeDouble(val);
    },
    writeBooleanField: function(tag, val) {
        this.writeVarintField(tag, Boolean(val));
    }
};

function readVarintRemainder(l, s, p) {
    var buf = p.buf,
        h, b;

    b = buf[p.pos++]; h  = (b & 0x70) >> 4;  if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 3;  if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 10; if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 17; if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x7f) << 24; if (b < 0x80) return toNum(l, h, s);
    b = buf[p.pos++]; h |= (b & 0x01) << 31; if (b < 0x80) return toNum(l, h, s);

    throw new Error('Expected varint not more than 10 bytes');
}

function readPackedEnd(pbf) {
    return pbf.type === Pbf.Bytes ?
        pbf.readVarint() + pbf.pos : pbf.pos + 1;
}

function toNum(low, high, isSigned) {
    if (isSigned) {
        return high * 0x100000000 + (low >>> 0);
    }

    return ((high >>> 0) * 0x100000000) + (low >>> 0);
}

function writeBigVarint(val, pbf) {
    var low, high;

    if (val >= 0) {
        low  = (val % 0x100000000) | 0;
        high = (val / 0x100000000) | 0;
    } else {
        low  = ~(-val % 0x100000000);
        high = ~(-val / 0x100000000);

        if (low ^ 0xffffffff) {
            low = (low + 1) | 0;
        } else {
            low = 0;
            high = (high + 1) | 0;
        }
    }

    if (val >= 0x10000000000000000 || val < -0x10000000000000000) {
        throw new Error('Given varint doesn\'t fit into 10 bytes');
    }

    pbf.realloc(10);

    writeBigVarintLow(low, high, pbf);
    writeBigVarintHigh(high, pbf);
}

function writeBigVarintLow(low, high, pbf) {
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
    pbf.buf[pbf.pos]   = low & 0x7f;
}

function writeBigVarintHigh(high, pbf) {
    var lsb = (high & 0x07) << 4;

    pbf.buf[pbf.pos++] |= lsb         | ((high >>>= 3) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
    pbf.buf[pbf.pos++]  = high & 0x7f;
}

function makeRoomForExtraLength(startPos, len, pbf) {
    var extraLen =
        len <= 0x3fff ? 1 :
        len <= 0x1fffff ? 2 :
        len <= 0xfffffff ? 3 : Math.ceil(Math.log(len) / (Math.LN2 * 7));

    // if 1 byte isn't enough for encoding message length, shift the data to the right
    pbf.realloc(extraLen);
    for (var i = pbf.pos - 1; i >= startPos; i--) pbf.buf[i + extraLen] = pbf.buf[i];
}

function writePackedVarint(arr, pbf)   { for (var i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);   }
function writePackedSVarint(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);  }
function writePackedFloat(arr, pbf)    { for (var i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);    }
function writePackedDouble(arr, pbf)   { for (var i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);   }
function writePackedBoolean(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);  }
function writePackedFixed32(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);  }
function writePackedSFixed32(arr, pbf) { for (var i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]); }
function writePackedFixed64(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);  }
function writePackedSFixed64(arr, pbf) { for (var i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]); }

// Buffer code below from https://github.com/feross/buffer, MIT-licensed

function readUInt32(buf, pos) {
    return ((buf[pos]) |
        (buf[pos + 1] << 8) |
        (buf[pos + 2] << 16)) +
        (buf[pos + 3] * 0x1000000);
}

function writeInt32(buf, val, pos) {
    buf[pos] = val;
    buf[pos + 1] = (val >>> 8);
    buf[pos + 2] = (val >>> 16);
    buf[pos + 3] = (val >>> 24);
}

function readInt32(buf, pos) {
    return ((buf[pos]) |
        (buf[pos + 1] << 8) |
        (buf[pos + 2] << 16)) +
        (buf[pos + 3] << 24);
}

function readUtf8(buf, pos, end) {
    var str = '';
    var i = pos;

    while (i < end) {
        var b0 = buf[i];
        var c = null; // codepoint
        var bytesPerSequence =
            b0 > 0xEF ? 4 :
            b0 > 0xDF ? 3 :
            b0 > 0xBF ? 2 : 1;

        if (i + bytesPerSequence > end) break;

        var b1, b2, b3;

        if (bytesPerSequence === 1) {
            if (b0 < 0x80) {
                c = b0;
            }
        } else if (bytesPerSequence === 2) {
            b1 = buf[i + 1];
            if ((b1 & 0xC0) === 0x80) {
                c = (b0 & 0x1F) << 0x6 | (b1 & 0x3F);
                if (c <= 0x7F) {
                    c = null;
                }
            }
        } else if (bytesPerSequence === 3) {
            b1 = buf[i + 1];
            b2 = buf[i + 2];
            if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80) {
                c = (b0 & 0xF) << 0xC | (b1 & 0x3F) << 0x6 | (b2 & 0x3F);
                if (c <= 0x7FF || (c >= 0xD800 && c <= 0xDFFF)) {
                    c = null;
                }
            }
        } else if (bytesPerSequence === 4) {
            b1 = buf[i + 1];
            b2 = buf[i + 2];
            b3 = buf[i + 3];
            if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
                c = (b0 & 0xF) << 0x12 | (b1 & 0x3F) << 0xC | (b2 & 0x3F) << 0x6 | (b3 & 0x3F);
                if (c <= 0xFFFF || c >= 0x110000) {
                    c = null;
                }
            }
        }

        if (c === null) {
            c = 0xFFFD;
            bytesPerSequence = 1;

        } else if (c > 0xFFFF) {
            c -= 0x10000;
            str += String.fromCharCode(c >>> 10 & 0x3FF | 0xD800);
            c = 0xDC00 | c & 0x3FF;
        }

        str += String.fromCharCode(c);
        i += bytesPerSequence;
    }

    return str;
}

function writeUtf8(buf, str, pos) {
    for (var i = 0, c, lead; i < str.length; i++) {
        c = str.charCodeAt(i); // code point

        if (c > 0xD7FF && c < 0xE000) {
            if (lead) {
                if (c < 0xDC00) {
                    buf[pos++] = 0xEF;
                    buf[pos++] = 0xBF;
                    buf[pos++] = 0xBD;
                    lead = c;
                    continue;
                } else {
                    c = lead - 0xD800 << 10 | c - 0xDC00 | 0x10000;
                    lead = null;
                }
            } else {
                if (c > 0xDBFF || (i + 1 === str.length)) {
                    buf[pos++] = 0xEF;
                    buf[pos++] = 0xBF;
                    buf[pos++] = 0xBD;
                } else {
                    lead = c;
                }
                continue;
            }
        } else if (lead) {
            buf[pos++] = 0xEF;
            buf[pos++] = 0xBF;
            buf[pos++] = 0xBD;
            lead = null;
        }

        if (c < 0x80) {
            buf[pos++] = c;
        } else {
            if (c < 0x800) {
                buf[pos++] = c >> 0x6 | 0xC0;
            } else {
                if (c < 0x10000) {
                    buf[pos++] = c >> 0xC | 0xE0;
                } else {
                    buf[pos++] = c >> 0x12 | 0xF0;
                    buf[pos++] = c >> 0xC & 0x3F | 0x80;
                }
                buf[pos++] = c >> 0x6 & 0x3F | 0x80;
            }
            buf[pos++] = c & 0x3F | 0x80;
        }
    }
    return pos;
}


/***/ }),
/* 62 */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = LRUCache

// This will be a proper iterable 'Map' in engines that support it,
// or a fakey-fake PseudoMap in older versions.
var Map = __webpack_require__(64)
var util = __webpack_require__(66)

// A linked list to keep track of recently-used-ness
var Yallist = __webpack_require__(70)

// use symbols if possible, otherwise just _props
var hasSymbol = typeof Symbol === 'function'
var makeSymbol
if (hasSymbol) {
  makeSymbol = function (key) {
    return Symbol.for(key)
  }
} else {
  makeSymbol = function (key) {
    return '_' + key
  }
}

var MAX = makeSymbol('max')
var LENGTH = makeSymbol('length')
var LENGTH_CALCULATOR = makeSymbol('lengthCalculator')
var ALLOW_STALE = makeSymbol('allowStale')
var MAX_AGE = makeSymbol('maxAge')
var DISPOSE = makeSymbol('dispose')
var NO_DISPOSE_ON_SET = makeSymbol('noDisposeOnSet')
var LRU_LIST = makeSymbol('lruList')
var CACHE = makeSymbol('cache')

function naiveLength () { return 1 }

// lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map (or PseudoMap) that matches the keys to
// the Yallist.Node object.
function LRUCache (options) {
  if (!(this instanceof LRUCache)) {
    return new LRUCache(options)
  }

  if (typeof options === 'number') {
    options = { max: options }
  }

  if (!options) {
    options = {}
  }

  var max = this[MAX] = options.max
  // Kind of weird to have a default max of Infinity, but oh well.
  if (!max ||
      !(typeof max === 'number') ||
      max <= 0) {
    this[MAX] = Infinity
  }

  var lc = options.length || naiveLength
  if (typeof lc !== 'function') {
    lc = naiveLength
  }
  this[LENGTH_CALCULATOR] = lc

  this[ALLOW_STALE] = options.stale || false
  this[MAX_AGE] = options.maxAge || 0
  this[DISPOSE] = options.dispose
  this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false
  this.reset()
}

// resize the cache when the max changes.
Object.defineProperty(LRUCache.prototype, 'max', {
  set: function (mL) {
    if (!mL || !(typeof mL === 'number') || mL <= 0) {
      mL = Infinity
    }
    this[MAX] = mL
    trim(this)
  },
  get: function () {
    return this[MAX]
  },
  enumerable: true
})

Object.defineProperty(LRUCache.prototype, 'allowStale', {
  set: function (allowStale) {
    this[ALLOW_STALE] = !!allowStale
  },
  get: function () {
    return this[ALLOW_STALE]
  },
  enumerable: true
})

Object.defineProperty(LRUCache.prototype, 'maxAge', {
  set: function (mA) {
    if (!mA || !(typeof mA === 'number') || mA < 0) {
      mA = 0
    }
    this[MAX_AGE] = mA
    trim(this)
  },
  get: function () {
    return this[MAX_AGE]
  },
  enumerable: true
})

// resize the cache when the lengthCalculator changes.
Object.defineProperty(LRUCache.prototype, 'lengthCalculator', {
  set: function (lC) {
    if (typeof lC !== 'function') {
      lC = naiveLength
    }
    if (lC !== this[LENGTH_CALCULATOR]) {
      this[LENGTH_CALCULATOR] = lC
      this[LENGTH] = 0
      this[LRU_LIST].forEach(function (hit) {
        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key)
        this[LENGTH] += hit.length
      }, this)
    }
    trim(this)
  },
  get: function () { return this[LENGTH_CALCULATOR] },
  enumerable: true
})

Object.defineProperty(LRUCache.prototype, 'length', {
  get: function () { return this[LENGTH] },
  enumerable: true
})

Object.defineProperty(LRUCache.prototype, 'itemCount', {
  get: function () { return this[LRU_LIST].length },
  enumerable: true
})

LRUCache.prototype.rforEach = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this[LRU_LIST].tail; walker !== null;) {
    var prev = walker.prev
    forEachStep(this, fn, walker, thisp)
    walker = prev
  }
}

function forEachStep (self, fn, node, thisp) {
  var hit = node.value
  if (isStale(self, hit)) {
    del(self, node)
    if (!self[ALLOW_STALE]) {
      hit = undefined
    }
  }
  if (hit) {
    fn.call(thisp, hit.value, hit.key, self)
  }
}

LRUCache.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this[LRU_LIST].head; walker !== null;) {
    var next = walker.next
    forEachStep(this, fn, walker, thisp)
    walker = next
  }
}

LRUCache.prototype.keys = function () {
  return this[LRU_LIST].toArray().map(function (k) {
    return k.key
  }, this)
}

LRUCache.prototype.values = function () {
  return this[LRU_LIST].toArray().map(function (k) {
    return k.value
  }, this)
}

LRUCache.prototype.reset = function () {
  if (this[DISPOSE] &&
      this[LRU_LIST] &&
      this[LRU_LIST].length) {
    this[LRU_LIST].forEach(function (hit) {
      this[DISPOSE](hit.key, hit.value)
    }, this)
  }

  this[CACHE] = new Map() // hash of items by key
  this[LRU_LIST] = new Yallist() // list of items in order of use recency
  this[LENGTH] = 0 // length of items in the list
}

LRUCache.prototype.dump = function () {
  return this[LRU_LIST].map(function (hit) {
    if (!isStale(this, hit)) {
      return {
        k: hit.key,
        v: hit.value,
        e: hit.now + (hit.maxAge || 0)
      }
    }
  }, this).toArray().filter(function (h) {
    return h
  })
}

LRUCache.prototype.dumpLru = function () {
  return this[LRU_LIST]
}

LRUCache.prototype.inspect = function (n, opts) {
  var str = 'LRUCache {'
  var extras = false

  var as = this[ALLOW_STALE]
  if (as) {
    str += '\n  allowStale: true'
    extras = true
  }

  var max = this[MAX]
  if (max && max !== Infinity) {
    if (extras) {
      str += ','
    }
    str += '\n  max: ' + util.inspect(max, opts)
    extras = true
  }

  var maxAge = this[MAX_AGE]
  if (maxAge) {
    if (extras) {
      str += ','
    }
    str += '\n  maxAge: ' + util.inspect(maxAge, opts)
    extras = true
  }

  var lc = this[LENGTH_CALCULATOR]
  if (lc && lc !== naiveLength) {
    if (extras) {
      str += ','
    }
    str += '\n  length: ' + util.inspect(this[LENGTH], opts)
    extras = true
  }

  var didFirst = false
  this[LRU_LIST].forEach(function (item) {
    if (didFirst) {
      str += ',\n  '
    } else {
      if (extras) {
        str += ',\n'
      }
      didFirst = true
      str += '\n  '
    }
    var key = util.inspect(item.key).split('\n').join('\n  ')
    var val = { value: item.value }
    if (item.maxAge !== maxAge) {
      val.maxAge = item.maxAge
    }
    if (lc !== naiveLength) {
      val.length = item.length
    }
    if (isStale(this, item)) {
      val.stale = true
    }

    val = util.inspect(val, opts).split('\n').join('\n  ')
    str += key + ' => ' + val
  })

  if (didFirst || extras) {
    str += '\n'
  }
  str += '}'

  return str
}

LRUCache.prototype.set = function (key, value, maxAge) {
  maxAge = maxAge || this[MAX_AGE]

  var now = maxAge ? Date.now() : 0
  var len = this[LENGTH_CALCULATOR](value, key)

  if (this[CACHE].has(key)) {
    if (len > this[MAX]) {
      del(this, this[CACHE].get(key))
      return false
    }

    var node = this[CACHE].get(key)
    var item = node.value

    // dispose of the old one before overwriting
    // split out into 2 ifs for better coverage tracking
    if (this[DISPOSE]) {
      if (!this[NO_DISPOSE_ON_SET]) {
        this[DISPOSE](key, item.value)
      }
    }

    item.now = now
    item.maxAge = maxAge
    item.value = value
    this[LENGTH] += len - item.length
    item.length = len
    this.get(key)
    trim(this)
    return true
  }

  var hit = new Entry(key, value, len, now, maxAge)

  // oversized objects fall out of cache automatically.
  if (hit.length > this[MAX]) {
    if (this[DISPOSE]) {
      this[DISPOSE](key, value)
    }
    return false
  }

  this[LENGTH] += hit.length
  this[LRU_LIST].unshift(hit)
  this[CACHE].set(key, this[LRU_LIST].head)
  trim(this)
  return true
}

LRUCache.prototype.has = function (key) {
  if (!this[CACHE].has(key)) return false
  var hit = this[CACHE].get(key).value
  if (isStale(this, hit)) {
    return false
  }
  return true
}

LRUCache.prototype.get = function (key) {
  return get(this, key, true)
}

LRUCache.prototype.peek = function (key) {
  return get(this, key, false)
}

LRUCache.prototype.pop = function () {
  var node = this[LRU_LIST].tail
  if (!node) return null
  del(this, node)
  return node.value
}

LRUCache.prototype.del = function (key) {
  del(this, this[CACHE].get(key))
}

LRUCache.prototype.load = function (arr) {
  // reset the cache
  this.reset()

  var now = Date.now()
  // A previous serialized cache has the most recent items first
  for (var l = arr.length - 1; l >= 0; l--) {
    var hit = arr[l]
    var expiresAt = hit.e || 0
    if (expiresAt === 0) {
      // the item was created without expiration in a non aged cache
      this.set(hit.k, hit.v)
    } else {
      var maxAge = expiresAt - now
      // dont add already expired items
      if (maxAge > 0) {
        this.set(hit.k, hit.v, maxAge)
      }
    }
  }
}

LRUCache.prototype.prune = function () {
  var self = this
  this[CACHE].forEach(function (value, key) {
    get(self, key, false)
  })
}

function get (self, key, doUse) {
  var node = self[CACHE].get(key)
  if (node) {
    var hit = node.value
    if (isStale(self, hit)) {
      del(self, node)
      if (!self[ALLOW_STALE]) hit = undefined
    } else {
      if (doUse) {
        self[LRU_LIST].unshiftNode(node)
      }
    }
    if (hit) hit = hit.value
  }
  return hit
}

function isStale (self, hit) {
  if (!hit || (!hit.maxAge && !self[MAX_AGE])) {
    return false
  }
  var stale = false
  var diff = Date.now() - hit.now
  if (hit.maxAge) {
    stale = diff > hit.maxAge
  } else {
    stale = self[MAX_AGE] && (diff > self[MAX_AGE])
  }
  return stale
}

function trim (self) {
  if (self[LENGTH] > self[MAX]) {
    for (var walker = self[LRU_LIST].tail;
         self[LENGTH] > self[MAX] && walker !== null;) {
      // We know that we're about to delete this one, and also
      // what the next least recently used key will be, so just
      // go ahead and set it now.
      var prev = walker.prev
      del(self, walker)
      walker = prev
    }
  }
}

function del (self, node) {
  if (node) {
    var hit = node.value
    if (self[DISPOSE]) {
      self[DISPOSE](hit.key, hit.value)
    }
    self[LENGTH] -= hit.length
    self[CACHE].delete(hit.key)
    self[LRU_LIST].removeNode(node)
  }
}

// classy, since V8 prefers predictable objects.
function Entry (key, value, length, now, maxAge) {
  this.key = key
  this.value = value
  this.length = length
  this.now = now
  this.maxAge = maxAge || 0
}


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {if (process.env.npm_package_name === 'pseudomap' &&
    process.env.npm_lifecycle_script === 'test')
  process.env.TEST_PSEUDOMAP = 'true'

if (typeof Map === 'function' && !process.env.TEST_PSEUDOMAP) {
  module.exports = Map
} else {
  module.exports = __webpack_require__(65)
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(21)))

/***/ }),
/* 65 */
/***/ (function(module, exports) {

var hasOwnProperty = Object.prototype.hasOwnProperty

module.exports = PseudoMap

function PseudoMap (set) {
  if (!(this instanceof PseudoMap)) // whyyyyyyy
    throw new TypeError("Constructor PseudoMap requires 'new'")

  this.clear()

  if (set) {
    if ((set instanceof PseudoMap) ||
        (typeof Map === 'function' && set instanceof Map))
      set.forEach(function (value, key) {
        this.set(key, value)
      }, this)
    else if (Array.isArray(set))
      set.forEach(function (kv) {
        this.set(kv[0], kv[1])
      }, this)
    else
      throw new TypeError('invalid argument')
  }
}

PseudoMap.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this
  Object.keys(this._data).forEach(function (k) {
    if (k !== 'size')
      fn.call(thisp, this._data[k].value, this._data[k].key)
  }, this)
}

PseudoMap.prototype.has = function (k) {
  return !!find(this._data, k)
}

PseudoMap.prototype.get = function (k) {
  var res = find(this._data, k)
  return res && res.value
}

PseudoMap.prototype.set = function (k, v) {
  set(this._data, k, v)
}

PseudoMap.prototype.delete = function (k) {
  var res = find(this._data, k)
  if (res) {
    delete this._data[res._index]
    this._data.size--
  }
}

PseudoMap.prototype.clear = function () {
  var data = Object.create(null)
  data.size = 0

  Object.defineProperty(this, '_data', {
    value: data,
    enumerable: false,
    configurable: true,
    writable: false
  })
}

Object.defineProperty(PseudoMap.prototype, 'size', {
  get: function () {
    return this._data.size
  },
  set: function (n) {},
  enumerable: true,
  configurable: true
})

PseudoMap.prototype.values =
PseudoMap.prototype.keys =
PseudoMap.prototype.entries = function () {
  throw new Error('iterators are not implemented in this version')
}

// Either identical, or both NaN
function same (a, b) {
  return a === b || a !== a && b !== b
}

function Entry (k, v, i) {
  this.key = k
  this.value = v
  this._index = i
}

function find (data, k) {
  for (var i = 0, s = '_' + k, key = s;
       hasOwnProperty.call(data, key);
       key = s + i++) {
    if (same(data[key].key, k))
      return data[key]
  }
}

function set (data, k, v) {
  for (var i = 0, s = '_' + k, key = s;
       hasOwnProperty.call(data, key);
       key = s + i++) {
    if (same(data[key].key, k)) {
      data[key].value = v
      return
    }
  }
  data.size++
  data[key] = new Entry(k, v, key)
}


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__(68);

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = __webpack_require__(69);

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(67), __webpack_require__(21)))

/***/ }),
/* 67 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 68 */
/***/ (function(module, exports) {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),
/* 69 */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),
/* 70 */
/***/ (function(module, exports) {

module.exports = Yallist

Yallist.Node = Node
Yallist.create = Yallist

function Yallist (list) {
  var self = this
  if (!(self instanceof Yallist)) {
    self = new Yallist()
  }

  self.tail = null
  self.head = null
  self.length = 0

  if (list && typeof list.forEach === 'function') {
    list.forEach(function (item) {
      self.push(item)
    })
  } else if (arguments.length > 0) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      self.push(arguments[i])
    }
  }

  return self
}

Yallist.prototype.removeNode = function (node) {
  if (node.list !== this) {
    throw new Error('removing node which does not belong to this list')
  }

  var next = node.next
  var prev = node.prev

  if (next) {
    next.prev = prev
  }

  if (prev) {
    prev.next = next
  }

  if (node === this.head) {
    this.head = next
  }
  if (node === this.tail) {
    this.tail = prev
  }

  node.list.length--
  node.next = null
  node.prev = null
  node.list = null
}

Yallist.prototype.unshiftNode = function (node) {
  if (node === this.head) {
    return
  }

  if (node.list) {
    node.list.removeNode(node)
  }

  var head = this.head
  node.list = this
  node.next = head
  if (head) {
    head.prev = node
  }

  this.head = node
  if (!this.tail) {
    this.tail = node
  }
  this.length++
}

Yallist.prototype.pushNode = function (node) {
  if (node === this.tail) {
    return
  }

  if (node.list) {
    node.list.removeNode(node)
  }

  var tail = this.tail
  node.list = this
  node.prev = tail
  if (tail) {
    tail.next = node
  }

  this.tail = node
  if (!this.head) {
    this.head = node
  }
  this.length++
}

Yallist.prototype.push = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    push(this, arguments[i])
  }
  return this.length
}

Yallist.prototype.unshift = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    unshift(this, arguments[i])
  }
  return this.length
}

Yallist.prototype.pop = function () {
  if (!this.tail) {
    return undefined
  }

  var res = this.tail.value
  this.tail = this.tail.prev
  if (this.tail) {
    this.tail.next = null
  } else {
    this.head = null
  }
  this.length--
  return res
}

Yallist.prototype.shift = function () {
  if (!this.head) {
    return undefined
  }

  var res = this.head.value
  this.head = this.head.next
  if (this.head) {
    this.head.prev = null
  } else {
    this.tail = null
  }
  this.length--
  return res
}

Yallist.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this.head, i = 0; walker !== null; i++) {
    fn.call(thisp, walker.value, i, this)
    walker = walker.next
  }
}

Yallist.prototype.forEachReverse = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
    fn.call(thisp, walker.value, i, this)
    walker = walker.prev
  }
}

Yallist.prototype.get = function (n) {
  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.next
  }
  if (i === n && walker !== null) {
    return walker.value
  }
}

Yallist.prototype.getReverse = function (n) {
  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.prev
  }
  if (i === n && walker !== null) {
    return walker.value
  }
}

Yallist.prototype.map = function (fn, thisp) {
  thisp = thisp || this
  var res = new Yallist()
  for (var walker = this.head; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this))
    walker = walker.next
  }
  return res
}

Yallist.prototype.mapReverse = function (fn, thisp) {
  thisp = thisp || this
  var res = new Yallist()
  for (var walker = this.tail; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this))
    walker = walker.prev
  }
  return res
}

Yallist.prototype.reduce = function (fn, initial) {
  var acc
  var walker = this.head
  if (arguments.length > 1) {
    acc = initial
  } else if (this.head) {
    walker = this.head.next
    acc = this.head.value
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = 0; walker !== null; i++) {
    acc = fn(acc, walker.value, i)
    walker = walker.next
  }

  return acc
}

Yallist.prototype.reduceReverse = function (fn, initial) {
  var acc
  var walker = this.tail
  if (arguments.length > 1) {
    acc = initial
  } else if (this.tail) {
    walker = this.tail.prev
    acc = this.tail.value
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = this.length - 1; walker !== null; i--) {
    acc = fn(acc, walker.value, i)
    walker = walker.prev
  }

  return acc
}

Yallist.prototype.toArray = function () {
  var arr = new Array(this.length)
  for (var i = 0, walker = this.head; walker !== null; i++) {
    arr[i] = walker.value
    walker = walker.next
  }
  return arr
}

Yallist.prototype.toArrayReverse = function () {
  var arr = new Array(this.length)
  for (var i = 0, walker = this.tail; walker !== null; i++) {
    arr[i] = walker.value
    walker = walker.prev
  }
  return arr
}

Yallist.prototype.slice = function (from, to) {
  to = to || this.length
  if (to < 0) {
    to += this.length
  }
  from = from || 0
  if (from < 0) {
    from += this.length
  }
  var ret = new Yallist()
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0
  }
  if (to > this.length) {
    to = this.length
  }
  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
    walker = walker.next
  }
  for (; walker !== null && i < to; i++, walker = walker.next) {
    ret.push(walker.value)
  }
  return ret
}

Yallist.prototype.sliceReverse = function (from, to) {
  to = to || this.length
  if (to < 0) {
    to += this.length
  }
  from = from || 0
  if (from < 0) {
    from += this.length
  }
  var ret = new Yallist()
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0
  }
  if (to > this.length) {
    to = this.length
  }
  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
    walker = walker.prev
  }
  for (; walker !== null && i > from; i--, walker = walker.prev) {
    ret.push(walker.value)
  }
  return ret
}

Yallist.prototype.reverse = function () {
  var head = this.head
  var tail = this.tail
  for (var walker = head; walker !== null; walker = walker.prev) {
    var p = walker.prev
    walker.prev = walker.next
    walker.next = p
  }
  this.head = tail
  this.tail = head
  return this
}

function push (self, item) {
  self.tail = new Node(item, self.tail, null, self)
  if (!self.head) {
    self.head = self.tail
  }
  self.length++
}

function unshift (self, item) {
  self.head = new Node(item, null, self.head, self)
  if (!self.tail) {
    self.tail = self.head
  }
  self.length++
}

function Node (value, prev, next, list) {
  if (!(this instanceof Node)) {
    return new Node(value, prev, next, list)
  }

  this.list = list
  this.value = value

  if (prev) {
    prev.next = this
    this.prev = prev
  } else {
    this.prev = null
  }

  if (next) {
    next.prev = this
    this.next = next
  } else {
    this.next = null
  }
}


/***/ }),
/* 71 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = getFiltering;
/* harmony export (immutable) */ __webpack_exports__["b"] = getSQLWhere;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_style_expressions_binary__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__core_style_expressions_belongs__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__core_style_expressions_between__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__core_style_expressions_category__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__core_style_expressions_float__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__core_style_expressions_property__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__core_style_expressions_blend__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__core_style_expressions_animate__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__core_style_expressions_floatConstant__ = __webpack_require__(14);











/**
 * Returns supported windshaft filters for the style
 * @param {*} style 
 * @returns {Filtering}
 */
function getFiltering(style) {
    return getFilter(style.filter);
}

/**
 *
 * @param {Filtering} filtering
 */
function getSQLWhere(filtering) {
    if (!filtering) {
        return '';
    }
    return 'WHERE ' + filtering.map(filter => getSQL(filter)).join(' AND ');

}

function getSQL(f) {
    return getBetweenSQL(f) || getInSQL(f) || getNinSQL(f) || '';
}

function getBetweenSQL(f) {
    if (f.type == 'between') {
        return `(${f.property} BETWEEN ${f.lowerLimit} AND ${f.upperLimit})`;
    }
}

function getInSQL(f) {
    if (f.type == 'in') {
        return `(${f.property} IN (${f.whitelist.map(cat => `'${cat}'`).join()}))`;
    }
}

function getNinSQL(f) {
    if (f.type == 'nin') {
        return `(${f.property} NOT IN (${f.blacklist.map(cat => `'${cat}'`).join()}))`;
    }
}

function getFilter(f) {
    return getAndFilter(f) || getInFilter(f) || getNinFilter(f) || getBetweenFilter(f) || getBlendFilter(f) || null;
}

function getAndFilter(f) {
    if (f instanceof __WEBPACK_IMPORTED_MODULE_0__core_style_expressions_binary__["a" /* And */]) {
        return [getFilter(f.a), getFilter(f.b)].filter(Boolean).reduce((x, y) => x.concat(y));
    }
}

function getBlendFilter(f) {
    if (f instanceof __WEBPACK_IMPORTED_MODULE_6__core_style_expressions_blend__["a" /* default */] && f.originalMix instanceof __WEBPACK_IMPORTED_MODULE_7__core_style_expressions_animate__["a" /* default */]) {
        return getFilter(f.b);
    }
}

function getInFilter(f) {
    if (f instanceof __WEBPACK_IMPORTED_MODULE_1__core_style_expressions_belongs__["a" /* In */] && f.property instanceof __WEBPACK_IMPORTED_MODULE_5__core_style_expressions_property__["a" /* default */] && f.categories.every(cat => cat instanceof __WEBPACK_IMPORTED_MODULE_3__core_style_expressions_category__["a" /* default */])) {
        return [{
            type: 'in',
            property: f.property.name,
            whitelist: f.categories.map(cat => cat.expr)
        }];
    }
}

function getNinFilter(f) {
    if (f instanceof __WEBPACK_IMPORTED_MODULE_1__core_style_expressions_belongs__["b" /* Nin */] && f.property instanceof __WEBPACK_IMPORTED_MODULE_5__core_style_expressions_property__["a" /* default */] && f.categories.every(cat => cat instanceof __WEBPACK_IMPORTED_MODULE_3__core_style_expressions_category__["a" /* default */])) {
        return [{
            type: 'nin',
            property: f.property.name,
            blacklist: f.categories.map(cat => cat.expr)
        }];
    }
}

function getBetweenFilter(f) {
    if (isBetweenFilter(f)) {
        return [{
            type: 'between',
            property: f.value.name,
            lowerLimit: f.lowerLimit.expr,
            upperLimit: f.upperLimit.expr,
        }];
    }
}

function isBetweenFilter(f) {
    return f instanceof __WEBPACK_IMPORTED_MODULE_2__core_style_expressions_between__["a" /* default */]
        && f.value instanceof __WEBPACK_IMPORTED_MODULE_5__core_style_expressions_property__["a" /* default */]
        && (f.lowerLimit instanceof __WEBPACK_IMPORTED_MODULE_4__core_style_expressions_float__["a" /* default */] || f.lowerLimit instanceof __WEBPACK_IMPORTED_MODULE_8__core_style_expressions_floatConstant__["a" /* default */])
        && (f.upperLimit instanceof __WEBPACK_IMPORTED_MODULE_4__core_style_expressions_float__["a" /* default */] || f.upperLimit instanceof __WEBPACK_IMPORTED_MODULE_8__core_style_expressions_floatConstant__["a" /* default */]);
}


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

module.exports.VectorTile = __webpack_require__(73);
module.exports.VectorTileFeature = __webpack_require__(23);
module.exports.VectorTileLayer = __webpack_require__(22);


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var VectorTileLayer = __webpack_require__(22);

module.exports = VectorTile;

function VectorTile(pbf, end) {
    this.layers = pbf.readFields(readTile, {}, end);
}

function readTile(tag, layers, pbf) {
    if (tag === 3) {
        var layer = new VectorTileLayer(pbf, pbf.readVarint() + pbf.pos);
        if (layer.length) layers[layer.name] = layer;
    }
}



/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = Point;

/**
 * A standalone point geometry with useful accessor, comparison, and
 * modification methods.
 *
 * @class Point
 * @param {Number} x the x-coordinate. this could be longitude or screen
 * pixels, or any other sort of unit.
 * @param {Number} y the y-coordinate. this could be latitude or screen
 * pixels, or any other sort of unit.
 * @example
 * var point = new Point(-77, 38);
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype = {

    /**
     * Clone this point, returning a new point that can be modified
     * without affecting the old one.
     * @return {Point} the clone
     */
    clone: function() { return new Point(this.x, this.y); },

    /**
     * Add this point's x & y coordinates to another point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    add:     function(p) { return this.clone()._add(p); },

    /**
     * Subtract this point's x & y coordinates to from point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    sub:     function(p) { return this.clone()._sub(p); },

    /**
     * Multiply this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    multByPoint:    function(p) { return this.clone()._multByPoint(p); },

    /**
     * Divide this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    divByPoint:     function(p) { return this.clone()._divByPoint(p); },

    /**
     * Multiply this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    mult:    function(k) { return this.clone()._mult(k); },

    /**
     * Divide this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    div:     function(k) { return this.clone()._div(k); },

    /**
     * Rotate this point around the 0, 0 origin by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @return {Point} output point
     */
    rotate:  function(a) { return this.clone()._rotate(a); },

    /**
     * Rotate this point around p point by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @param {Point} p Point to rotate around
     * @return {Point} output point
     */
    rotateAround:  function(a,p) { return this.clone()._rotateAround(a,p); },

    /**
     * Multiply this point by a 4x1 transformation matrix
     * @param {Array<Number>} m transformation matrix
     * @return {Point} output point
     */
    matMult: function(m) { return this.clone()._matMult(m); },

    /**
     * Calculate this point but as a unit vector from 0, 0, meaning
     * that the distance from the resulting point to the 0, 0
     * coordinate will be equal to 1 and the angle from the resulting
     * point to the 0, 0 coordinate will be the same as before.
     * @return {Point} unit vector point
     */
    unit:    function() { return this.clone()._unit(); },

    /**
     * Compute a perpendicular point, where the new y coordinate
     * is the old x coordinate and the new x coordinate is the old y
     * coordinate multiplied by -1
     * @return {Point} perpendicular point
     */
    perp:    function() { return this.clone()._perp(); },

    /**
     * Return a version of this point with the x & y coordinates
     * rounded to integers.
     * @return {Point} rounded point
     */
    round:   function() { return this.clone()._round(); },

    /**
     * Return the magitude of this point: this is the Euclidean
     * distance from the 0, 0 coordinate to this point's x and y
     * coordinates.
     * @return {Number} magnitude
     */
    mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    /**
     * Judge whether this point is equal to another point, returning
     * true or false.
     * @param {Point} other the other point
     * @return {boolean} whether the points are equal
     */
    equals: function(other) {
        return this.x === other.x &&
               this.y === other.y;
    },

    /**
     * Calculate the distance from this point to another point
     * @param {Point} p the other point
     * @return {Number} distance
     */
    dist: function(p) {
        return Math.sqrt(this.distSqr(p));
    },

    /**
     * Calculate the distance from this point to another point,
     * without the square root step. Useful if you're comparing
     * relative distances.
     * @param {Point} p the other point
     * @return {Number} distance
     */
    distSqr: function(p) {
        var dx = p.x - this.x,
            dy = p.y - this.y;
        return dx * dx + dy * dy;
    },

    /**
     * Get the angle from the 0, 0 coordinate to this point, in radians
     * coordinates.
     * @return {Number} angle
     */
    angle: function() {
        return Math.atan2(this.y, this.x);
    },

    /**
     * Get the angle from this point to another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleTo: function(b) {
        return Math.atan2(this.y - b.y, this.x - b.x);
    },

    /**
     * Get the angle between this point and another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleWith: function(b) {
        return this.angleWithSep(b.x, b.y);
    },

    /*
     * Find the angle of the two vectors, solving the formula for
     * the cross product a x b = |a||b|sin(θ) for θ.
     * @param {Number} x the x-coordinate
     * @param {Number} y the y-coordinate
     * @return {Number} the angle in radians
     */
    angleWithSep: function(x, y) {
        return Math.atan2(
            this.x * y - this.y * x,
            this.x * x + this.y * y);
    },

    _matMult: function(m) {
        var x = m[0] * this.x + m[1] * this.y,
            y = m[2] * this.x + m[3] * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _add: function(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    },

    _sub: function(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    },

    _mult: function(k) {
        this.x *= k;
        this.y *= k;
        return this;
    },

    _div: function(k) {
        this.x /= k;
        this.y /= k;
        return this;
    },

    _multByPoint: function(p) {
        this.x *= p.x;
        this.y *= p.y;
        return this;
    },

    _divByPoint: function(p) {
        this.x /= p.x;
        this.y /= p.y;
        return this;
    },

    _unit: function() {
        this._div(this.mag());
        return this;
    },

    _perp: function() {
        var y = this.y;
        this.y = this.x;
        this.x = -y;
        return this;
    },

    _rotate: function(angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = cos * this.x - sin * this.y,
            y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _rotateAround: function(angle, p) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y),
            y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
        this.x = x;
        this.y = y;
        return this;
    },

    _round: function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
};

/**
 * Construct a point from an array if necessary, otherwise if the input
 * is already a Point, or an unknown type, return it unchanged
 * @param {Array<Number>|Point|*} a any kind of input value
 * @return {Point} constructed point, or passed-through value.
 * @example
 * // this
 * var point = Point.convert([0, 1]);
 * // is equivalent to
 * var point = new Point(0, 1);
 */
Point.convert = function (a) {
    if (a instanceof Point) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point(a[0], a[1]);
    }
    return a;
};


/***/ }),
/* 75 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CartoError; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__error_list__ = __webpack_require__(76);


const UNEXPECTED_ERROR = 'unexpected error';
const GENERIC_ORIGIN = 'generic';

/**
 * Represents an error in the carto library.
 *
 * @typedef {object} CartoError
 * @property {string} message - A short error description
 * @property {string} name - The name of the error "CartoError"
 * @property {string} origin - Where the error was originated: 'validation'
 * @property {object} originalError - An object containing the internal/original error
 * @property {object} stack - Error stack trace
 * @property {string} type - Error type
 * @api
 */
class CartoError extends Error {
    /**
     * Build a cartoError from a generic error.
     * @constructor
     *
     * @return {CartoError} A well formed object representing the error.
     */
    constructor(error) {
        super((error && error.message) || UNEXPECTED_ERROR);

        this.name = 'CartoError';
        this.originalError = error;
        // this.stack = (new Error()).stack;
        this.type = (error && error.type) || '';
        this.origin = (error && error.origin) || GENERIC_ORIGIN;

        // Add extra fields
        var extraFields = this._getExtraFields();
        this.message = extraFields.friendlyMessage;
    }

    _getExtraFields() {
        const errorList = this._getErrorList();
        for (let key in errorList) {
            const error = errorList[key];
            if (!(error.messageRegex instanceof RegExp)) {
                throw new Error(`MessageRegex on ${key} is not a RegExp.`);
            }
            if (error.messageRegex.test(this.message)) {
                return {
                    friendlyMessage: this._replaceRegex(error)
                };
            }
        }

        // When cartoError not found return generic values
        return {
            friendlyMessage: this.message || ''
        };
    }

    _getErrorList() {
        return __WEBPACK_IMPORTED_MODULE_0__error_list__[this.origin] && __WEBPACK_IMPORTED_MODULE_0__error_list__[this.origin][this.type];
    }

    /**
     * Replace $0 with the proper paramter in the listedError regex to build a friendly message.
     */
    _replaceRegex (error) {
        if (!error.friendlyMessage) {
            return this.message;
        }
        var match = this.message && this.message.match(error.messageRegex);
        if (match && match.length > 1) {
            return error.friendlyMessage.replace('$0', match[1]);
        }
        return error.friendlyMessage;
    }
}




/***/ }),
/* 76 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validation", function() { return validation; });
const validation = {
    layer: {
        'id-required': {
            messageRegex: /idRequired/,
            friendlyMessage: '`id` property required.'
        },
        'id-string-required': {
            messageRegex: /idStringRequired/,
            friendlyMessage: '`id` property must be a string.'
        },
        'non-valid-id': {
            messageRegex: /nonValidId/,
            friendlyMessage: '`id` property must be not empty.'
        },
        'source-required': {
            messageRegex: /sourceRequired/,
            friendlyMessage: '`source` property required.'
        },
        'non-valid-source': {
            messageRegex: /nonValidSource/,
            friendlyMessage: 'The given object is not a valid source. See "carto.source.Base".'
        },
        'style-required': {
            messageRegex: /styleRequired/,
            friendlyMessage: '`style` property required.'
        },
        'non-valid-style': {
            messageRegex: /nonValidStyle/,
            friendlyMessage: 'The given object is not a valid style. See "carto.Style".'
        }
    },
    setup: {
        'auth-required': {
            messageRegex: /authRequired/,
            friendlyMessage: '`auth` property is required.'
        },
        'auth-object-required': {
            messageRegex: /authObjectRequired/,
            friendlyMessage: '`auth` property must be an object.'
        },
        'api-key-required': {
            messageRegex: /apiKeyRequired/,
            friendlyMessage: '`apiKey` property is required.'
        },
        'api-key-string-required': {
            messageRegex: /apiKeyStringRequired/,
            friendlyMessage: '`apiKey` property must be a string.'
        },
        'non-valid-api-key': {
            messageRegex: /nonValidApiKey/,
            friendlyMessage: '`apiKey` property must be not empty.'
        },
        'username-required': {
            messageRegex: /usernameRequired/,
            friendlyMessage: '`username` property is required.'
        },
        'username-string-required': {
            messageRegex: /usernameStringRequired/,
            friendlyMessage: '`username` property must be a string.'
        },
        'non-valid-username': {
            messageRegex: /nonValidUsername/,
            friendlyMessage: '`username` property must be not empty.'
        },
        'config-object-required': {
            messageRegex: /configObjectRequired/,
            friendlyMessage: '`config` property must be an object.'
        },
        'server-url-string-required': {
            messageRegex: /serverURLStringRequired/,
            friendlyMessage: '`serverURL` property must be a string.'
        }
    },
    source: {
        'non-valid-server-url': {
            messageRegex: /nonValidServerURL/,
            friendlyMessage: '`serverURL` property is not a valid URL.'
        },
        'table-name-required': {
            messageRegex: /tableNameRequired/,
            friendlyMessage: '`tableName` property is required.'
        },
        'table-name-string-required': {
            messageRegex: /tableNameStringRequired$/,
            friendlyMessage: '`tableName` property must be a string.'
        },
        'non-valid-table-name': {
            messageRegex: /nonValidTableName$/,
            friendlyMessage: '`tableName` property must be not empty.'
        },
        'query-required': {
            messageRegex: /queryRequired/,
            friendlyMessage: '`query` property is required.'
        },
        'query-string-required': {
            messageRegex: /queryStringRequired$/,
            friendlyMessage: '`query` property must be a string.'
        },
        'non-valid-query': {
            messageRegex: /nonValidQuery$/,
            friendlyMessage: '`query` property must be not empty.'
        },
        'non-valid-sql-query': {
            messageRegex: /nonValidSQLQuery$/,
            friendlyMessage: '`query` property must be a SQL query.'
        }
    },
    style: {
        'non-valid-definition': {
            messageRegex: /nonValidDefinition$/,
            friendlyMessage: 'style definition should be a styleSpec object or a valid style string.'
        },
        'non-valid-expression': {
            messageRegex: /nonValidExpression\[(.+)\]$/,
            friendlyMessage: '`$0` parameter is not a valid style Expresion.'
        },
        'resolution-number-required': {
            messageRegex: /resolutionNumberRequired$/,
            friendlyMessage: '`resolution` must be a number.'
        }
    }
};




/***/ }),
/* 77 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__source_base__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__style__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__map__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__integrator_carto__ = __webpack_require__(81);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__integrator_mapbox_gl__ = __webpack_require__(82);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__error_handling_carto_validation_error__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__core_style_functions__ = __webpack_require__(1);









/**
 * Responsabilities: rely style changes into MNS source notifications, notify renderer about style changes, notify source about viewport changes,
 * rely dataframes to renderer, configure visibility for all source dataframes, set up MGL integration (opionally)
 */

class Layer {

    /**
     * Create a carto.Layer.
     *
     *
     * @param {string} id
     * @param {carto.source.Base} source
     * @param {carto.Style} style
     *
     * @example
     * new carto.Layer('layer0', source, style);
     *
     * @fires CartoError
     *
     * @constructor Layer
     * @memberof carto
     * @api
     */
    constructor(id, source, style) {
        this._checkId(id);
        this._checkSource(source);
        this._checkStyle(style);

        this._lastViewport = null;
        this._lastMNS = null;
        this._integrator = null;
        this._dataframes = [];

        this._id = id;
        this.metadata = null;
        this.setSource(source);
        this.setStyle(style);

        this._listeners = {};

        this.state = 'init';
        console.log('L', this);

        this.paintCallback = () => {
            this._dataframes.map(
                dataframe => {
                    dataframe.setStyle(this._style);
                    dataframe.visible = dataframe.active;
                });
            this._integrator.renderer.refresh(Number.NaN);
            this._dataframes.map(
                dataframe => {
                    dataframe.visible = false;
                });
            if (this.state == 'dataLoaded') {
                this.state = 'dataPainted';
                this._fire('loaded');
            }
        };
    }

    _fire(eventType, eventData) {
        if (!this._listeners[eventType]) {
            return;
        }
        this._listeners[eventType].map(listener => listener(eventData));
    }

    on(eventType, callback) {
        if (!this._listeners[eventType]) {
            this._listeners[eventType] = [callback];
        } else {
            this._listeners[eventType].push(callback);
        }
    }
    off(eventType, callback) {
        const index = this._listeners[eventType].indexOf(callback);
        this._listeners[eventType].splice(index, 1);
    }

    /**
     * Set a new source for this layer.
     *
     * @param {carto.source.Base} source - New source
     *
     * @memberof carto.Layer
     * @api
     */
    setSource(source) {
        this._checkSource(source);
        source.bindLayer(
            dataframe => {
                this._dataframes.push(dataframe);
                this._integrator.renderer.addDataframe(dataframe);
                this._integrator.invalidateWebGLState();
            },
            dataframe => {
                this._dataframes = this._dataframes.filter(d => d !== dataframe);
                this._integrator.renderer.removeDataframe(dataframe);
                this._integrator.invalidateWebGLState();
            },
            () => {
                this.state = 'dataLoaded';
            }
        );
        if (this._source && this._source !== source) {
            this._source.free();
        }
        this._source = source;
    }

    /**
     * Set a new style for this layer.
     *
     * @param {carto.Style} style - New style
     *
     * @memberof carto.Layer
     * @api
     */
    setStyle(style) {
        this._checkStyle(style);
        return this._styleChanged(style).then(r => {
            if (this._style) {
                this._style.onChange(null);
            }
            this._style = style;
            this._style.onChange(() => {
                this._styleChanged(style);
            });
            return r;
        });
    }

    /**
     * Blend the current style with another style
     *
     * @param {carto.Style} style - style to blend to
     *
     * @memberof carto.Layer
     * @api
     */
    blendToStyle(style, ms = 400, interpolator = __WEBPACK_IMPORTED_MODULE_7__core_style_functions__["cubic"]) {
        this._checkStyle(style);
        if (this._style) {
            style.getColor().blendFrom(this._style.getColor(), ms, interpolator);
            style.getStrokeColor().blendFrom(this._style.getStrokeColor(), ms, interpolator);
            style.getWidth().blendFrom(this._style.getWidth(), ms, interpolator);
            style.getStrokeWidth().blendFrom(this._style.getStrokeWidth(), ms, interpolator);
            style.filter.blendFrom(this._style.filter, ms, interpolator);
        }

        return this._styleChanged(style).then(r => {
            if (this._style) {
                this._style.onChange(null);
            }
            this._style = style;
            this._style.onChange(() => {
                this._styleChanged(style);
            });
            return r;
        });
    }

    /**
     * Add this layer to a map.
     *
     * @param {mapboxgl.Map} map
     * @param {string} beforeLayerID
     *
     * @memberof carto.Layer
     * @api
     */
    addTo(map, beforeLayerID) {
        if (this._isCartoMap(map)) {
            this._addToCartoMap(map, beforeLayerID);
        } else if (this._isMGLMap(map)) {
            this._addToMGLMap(map, beforeLayerID);
        } else {
            throw new __WEBPACK_IMPORTED_MODULE_6__error_handling_carto_validation_error__["a" /* default */]('layer', 'nonValidMap');
        }
    }

    hasDataframes() {
        return this._dataframes.length > 0;
    }

    getId() {
        return this._id;
    }

    getSource() {
        return this._source;
    }

    getStyle() {
        return this._style;
    }

    _isCartoMap(map) {
        return map instanceof __WEBPACK_IMPORTED_MODULE_3__map__["a" /* default */];
    }

    _isMGLMap() {
        // TODO: implement this
        return true;
    }

    _addToCartoMap(map, beforeLayerID) {
        this._integrator = Object(__WEBPACK_IMPORTED_MODULE_4__integrator_carto__["a" /* default */])(map);
        this._integrator.addLayer(this, beforeLayerID);
    }

    initCallback() {
        this._styleChanged(this._style);
        this.requestData();
    }
    _addToMGLMap(map, beforeLayerID) {
        if (map.isStyleLoaded()) {
            this._onMapLoaded(map, beforeLayerID);
        } else {
            map.on('load', () => {
                this._onMapLoaded(map, beforeLayerID);
            });
        }
    }

    _onMapLoaded(map, beforeLayerID) {
        this._integrator = Object(__WEBPACK_IMPORTED_MODULE_5__integrator_mapbox_gl__["a" /* default */])(map);
        this._integrator.addLayer(this, beforeLayerID);
    }

    _styleChanged(style) {
        const recompile = (metadata) => {
            style._compileColorShader(this._integrator.renderer.gl, metadata);
            style._compileWidthShader(this._integrator.renderer.gl, metadata);
            style._compileStrokeColorShader(this._integrator.renderer.gl, metadata);
            style._compileStrokeWidthShader(this._integrator.renderer.gl, metadata);
            style._compileFilterShader(this._integrator.renderer.gl, metadata);
        };
        if (!(this._integrator && this._integrator.invalidateWebGLState)) {
            return Promise.resolve();
        }
        const originalPromise = this.requestData(style);
        if (!originalPromise) {
            // The previous stored metadata is still valid
            recompile(this.metadata);
            return Promise.resolve();
        }
        // this.metadata needs to be updated, try to get new metadata and update this.metadata and proceed if everything works well
        return originalPromise.then(metadata => {
            this.metadata = metadata;
            recompile(metadata);
        });
    }

    _checkId(id) {
        if (__WEBPACK_IMPORTED_MODULE_0__util__["d" /* isUndefined */](id)) {
            throw new __WEBPACK_IMPORTED_MODULE_6__error_handling_carto_validation_error__["a" /* default */]('layer', 'idRequired');
        }
        if (!__WEBPACK_IMPORTED_MODULE_0__util__["c" /* isString */](id)) {
            throw new __WEBPACK_IMPORTED_MODULE_6__error_handling_carto_validation_error__["a" /* default */]('layer', 'idStringRequired');
        }
        if (id === '') {
            throw new __WEBPACK_IMPORTED_MODULE_6__error_handling_carto_validation_error__["a" /* default */]('layer', 'nonValidId');
        }
    }

    _checkSource(source) {
        if (__WEBPACK_IMPORTED_MODULE_0__util__["d" /* isUndefined */](source)) {
            throw new __WEBPACK_IMPORTED_MODULE_6__error_handling_carto_validation_error__["a" /* default */]('layer', 'sourceRequired');
        }
        if (!(source instanceof __WEBPACK_IMPORTED_MODULE_1__source_base__["a" /* default */])) {
            throw new __WEBPACK_IMPORTED_MODULE_6__error_handling_carto_validation_error__["a" /* default */]('layer', 'nonValidSource');
        }
    }

    _checkStyle(style) {
        if (__WEBPACK_IMPORTED_MODULE_0__util__["d" /* isUndefined */](style)) {
            throw new __WEBPACK_IMPORTED_MODULE_6__error_handling_carto_validation_error__["a" /* default */]('layer', 'styleRequired');
        }
        if (!(style instanceof __WEBPACK_IMPORTED_MODULE_2__style__["a" /* default */])) {
            throw new __WEBPACK_IMPORTED_MODULE_6__error_handling_carto_validation_error__["a" /* default */]('layer', 'nonValidStyle');
        }
    }

    _getViewport() {
        if (this._integrator) {
            return this._integrator.renderer.getBounds();
        }
        throw new Error('?');
    }

    requestData(style) {
        style = style || this._style;
        if (!this._integrator.invalidateWebGLState) {
            return;
        }
        return this._source.requestData(this._getViewport(), style);
    }

    getNumFeatures() {
        return this._dataframes.filter(d => d.active).map(d => d.numFeatures).reduce((x, y) => x + y, 0);
    }

    //TODO free layer resources
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Layer;



/***/ }),
/* 78 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = compileShader;
function compileShader(gl, styleRootExpr, shaderCreator) {
    let uniformIDcounter = 0;
    let tid = {};
    const colorModifier = styleRootExpr._applyToShaderSource(() => uniformIDcounter++, name => {
        if (tid[name] !== undefined) {
            return tid[name];
        }
        tid[name] = Object.keys(tid).length;
        return tid[name];
    });
    const shader = shaderCreator(gl, colorModifier.preface, colorModifier.inline);
    styleRootExpr._postShaderCompile(shader.program, gl);
    return {
        tid: tid,
        shader: shader
    };
}


/***/ }),
/* 79 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export parseStyleExpression */
/* harmony export (immutable) */ __webpack_exports__["a"] = parseStyleDefinition;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jsep__ = __webpack_require__(80);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jsep___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jsep__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__functions__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__expressions_utils__ = __webpack_require__(3);




// TODO use Schema classes

const aggFns = [];

var lowerCaseFunctions = {};
Object.keys(__WEBPACK_IMPORTED_MODULE_1__functions__)
    .filter(name => name[0] == name[0].toLowerCase()) // Only get functions starting with lowercase
    .map(name => { lowerCaseFunctions[name.toLocaleLowerCase()] = __WEBPACK_IMPORTED_MODULE_1__functions__[name]; });
lowerCaseFunctions.true = __WEBPACK_IMPORTED_MODULE_1__functions__["TRUE"];
lowerCaseFunctions.false = __WEBPACK_IMPORTED_MODULE_1__functions__["FALSE"];

/**
 * @jsapi
 * @param {*} str
 * @param {*} schema
 */
function parseStyleExpression(str, schema) {
    // jsep addBinaryOp pollutes its module scope, we need to remove the custom operators afterwards
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.addBinaryOp('^', 10);
    const r = parseNode(__WEBPACK_IMPORTED_MODULE_0_jsep___default()(str), schema);
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.removeBinaryOp('^');
    return r;
}

function parseStyleNamedExpr(styleSpec, node) {
    if (node.operator != ':') {
        throw new Error('Invalid syntax');
    }
    const name = node.left.name;
    if (!name) {
        throw new Error('Invalid syntax');
    }
    const value = parseNode(node.right);
    // Don't cast resolution properties implicitly since they must be of type Number
    styleSpec[name] = name == 'resolution' ? value : Object(__WEBPACK_IMPORTED_MODULE_2__expressions_utils__["b" /* implicitCast */])(value);
}

function parseStyleDefinition(str) {
    // jsep addBinaryOp pollutes its module scope, we need to remove the custom operators afterwards
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.addBinaryOp(':', 0);
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.addBinaryOp('^', 11);
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.addBinaryOp('or', 1);
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.addBinaryOp('and', 2);
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.removeLiteral('true');
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.removeLiteral('false');
    const ast = __WEBPACK_IMPORTED_MODULE_0_jsep___default()(str);
    let styleSpec = {};
    if (ast.type == 'Compound') {
        ast.body.map(node => parseStyleNamedExpr(styleSpec, node));
    } else {
        parseStyleNamedExpr(styleSpec, ast);
    }
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.removeBinaryOp('and');
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.removeBinaryOp('or');
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.removeBinaryOp('^');
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.removeBinaryOp(':');
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.addLiteral('true');
    __WEBPACK_IMPORTED_MODULE_0_jsep___default.a.addLiteral('false');
    return styleSpec;
}

function parseFunctionCall(node) {
    const name = node.callee.name.toLowerCase();
    if (aggFns.includes(name)) {
        //node.arguments[0].name += '_' + name;
        const args = node.arguments.map(arg => parseNode(arg));
        return args[0];
    }
    const args = node.arguments.map(arg => parseNode(arg));
    if (lowerCaseFunctions[name]) {
        return lowerCaseFunctions[name](...args);
    }
    throw new Error(`Invalid function name '${node.callee.name}'`);
}

function parseBinaryOperation(node) {
    const left = parseNode(node.left);
    const right = parseNode(node.right);
    switch (node.operator) {
    case '*':
        return __WEBPACK_IMPORTED_MODULE_1__functions__["floatMul"](left, right);
    case '/':
        return __WEBPACK_IMPORTED_MODULE_1__functions__["floatDiv"](left, right);
    case '+':
        return __WEBPACK_IMPORTED_MODULE_1__functions__["floatAdd"](left, right);
    case '-':
        return __WEBPACK_IMPORTED_MODULE_1__functions__["floatSub"](left, right);
    case '%':
        return __WEBPACK_IMPORTED_MODULE_1__functions__["floatMod"](left, right);
    case '^':
        return __WEBPACK_IMPORTED_MODULE_1__functions__["floatPow"](left, right);
    case '>':
        return __WEBPACK_IMPORTED_MODULE_1__functions__["greaterThan"](left, right);
    case '>=':
        return __WEBPACK_IMPORTED_MODULE_1__functions__["greaterThanOrEqualTo"](left, right);
    case '<':
        return __WEBPACK_IMPORTED_MODULE_1__functions__["lessThan"](left, right);
    case '<=':
        return __WEBPACK_IMPORTED_MODULE_1__functions__["lessThanOrEqualTo"](left, right);
    case '==':
        return __WEBPACK_IMPORTED_MODULE_1__functions__["equals"](left, right);
    case 'and':
        return __WEBPACK_IMPORTED_MODULE_1__functions__["and"](left, right);
    case 'or':
        return __WEBPACK_IMPORTED_MODULE_1__functions__["or"](left, right);
    default:
        throw new Error(`Invalid binary operator '${node.operator}'`);
    }
}

function parseUnaryOperation(node) {
    switch (node.operator) {
    case '-':
        return __WEBPACK_IMPORTED_MODULE_1__functions__["floatMul"](-1, parseNode(node.argument));
    case '+':
        return parseNode(node.argument);
    default:
        throw new Error(`Invalid unary operator '${node.operator}'`);
    }
}

function parseIdentifier(node) {
    if (node.name[0] == '$') {
        return __WEBPACK_IMPORTED_MODULE_1__functions__["property"](node.name.substring(1));
    } else if (__WEBPACK_IMPORTED_MODULE_1__functions__["palettes"][node.name.toLowerCase()]) {
        return __WEBPACK_IMPORTED_MODULE_1__functions__["palettes"][node.name.toLowerCase()];
    } else if (lowerCaseFunctions[node.name.toLowerCase()]) {
        return lowerCaseFunctions[node.name.toLowerCase()];
    }
}

function parseNode(node) {
    if (node.type == 'CallExpression') {
        return parseFunctionCall(node);
    } else if (node.type == 'Literal') {
        return node.value;
    } else if (node.type == 'ArrayExpression') {
        return node.elements.map(e => parseNode(e));
    } else if (node.type == 'BinaryExpression') {
        return parseBinaryOperation(node);
    } else if (node.type == 'UnaryExpression') {
        return parseUnaryOperation(node);
    } else if (node.type == 'Identifier') {
        return parseIdentifier(node);
    }
    throw new Error(`Invalid expression '${JSON.stringify(node)}'`);
}


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

//     JavaScript Expression Parser (JSEP) 0.3.3
//     JSEP may be freely distributed under the MIT License
//     http://jsep.from.so/

/*global module: true, exports: true, console: true */
(function (root) {
	'use strict';
	// Node Types
	// ----------

	// This is the full set of types that any JSEP node can be.
	// Store them here to save space when minified
	var COMPOUND = 'Compound',
		IDENTIFIER = 'Identifier',
		MEMBER_EXP = 'MemberExpression',
		LITERAL = 'Literal',
		THIS_EXP = 'ThisExpression',
		CALL_EXP = 'CallExpression',
		UNARY_EXP = 'UnaryExpression',
		BINARY_EXP = 'BinaryExpression',
		LOGICAL_EXP = 'LogicalExpression',
		CONDITIONAL_EXP = 'ConditionalExpression',
		ARRAY_EXP = 'ArrayExpression',

		PERIOD_CODE = 46, // '.'
		COMMA_CODE  = 44, // ','
		SQUOTE_CODE = 39, // single quote
		DQUOTE_CODE = 34, // double quotes
		OPAREN_CODE = 40, // (
		CPAREN_CODE = 41, // )
		OBRACK_CODE = 91, // [
		CBRACK_CODE = 93, // ]
		QUMARK_CODE = 63, // ?
		SEMCOL_CODE = 59, // ;
		COLON_CODE  = 58, // :

		throwError = function(message, index) {
			var error = new Error(message + ' at character ' + index);
			error.index = index;
			error.description = message;
			throw error;
		},

	// Operations
	// ----------

	// Set `t` to `true` to save space (when minified, not gzipped)
		t = true,
	// Use a quickly-accessible map to store all of the unary operators
	// Values are set to `true` (it really doesn't matter)
		unary_ops = {'-': t, '!': t, '~': t, '+': t},
	// Also use a map for the binary operations but set their values to their
	// binary precedence for quick reference:
	// see [Order of operations](http://en.wikipedia.org/wiki/Order_of_operations#Programming_language)
		binary_ops = {
			'||': 1, '&&': 2, '|': 3,  '^': 4,  '&': 5,
			'==': 6, '!=': 6, '===': 6, '!==': 6,
			'<': 7,  '>': 7,  '<=': 7,  '>=': 7,
			'<<':8,  '>>': 8, '>>>': 8,
			'+': 9, '-': 9,
			'*': 10, '/': 10, '%': 10
		},
	// Get return the longest key length of any object
		getMaxKeyLen = function(obj) {
			var max_len = 0, len;
			for(var key in obj) {
				if((len = key.length) > max_len && obj.hasOwnProperty(key)) {
					max_len = len;
				}
			}
			return max_len;
		},
		max_unop_len = getMaxKeyLen(unary_ops),
		max_binop_len = getMaxKeyLen(binary_ops),
	// Literals
	// ----------
	// Store the values to return for the various literals we may encounter
		literals = {
			'true': true,
			'false': false,
			'null': null
		},
	// Except for `this`, which is special. This could be changed to something like `'self'` as well
		this_str = 'this',
	// Returns the precedence of a binary operator or `0` if it isn't a binary operator
		binaryPrecedence = function(op_val) {
			return binary_ops[op_val] || 0;
		},
	// Utility function (gets called from multiple places)
	// Also note that `a && b` and `a || b` are *logical* expressions, not binary expressions
		createBinaryExpression = function (operator, left, right) {
			var type = (operator === '||' || operator === '&&') ? LOGICAL_EXP : BINARY_EXP;
			return {
				type: type,
				operator: operator,
				left: left,
				right: right
			};
		},
		// `ch` is a character code in the next three functions
		isDecimalDigit = function(ch) {
			return (ch >= 48 && ch <= 57); // 0...9
		},
		isIdentifierStart = function(ch) {
			return (ch === 36) || (ch === 95) || // `$` and `_`
					(ch >= 65 && ch <= 90) || // A...Z
					(ch >= 97 && ch <= 122) || // a...z
                    (ch >= 128 && !binary_ops[String.fromCharCode(ch)]); // any non-ASCII that is not an operator
		},
		isIdentifierPart = function(ch) {
			return (ch === 36) || (ch === 95) || // `$` and `_`
					(ch >= 65 && ch <= 90) || // A...Z
					(ch >= 97 && ch <= 122) || // a...z
					(ch >= 48 && ch <= 57) || // 0...9
                    (ch >= 128 && !binary_ops[String.fromCharCode(ch)]); // any non-ASCII that is not an operator
		},

		// Parsing
		// -------
		// `expr` is a string with the passed in expression
		jsep = function(expr) {
			// `index` stores the character number we are currently at while `length` is a constant
			// All of the gobbles below will modify `index` as we move along
			var index = 0,
				charAtFunc = expr.charAt,
				charCodeAtFunc = expr.charCodeAt,
				exprI = function(i) { return charAtFunc.call(expr, i); },
				exprICode = function(i) { return charCodeAtFunc.call(expr, i); },
				length = expr.length,

				// Push `index` up to the next non-space character
				gobbleSpaces = function() {
					var ch = exprICode(index);
					// space or tab
					while(ch === 32 || ch === 9 || ch === 10 || ch === 13) {
						ch = exprICode(++index);
					}
				},

				// The main parsing function. Much of this code is dedicated to ternary expressions
				gobbleExpression = function() {
					var test = gobbleBinaryExpression(),
						consequent, alternate;
					gobbleSpaces();
					if(exprICode(index) === QUMARK_CODE) {
						// Ternary expression: test ? consequent : alternate
						index++;
						consequent = gobbleExpression();
						if(!consequent) {
							throwError('Expected expression', index);
						}
						gobbleSpaces();
						if(exprICode(index) === COLON_CODE) {
							index++;
							alternate = gobbleExpression();
							if(!alternate) {
								throwError('Expected expression', index);
							}
							return {
								type: CONDITIONAL_EXP,
								test: test,
								consequent: consequent,
								alternate: alternate
							};
						} else {
							throwError('Expected :', index);
						}
					} else {
						return test;
					}
				},

				// Search for the operation portion of the string (e.g. `+`, `===`)
				// Start by taking the longest possible binary operations (3 characters: `===`, `!==`, `>>>`)
				// and move down from 3 to 2 to 1 character until a matching binary operation is found
				// then, return that binary operation
				gobbleBinaryOp = function() {
					gobbleSpaces();
					var biop, to_check = expr.substr(index, max_binop_len), tc_len = to_check.length;
					while(tc_len > 0) {
						if(binary_ops.hasOwnProperty(to_check)) {
							index += tc_len;
							return to_check;
						}
						to_check = to_check.substr(0, --tc_len);
					}
					return false;
				},

				// This function is responsible for gobbling an individual expression,
				// e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
				gobbleBinaryExpression = function() {
					var ch_i, node, biop, prec, stack, biop_info, left, right, i;

					// First, try to get the leftmost thing
					// Then, check to see if there's a binary operator operating on that leftmost thing
					left = gobbleToken();
					biop = gobbleBinaryOp();

					// If there wasn't a binary operator, just return the leftmost node
					if(!biop) {
						return left;
					}

					// Otherwise, we need to start a stack to properly place the binary operations in their
					// precedence structure
					biop_info = { value: biop, prec: binaryPrecedence(biop)};

					right = gobbleToken();
					if(!right) {
						throwError("Expected expression after " + biop, index);
					}
					stack = [left, biop_info, right];

					// Properly deal with precedence using [recursive descent](http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm)
					while((biop = gobbleBinaryOp())) {
						prec = binaryPrecedence(biop);

						if(prec === 0) {
							break;
						}
						biop_info = { value: biop, prec: prec };

						// Reduce: make a binary expression from the three topmost entries.
						while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
							right = stack.pop();
							biop = stack.pop().value;
							left = stack.pop();
							node = createBinaryExpression(biop, left, right);
							stack.push(node);
						}

						node = gobbleToken();
						if(!node) {
							throwError("Expected expression after " + biop, index);
						}
						stack.push(biop_info, node);
					}

					i = stack.length - 1;
					node = stack[i];
					while(i > 1) {
						node = createBinaryExpression(stack[i - 1].value, stack[i - 2], node);
						i -= 2;
					}
					return node;
				},

				// An individual part of a binary expression:
				// e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
				gobbleToken = function() {
					var ch, to_check, tc_len;

					gobbleSpaces();
					ch = exprICode(index);

					if(isDecimalDigit(ch) || ch === PERIOD_CODE) {
						// Char code 46 is a dot `.` which can start off a numeric literal
						return gobbleNumericLiteral();
					} else if(ch === SQUOTE_CODE || ch === DQUOTE_CODE) {
						// Single or double quotes
						return gobbleStringLiteral();
					} else if (ch === OBRACK_CODE) {
						return gobbleArray();
					} else {
						to_check = expr.substr(index, max_unop_len);
						tc_len = to_check.length;
						while(tc_len > 0) {
							if(unary_ops.hasOwnProperty(to_check)) {
								index += tc_len;
								return {
									type: UNARY_EXP,
									operator: to_check,
									argument: gobbleToken(),
									prefix: true
								};
							}
							to_check = to_check.substr(0, --tc_len);
						}

						if (isIdentifierStart(ch) || ch === OPAREN_CODE) { // open parenthesis
							// `foo`, `bar.baz`
							return gobbleVariable();
						}
					}
					
					return false;
				},
				// Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
				// keep track of everything in the numeric literal and then calling `parseFloat` on that string
				gobbleNumericLiteral = function() {
					var number = '', ch, chCode;
					while(isDecimalDigit(exprICode(index))) {
						number += exprI(index++);
					}

					if(exprICode(index) === PERIOD_CODE) { // can start with a decimal marker
						number += exprI(index++);

						while(isDecimalDigit(exprICode(index))) {
							number += exprI(index++);
						}
					}

					ch = exprI(index);
					if(ch === 'e' || ch === 'E') { // exponent marker
						number += exprI(index++);
						ch = exprI(index);
						if(ch === '+' || ch === '-') { // exponent sign
							number += exprI(index++);
						}
						while(isDecimalDigit(exprICode(index))) { //exponent itself
							number += exprI(index++);
						}
						if(!isDecimalDigit(exprICode(index-1)) ) {
							throwError('Expected exponent (' + number + exprI(index) + ')', index);
						}
					}


					chCode = exprICode(index);
					// Check to make sure this isn't a variable name that start with a number (123abc)
					if(isIdentifierStart(chCode)) {
						throwError('Variable names cannot start with a number (' +
									number + exprI(index) + ')', index);
					} else if(chCode === PERIOD_CODE) {
						throwError('Unexpected period', index);
					}

					return {
						type: LITERAL,
						value: parseFloat(number),
						raw: number
					};
				},

				// Parses a string literal, staring with single or double quotes with basic support for escape codes
				// e.g. `"hello world"`, `'this is\nJSEP'`
				gobbleStringLiteral = function() {
					var str = '', quote = exprI(index++), closed = false, ch;

					while(index < length) {
						ch = exprI(index++);
						if(ch === quote) {
							closed = true;
							break;
						} else if(ch === '\\') {
							// Check for all of the common escape codes
							ch = exprI(index++);
							switch(ch) {
								case 'n': str += '\n'; break;
								case 'r': str += '\r'; break;
								case 't': str += '\t'; break;
								case 'b': str += '\b'; break;
								case 'f': str += '\f'; break;
								case 'v': str += '\x0B'; break;
								default : str += ch;
							}
						} else {
							str += ch;
						}
					}

					if(!closed) {
						throwError('Unclosed quote after "'+str+'"', index);
					}

					return {
						type: LITERAL,
						value: str,
						raw: quote + str + quote
					};
				},

				// Gobbles only identifiers
				// e.g.: `foo`, `_value`, `$x1`
				// Also, this function checks if that identifier is a literal:
				// (e.g. `true`, `false`, `null`) or `this`
				gobbleIdentifier = function() {
					var ch = exprICode(index), start = index, identifier;

					if(isIdentifierStart(ch)) {
						index++;
					} else {
						throwError('Unexpected ' + exprI(index), index);
					}

					while(index < length) {
						ch = exprICode(index);
						if(isIdentifierPart(ch)) {
							index++;
						} else {
							break;
						}
					}
					identifier = expr.slice(start, index);

					if(literals.hasOwnProperty(identifier)) {
						return {
							type: LITERAL,
							value: literals[identifier],
							raw: identifier
						};
					} else if(identifier === this_str) {
						return { type: THIS_EXP };
					} else {
						return {
							type: IDENTIFIER,
							name: identifier
						};
					}
				},

				// Gobbles a list of arguments within the context of a function call
				// or array literal. This function also assumes that the opening character
				// `(` or `[` has already been gobbled, and gobbles expressions and commas
				// until the terminator character `)` or `]` is encountered.
				// e.g. `foo(bar, baz)`, `my_func()`, or `[bar, baz]`
				gobbleArguments = function(termination) {
					var ch_i, args = [], node, closed = false;
					while(index < length) {
						gobbleSpaces();
						ch_i = exprICode(index);
						if(ch_i === termination) { // done parsing
							closed = true;
							index++;
							break;
						} else if (ch_i === COMMA_CODE) { // between expressions
							index++;
						} else {
							node = gobbleExpression();
							if(!node || node.type === COMPOUND) {
								throwError('Expected comma', index);
							}
							args.push(node);
						}
					}
					if (!closed) {
						throwError('Expected ' + String.fromCharCode(termination), index);
					}
					return args;
				},

				// Gobble a non-literal variable name. This variable name may include properties
				// e.g. `foo`, `bar.baz`, `foo['bar'].baz`
				// It also gobbles function calls:
				// e.g. `Math.acos(obj.angle)`
				gobbleVariable = function() {
					var ch_i, node;
					ch_i = exprICode(index);

					if(ch_i === OPAREN_CODE) {
						node = gobbleGroup();
					} else {
						node = gobbleIdentifier();
					}
					gobbleSpaces();
					ch_i = exprICode(index);
					while(ch_i === PERIOD_CODE || ch_i === OBRACK_CODE || ch_i === OPAREN_CODE) {
						index++;
						if(ch_i === PERIOD_CODE) {
							gobbleSpaces();
							node = {
								type: MEMBER_EXP,
								computed: false,
								object: node,
								property: gobbleIdentifier()
							};
						} else if(ch_i === OBRACK_CODE) {
							node = {
								type: MEMBER_EXP,
								computed: true,
								object: node,
								property: gobbleExpression()
							};
							gobbleSpaces();
							ch_i = exprICode(index);
							if(ch_i !== CBRACK_CODE) {
								throwError('Unclosed [', index);
							}
							index++;
						} else if(ch_i === OPAREN_CODE) {
							// A function call is being made; gobble all the arguments
							node = {
								type: CALL_EXP,
								'arguments': gobbleArguments(CPAREN_CODE),
								callee: node
							};
						}
						gobbleSpaces();
						ch_i = exprICode(index);
					}
					return node;
				},

				// Responsible for parsing a group of things within parentheses `()`
				// This function assumes that it needs to gobble the opening parenthesis
				// and then tries to gobble everything within that parenthesis, assuming
				// that the next thing it should see is the close parenthesis. If not,
				// then the expression probably doesn't have a `)`
				gobbleGroup = function() {
					index++;
					var node = gobbleExpression();
					gobbleSpaces();
					if(exprICode(index) === CPAREN_CODE) {
						index++;
						return node;
					} else {
						throwError('Unclosed (', index);
					}
				},

				// Responsible for parsing Array literals `[1, 2, 3]`
				// This function assumes that it needs to gobble the opening bracket
				// and then tries to gobble the expressions as arguments.
				gobbleArray = function() {
					index++;
					return {
						type: ARRAY_EXP,
						elements: gobbleArguments(CBRACK_CODE)
					};
				},

				nodes = [], ch_i, node;

			while(index < length) {
				ch_i = exprICode(index);

				// Expressions can be separated by semicolons, commas, or just inferred without any
				// separators
				if(ch_i === SEMCOL_CODE || ch_i === COMMA_CODE) {
					index++; // ignore separators
				} else {
					// Try to gobble each expression individually
					if((node = gobbleExpression())) {
						nodes.push(node);
					// If we weren't able to find a binary expression and are out of room, then
					// the expression passed in probably has too much
					} else if(index < length) {
						throwError('Unexpected "' + exprI(index) + '"', index);
					}
				}
			}

			// If there's only one expression just try returning the expression
			if(nodes.length === 1) {
				return nodes[0];
			} else {
				return {
					type: COMPOUND,
					body: nodes
				};
			}
		};

	// To be filled in by the template
	jsep.version = '0.3.3';
	jsep.toString = function() { return 'JavaScript Expression Parser (JSEP) v' + jsep.version; };

	/**
	 * @method jsep.addUnaryOp
	 * @param {string} op_name The name of the unary op to add
	 * @return jsep
	 */
	jsep.addUnaryOp = function(op_name) {
		max_unop_len = Math.max(op_name.length, max_unop_len);
		unary_ops[op_name] = t; return this;
	};

	/**
	 * @method jsep.addBinaryOp
	 * @param {string} op_name The name of the binary op to add
	 * @param {number} precedence The precedence of the binary op (can be a float)
	 * @return jsep
	 */
	jsep.addBinaryOp = function(op_name, precedence) {
		max_binop_len = Math.max(op_name.length, max_binop_len);
		binary_ops[op_name] = precedence;
		return this;
	};

	/**
	 * @method jsep.addLiteral
	 * @param {string} literal_name The name of the literal to add
	 * @param {*} literal_value The value of the literal
	 * @return jsep
	 */
	jsep.addLiteral = function(literal_name, literal_value) {
		literals[literal_name] = literal_value;
		return this;
	};

	/**
	 * @method jsep.removeUnaryOp
	 * @param {string} op_name The name of the unary op to remove
	 * @return jsep
	 */
	jsep.removeUnaryOp = function(op_name) {
		delete unary_ops[op_name];
		if(op_name.length === max_unop_len) {
			max_unop_len = getMaxKeyLen(unary_ops);
		}
		return this;
	};

	/**
	 * @method jsep.removeAllUnaryOps
	 * @return jsep
	 */
	jsep.removeAllUnaryOps = function() {
		unary_ops = {};
		max_unop_len = 0;

		return this;
	};

	/**
	 * @method jsep.removeBinaryOp
	 * @param {string} op_name The name of the binary op to remove
	 * @return jsep
	 */
	jsep.removeBinaryOp = function(op_name) {
		delete binary_ops[op_name];
		if(op_name.length === max_binop_len) {
			max_binop_len = getMaxKeyLen(binary_ops);
		}
		return this;
	};

	/**
	 * @method jsep.removeAllBinaryOps
	 * @return jsep
	 */
	jsep.removeAllBinaryOps = function() {
		binary_ops = {};
		max_binop_len = 0;

		return this;
	};

	/**
	 * @method jsep.removeLiteral
	 * @param {string} literal_name The name of the literal to remove
	 * @return jsep
	 */
	jsep.removeLiteral = function(literal_name) {
		delete literals[literal_name];
		return this;
	};

	/**
	 * @method jsep.removeAllLiterals
	 * @return jsep
	 */
	jsep.removeAllLiterals = function() {
		literals = {};

		return this;
	};

	// In desktop environments, have a way to restore the old value for `jsep`
	if (false) {
		var old_jsep = root.jsep;
		// The star of the show! It's a function!
		root.jsep = jsep;
		// And a courteous function willing to move out of the way for other similarly-named objects!
		jsep.noConflict = function() {
			if(root.jsep === jsep) {
				root.jsep = old_jsep;
			}
			return jsep;
		};
	} else {
		// In Node.JS environments
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = jsep;
		} else {
			exports.parse = jsep;
		}
	}
}(this));


/***/ }),
/* 81 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = getCartoMapIntegrator;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_renderer__ = __webpack_require__(11);


let integrator = null;
function getCartoMapIntegrator(map) {
    if (!integrator) {
        integrator = new CartoMapIntegrator(map);
    }
    return integrator;
}

class CartoMapIntegrator {
    constructor(map) {
        this.map = map;
        this.renderer = new __WEBPACK_IMPORTED_MODULE_0__core_renderer__["b" /* Renderer */]();
        this.renderer._initGL(this.map._gl);
        this.invalidateWebGLState = () => {};
    }

    addLayer(layerId, layer) {
        this.map.addLayer(layerId, layer);
    }
}


/***/ }),
/* 82 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = getMGLIntegrator;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__core_renderer__ = __webpack_require__(11);


const DEG2RAD = Math.PI / 180;
const EARTH_RADIUS = 6378137;
const WM_R = EARTH_RADIUS * Math.PI; // Webmercator *radius*: half length Earth's circumference
const WM_2R = WM_R * 2; // Webmercator coordinate range (Earth's circumference)

let uid = 0;

// TODO This needs to be separated by each mgl map to support multi map pages
let integrator = null;
function getMGLIntegrator(map) {
    if (!integrator) {
        integrator = new MGLIntegrator(map);
    }
    return integrator;
}


/**
 * Responsabilities, keep all MGL integration state and functionality that lies outside Layer
 */
class MGLIntegrator {
    constructor(map) {
        this.renderer = new __WEBPACK_IMPORTED_MODULE_0__core_renderer__["b" /* Renderer */]();
        this.map = map;
        this.invalidateWebGLState = null;

        map.on('movestart', this.move.bind(this));
        map.on('move', this.move.bind(this));
        map.on('moveend', this.move.bind(this));
        map.on('resize', this.move.bind(this));

        this.moveObservers = {};

        this._layers = [];
    }
    _registerMoveObserver(observerName, observerCallback) {
        this.moveObservers[observerName] = observerCallback;
    }
    _unregisterMoveObserver(observerName) {
        delete this.moveObservers[observerName];
    }
    addLayer(layer, beforeLayerID) {
        const callbackID = `_cartoGL_${uid++}`;
        const layerId = layer.getId();
        this._registerMoveObserver(callbackID, layer.requestData.bind(layer));
        this.map.repaint = true; // FIXME: add logic to manage repaint flag
        this.map.setCustomWebGLDrawCallback(layerId, (gl, invalidate) => {
            if (!this.invalidateWebGLState) {
                this.invalidateWebGLState = invalidate;
                this.notifyObservers();
                this.renderer._initGL(gl);
                layer.initCallback();
            }
            layer.paintCallback();
            invalidate();
        });
        this.map.addLayer({
            id: layerId,
            type: 'custom-webgl'
        }, beforeLayerID);
        this._layers.push(layerId);
        this.move();
    }
    needRefresh() {
        this.map.repaint = true; // FIXME: add logic to manage repaint flag
    }
    move() {
        var c = this.map.getCenter();
        // TODO create getCenter method
        this.renderer.setCenter(c.lng / 180., Wmxy(c).y / WM_R);
        this.renderer.setZoom(this.getZoom());
        this.notifyObservers();
    }
    notifyObservers() {
        Object.keys(this.moveObservers).map(id => this.moveObservers[id]());
    }
    getZoom() {
        var b = this.map.getBounds();
        var c = this.map.getCenter();
        var nw = b.getNorthWest();
        var sw = b.getSouthWest();
        var z = (Wmxy(nw).y - Wmxy(sw).y) / WM_2R;
        this.renderer.setCenter(c.lng / 180., Wmxy(c).y / WM_R);
        return z;
    }
}

// Webmercator projection
function Wmxy(latLng) {
    let lat = latLng.lat * DEG2RAD;
    let lng = latLng.lng * DEG2RAD;
    let x = lng * EARTH_RADIUS;
    let y = Math.log(Math.tan(lat / 2 + Math.PI / 4)) * EARTH_RADIUS;
    return { x: x, y: y };
}


/***/ }),
/* 83 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__base__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__error_handling_carto_validation_error__ = __webpack_require__(5);





class SQL extends __WEBPACK_IMPORTED_MODULE_1__base__["a" /* default */] {

    /**
     * Create a carto.source.Dataset.
     *
     * @param {string} query - A SQL query containing a SELECT statement
     * @param {object} auth
     * @param {string} auth.apiKey - API key used to authenticate against CARTO
     * @param {string} auth.user - Name of the user
     * @param {object} config
     * @param {string} [config.serverURL='https://{user}.carto.com'] - URL of the CARTO Maps API server
     *
     * @example
     * new carto.source.SQL('SELECT * FROM european_cities', {
     *   apiKey: 'YOUR_API_KEY_HERE',
     *   user: 'YOUR_USERNAME_HERE'
     * });
     *
     * @fires CartoError
     *
     * @constructor SQL
     * @extends carto.source.Base
     * @memberof carto.source
     * @api
     */
    constructor(query, auth, config) {
        super();
        this._checkQuery(query);
        this._query = query;
        this.initialize(auth, config);
    }

    _checkQuery(query) {
        if (__WEBPACK_IMPORTED_MODULE_0__util__["d" /* isUndefined */](query)) {
            throw new __WEBPACK_IMPORTED_MODULE_2__error_handling_carto_validation_error__["a" /* default */]('source', 'queryRequired');
        }
        if (!__WEBPACK_IMPORTED_MODULE_0__util__["c" /* isString */](query)) {
            throw new __WEBPACK_IMPORTED_MODULE_2__error_handling_carto_validation_error__["a" /* default */]('source', 'queryStringRequired');
        }
        if (query === '') {
            throw new __WEBPACK_IMPORTED_MODULE_2__error_handling_carto_validation_error__["a" /* default */]('source', 'nonValidQuery');
        }
        var sqlRegex = /(SELECT|select)\s+.*\s+(FROM|from)\s+.*/;
        if (!query.match(sqlRegex)) {
            throw new __WEBPACK_IMPORTED_MODULE_2__error_handling_carto_validation_error__["a" /* default */]('source', 'nonValidSQLQuery');
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = SQL;



/***/ })
/******/ ]);
});
//# sourceMappingURL=carto-gl.js.map