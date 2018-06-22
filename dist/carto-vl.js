/*!
 * CARTO VL js https://carto.com/
 * Version: 0.5.0-beta.3
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
})(window, function() {
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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/@mapbox/point-geometry/index.js":
/*!******************************************************!*\
  !*** ./node_modules/@mapbox/point-geometry/index.js ***!
  \******************************************************/
/*! no static exports found */
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

/***/ "./node_modules/@mapbox/vector-tile/index.js":
/*!***************************************************!*\
  !*** ./node_modules/@mapbox/vector-tile/index.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports.VectorTile = __webpack_require__(/*! ./lib/vectortile.js */ "./node_modules/@mapbox/vector-tile/lib/vectortile.js");
module.exports.VectorTileFeature = __webpack_require__(/*! ./lib/vectortilefeature.js */ "./node_modules/@mapbox/vector-tile/lib/vectortilefeature.js");
module.exports.VectorTileLayer = __webpack_require__(/*! ./lib/vectortilelayer.js */ "./node_modules/@mapbox/vector-tile/lib/vectortilelayer.js");


/***/ }),

/***/ "./node_modules/@mapbox/vector-tile/lib/vectortile.js":
/*!************************************************************!*\
  !*** ./node_modules/@mapbox/vector-tile/lib/vectortile.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var VectorTileLayer = __webpack_require__(/*! ./vectortilelayer */ "./node_modules/@mapbox/vector-tile/lib/vectortilelayer.js");

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

/***/ "./node_modules/@mapbox/vector-tile/lib/vectortilefeature.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@mapbox/vector-tile/lib/vectortilefeature.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Point = __webpack_require__(/*! @mapbox/point-geometry */ "./node_modules/@mapbox/point-geometry/index.js");

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
        if (length <= 0) {
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
        if (length <= 0) {
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

/***/ "./node_modules/@mapbox/vector-tile/lib/vectortilelayer.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@mapbox/vector-tile/lib/vectortilelayer.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var VectorTileFeature = __webpack_require__(/*! ./vectortilefeature.js */ "./node_modules/@mapbox/vector-tile/lib/vectortilefeature.js");

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

/***/ "./node_modules/cartocolor/cartocolor.js":
/*!***********************************************!*\
  !*** ./node_modules/cartocolor/cartocolor.js ***!
  \***********************************************/
/*! no static exports found */
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

var colorbrewer = __webpack_require__(/*! colorbrewer */ "./node_modules/colorbrewer/index.js");

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
} else {}

}();


/***/ }),

/***/ "./node_modules/cartocolor/index.js":
/*!******************************************!*\
  !*** ./node_modules/cartocolor/index.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./cartocolor */ "./node_modules/cartocolor/cartocolor.js");


/***/ }),

/***/ "./node_modules/colorbrewer/colorbrewer.js":
/*!*************************************************!*\
  !*** ./node_modules/colorbrewer/colorbrewer.js ***!
  \*************************************************/
/*! no static exports found */
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
} else {}

}();


/***/ }),

/***/ "./node_modules/colorbrewer/index.js":
/*!*******************************************!*\
  !*** ./node_modules/colorbrewer/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./colorbrewer.js */ "./node_modules/colorbrewer/colorbrewer.js");


/***/ }),

/***/ "./node_modules/earcut/src/earcut.js":
/*!*******************************************!*\
  !*** ./node_modules/earcut/src/earcut.js ***!
  \*******************************************/
/*! no static exports found */
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

/***/ "./node_modules/ieee754/index.js":
/*!***************************************!*\
  !*** ./node_modules/ieee754/index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
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
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

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
  var eLen = (nBytes * 8) - mLen - 1
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
      m = ((value * c) - 1) * Math.pow(2, mLen)
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

/***/ "./node_modules/jsep/build/jsep.js":
/*!*****************************************!*\
  !*** ./node_modules/jsep/build/jsep.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

//     JavaScript Expression Parser (JSEP) 0.3.4
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
	// Additional valid identifier chars, apart from a-z, A-Z and 0-9 (except on the starting char)
		additional_identifier_chars = {'$': t, '_': t},
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
			return  (ch >= 65 && ch <= 90) || // A...Z
					(ch >= 97 && ch <= 122) || // a...z
					(ch >= 128 && !binary_ops[String.fromCharCode(ch)]) || // any non-ASCII that is not an operator
					(additional_identifier_chars.hasOwnProperty(String.fromCharCode(ch))); // additional characters
		},
		isIdentifierPart = function(ch) {
			return 	(ch >= 65 && ch <= 90) || // A...Z
					(ch >= 97 && ch <= 122) || // a...z
					(ch >= 48 && ch <= 57) || // 0...9
					(ch >= 128 && !binary_ops[String.fromCharCode(ch)])|| // any non-ASCII that is not an operator
					(additional_identifier_chars.hasOwnProperty(String.fromCharCode(ch))); // additional characters
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
						// Don't accept a binary op when it is an identifier.
						// Binary ops that start with a identifier-valid character must be followed
						// by a non identifier-part valid character
						if(binary_ops.hasOwnProperty(to_check) && (
							!isIdentifierStart(exprICode(index)) ||
							(index+to_check.length< expr.length && !isIdentifierPart(exprICode(index+to_check.length)))
						)) {
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
						// Don't accept an unary op when it is an identifier.
						// Unary ops that start with a identifier-valid character must be followed
						// by a non identifier-part valid character
							if(unary_ops.hasOwnProperty(to_check) && (
								!isIdentifierStart(exprICode(index)) ||
								(index+to_check.length < expr.length && !isIdentifierPart(exprICode(index+to_check.length)))
							)) {
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
	jsep.version = '0.3.4';
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
	 * @method jsep.addIdentifierChar
	 * @param {string} char The additional character to treat as a valid part of an identifier
	 * @return jsep
	 */
	jsep.addIdentifierChar = function(char) {
		additional_identifier_chars[char] = t; return this;
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
	 * @method jsep.removeIdentifierChar
	 * @param {string} char The additional character to stop treating as a valid part of an identifier
	 * @return jsep
	 */
	jsep.removeIdentifierChar = function(char) {
		delete additional_identifier_chars[char];
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
	if (false) { var old_jsep; } else {
		// In Node.JS environments
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = jsep;
		} else {
			exports.parse = jsep;
		}
	}
}(this));


/***/ }),

/***/ "./node_modules/lru-cache/index.js":
/*!*****************************************!*\
  !*** ./node_modules/lru-cache/index.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = LRUCache

// This will be a proper iterable 'Map' in engines that support it,
// or a fakey-fake PseudoMap in older versions.
var Map = __webpack_require__(/*! pseudomap */ "./node_modules/pseudomap/map.js")
var util = __webpack_require__(/*! util */ "./node_modules/util/util.js")

// A linked list to keep track of recently-used-ness
var Yallist = __webpack_require__(/*! yallist */ "./node_modules/lru-cache/node_modules/yallist/yallist.js")

// use symbols if possible, otherwise just _props
var hasSymbol = typeof Symbol === 'function'
var makeSymbol
if (hasSymbol) {
  makeSymbol = function (key) {
    return Symbol(key)
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

/***/ "./node_modules/lru-cache/node_modules/yallist/yallist.js":
/*!****************************************************************!*\
  !*** ./node_modules/lru-cache/node_modules/yallist/yallist.js ***!
  \****************************************************************/
/*! no static exports found */
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

/***/ "./node_modules/mitt/dist/mitt.es.js":
/*!*******************************************!*\
  !*** ./node_modules/mitt/dist/mitt.es.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
//      
// An event handler can take an optional event argument
// and should not return a value
                                          
                                                               

// An array of all currently registered event handlers for a type
                                            
                                                            
// A map of event types and their corresponding event handlers.
                        
                                 
                                   
  

/** Mitt: Tiny (~200b) functional event emitter / pubsub.
 *  @name mitt
 *  @returns {Mitt}
 */
function mitt(all                 ) {
	all = all || Object.create(null);

	return {
		/**
		 * Register an event handler for the given type.
		 *
		 * @param  {String} type	Type of event to listen for, or `"*"` for all events
		 * @param  {Function} handler Function to call in response to given event
		 * @memberOf mitt
		 */
		on: function on(type        , handler              ) {
			(all[type] || (all[type] = [])).push(handler);
		},

		/**
		 * Remove an event handler for the given type.
		 *
		 * @param  {String} type	Type of event to unregister `handler` from, or `"*"`
		 * @param  {Function} handler Handler function to remove
		 * @memberOf mitt
		 */
		off: function off(type        , handler              ) {
			if (all[type]) {
				all[type].splice(all[type].indexOf(handler) >>> 0, 1);
			}
		},

		/**
		 * Invoke all handlers for the given type.
		 * If present, `"*"` handlers are invoked after type-matched handlers.
		 *
		 * @param {String} type  The event type to invoke
		 * @param {Any} [evt]  Any value (object is recommended and powerful), passed to each handler
		 * @memberOf mitt
		 */
		emit: function emit(type        , evt     ) {
			(all[type] || []).slice().map(function (handler) { handler(evt); });
			(all['*'] || []).slice().map(function (handler) { handler(type, evt); });
		}
	};
}

/* harmony default export */ __webpack_exports__["default"] = (mitt);
//# sourceMappingURL=mitt.es.js.map


/***/ }),

/***/ "./node_modules/pbf/index.js":
/*!***********************************!*\
  !*** ./node_modules/pbf/index.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = Pbf;

var ieee754 = __webpack_require__(/*! ieee754 */ "./node_modules/ieee754/index.js");

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

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
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

/***/ "./node_modules/pseudomap/map.js":
/*!***************************************!*\
  !*** ./node_modules/pseudomap/map.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {if (process.env.npm_package_name === 'pseudomap' &&
    process.env.npm_lifecycle_script === 'test')
  process.env.TEST_PSEUDOMAP = 'true'

if (typeof Map === 'function' && !process.env.TEST_PSEUDOMAP) {
  module.exports = Map
} else {
  module.exports = __webpack_require__(/*! ./pseudomap */ "./node_modules/pseudomap/pseudomap.js")
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/pseudomap/pseudomap.js":
/*!*********************************************!*\
  !*** ./node_modules/pseudomap/pseudomap.js ***!
  \*********************************************/
/*! no static exports found */
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

/***/ "./node_modules/util/node_modules/inherits/inherits_browser.js":
/*!*********************************************************************!*\
  !*** ./node_modules/util/node_modules/inherits/inherits_browser.js ***!
  \*********************************************************************/
/*! no static exports found */
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

/***/ "./node_modules/util/support/isBufferBrowser.js":
/*!******************************************************!*\
  !*** ./node_modules/util/support/isBufferBrowser.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),

/***/ "./node_modules/util/util.js":
/*!***********************************!*\
  !*** ./node_modules/util/util.js ***!
  \***********************************/
/*! no static exports found */
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

exports.isBuffer = __webpack_require__(/*! ./support/isBuffer */ "./node_modules/util/support/isBufferBrowser.js");

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
exports.inherits = __webpack_require__(/*! inherits */ "./node_modules/util/node_modules/inherits/inherits_browser.js");

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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js"), __webpack_require__(/*! ./../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./package.json":
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
/*! exports provided: name, version, sideEffects, description, repository, author, contributors, license, files, dependencies, devDependencies, main, module, jsnext:main, scripts, default */
/***/ (function(module) {

module.exports = {"name":"@carto/carto-vl","version":"0.5.0-beta.3","sideEffects":false,"description":"CARTO Vector library","repository":{"type":"git","url":"git://github.com/CartoDB/carto-vl.git"},"author":{"name":"CARTO","url":"https://carto.com/"},"contributors":["David Manzanares <dmanzanares@carto.com>","Iago Lastra <iago@carto.com>","Jesús Arroyo Torrens <jarroyo@carto.com>","Javier Goizueta <jgoizueta@carto.com>","Mamata Akella <makella@carto.com>","Raúl Ochoa <rochoa@carto.com>","Ariana Escobar <ariana@carto.com>","Elena Torro <elena@carto.com>"],"license":"BSD-3-Clause","files":["src","dist"],"dependencies":{"@mapbox/vector-tile":"^1.3.0","cartocolor":"^4.0.0","earcut":"^2.1.2","jsep":"CartoDB/jsep#additional-char-ids-packaged","lru-cache":"^4.1.1","mitt":"^1.1.3","pbf":"^3.1.0"},"devDependencies":{"@carto/mapbox-gl":"0.45.0-carto1","chai":"^4.1.2","chai-as-promised":"^7.1.1","eslint":"^4.15.0","exquisite-sst":"IagoLast/Exquisite#master","fastly":"^2.2.0","glob":"^7.1.2","http-server":"^0.11.1","jasmine-core":"^2.99.1","jsdoc":"^3.5.5","jsdoc-escape-at":"^1.0.1","karma":"^2.0.2","karma-chrome-launcher":"^2.2.0","karma-jasmine":"^1.1.2","karma-mocha-reporter":"^2.2.5","karma-sourcemap-loader":"^0.3.7","karma-webpack":"^3.0.0","lodash.template":"^4.4.0","mocha":"^5.0.0","puppeteer":"^1.1.0","s3":"^4.4.0","serve":"^7.2.0","sloc":"^0.2.0","webpack":"^4.0.0","webpack-cli":"^2.1.4"},"main":"src/index.js","module":"src/index.js","jsnext:main":"src/index.js","scripts":{"build":"yarn build:dev && yarn build:min","build:dev":"webpack --config webpack/webpack.config.js","build:min":"webpack --config webpack/webpack.min.config.js","build:watch":"webpack -w --config webpack/webpack.config.js","docs":"rm -rf docs/public; jsdoc --configure config/jsdoc/public-conf.json","docs:all":"rm -rf docs/all; jsdoc --configure config/jsdoc/all-conf.json","lint":"eslint .","lint:fix":"eslint . --fix","test":"yarn test:unit && yarn lint && yarn docs","test:unit":"karma start --single-run --browsers ChromeHeadlessNoSandbox test/unit/karma.conf.js","test:watch":"karma start --no-single-run --auto-watch --browsers ChromeHeadlessNoSandbox test/unit/karma.conf.js","test:watchc":"karma start --no-single-run --auto-watch --browsers Chrome test/unit/karma.conf.js","test:user":"karma start --single-run --browsers ChromeHeadlessNoSandbox test/integration/user/karma.conf.js","test:user:watch":"karma start --no-single-run --auto-watch --browsers ChromeHeadlessNoSandbox test/integration/user/karma.conf.js","test:user:watchc":"karma start --no-single-run --browsers Chrome test/integration/user/karma.conf.js","test:browser":"karma start --no-single-run --browsers Chrome test/unit/karma.conf.js","test:render":"yarn build:dev && mocha test/integration/render/render.test.js","test:render:clean":"rm -rf test/integration/render/scenarios/**/**/reference.png","test:render:prepare":"yarn build:dev && node test/integration/render/render.prepare.js ","test:e2e":"yarn build:dev && mocha test/acceptance/e2e.test.js","test:e2e:clean":"rm -rf test/acceptance/e2e/**/reference.png","test:e2e:prepare":"yarn build:dev && node test/acceptance/e2e.prepare.js ","test:benchmark":"node test/benchmark/benchmark.js","serve":"yarn build:dev && yarn docs && http-server","bump":"npm version prerelease","bump:minor":"npm version minor","bump:patch":"npm version patch","release":"./scripts/release.sh","postversion":"git push origin HEAD --follow-tags","ghpublish":"git checkout gh-pages && git pull origin gh-pages && git merge master && yarn build && yarn docs && git commit -a -m \"Auto generated gh-pages\" && git push origin gh-pages && git checkout master","loc":"sloc src/ examples/"}};

/***/ }),

/***/ "./src/api/error-handling/carto-error.js":
/*!***********************************************!*\
  !*** ./src/api/error-handling/carto-error.js ***!
  \***********************************************/
/*! exports provided: CartoError */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CartoError", function() { return CartoError; });
/* harmony import */ var _error_list__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./error-list */ "./src/api/error-handling/error-list.js");


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
 *
 * @event CartoError
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
        const extraFields = this._getExtraFields();
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
        return _error_list__WEBPACK_IMPORTED_MODULE_0__[this.origin] && _error_list__WEBPACK_IMPORTED_MODULE_0__[this.origin][this.type];
    }

    /**
     * Replace $0 with the proper paramter in the listedError regex to build a friendly message.
     */
    _replaceRegex (error) {
        if (!error.friendlyMessage) {
            return this.message;
        }
        const match = this.message && this.message.match(error.messageRegex);
        if (match && match.length > 1) {
            return error.friendlyMessage.replace('$0', match[1]);
        }
        return error.friendlyMessage;
    }
}




/***/ }),

/***/ "./src/api/error-handling/carto-validation-error.js":
/*!**********************************************************!*\
  !*** ./src/api/error-handling/carto-validation-error.js ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return CartoValidationError; });
/* harmony import */ var _carto_error__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./carto-error */ "./src/api/error-handling/carto-error.js");


/**
 * Utility to build a cartoError related to validation errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */
class CartoValidationError extends _carto_error__WEBPACK_IMPORTED_MODULE_0__["CartoError"] {
    constructor(type, message) {
        super({
            origin: 'validation',
            type: type,
            message: message
        });
    }
}


/***/ }),

/***/ "./src/api/error-handling/error-list.js":
/*!**********************************************!*\
  !*** ./src/api/error-handling/error-list.js ***!
  \**********************************************/
/*! exports provided: validation */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
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
        'viz-required': {
            messageRegex: /vizRequired/,
            friendlyMessage: '`viz` property required.'
        },
        'non-valid-viz': {
            messageRegex: /nonValidViz/,
            friendlyMessage: 'The given object is not a valid viz. See "carto.Viz".'
        },
        'shared-viz': {
            messageRegex: /sharedViz/,
            friendlyMessage: 'The given Viz object is already bound to another layer. Vizs cannot be shared between different layers'
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
        },
        'data-required': {
            messageRegex: /dataRequired/,
            friendlyMessage: '`data` property is required.'
        },
        'data-object-required': {
            messageRegex: /dataObjectRequired$/,
            friendlyMessage: '`data` property must be an object.'
        },
        'non-valid-geojson-data': {
            messageRegex: /nonValidGeoJSONData$/,
            friendlyMessage: '`data` property must be a GeoJSON object.'
        },
        'multiple-feature-types': {
            messageRegex: /multipleFeatureTypes\[(.+)\]$/,
            friendlyMessage: 'multiple types not supported: $0.'
        },
        'first-polygon-external': {
            messageRegex: /firstPolygonExternal$/,
            friendlyMessage: 'first polygon ring must be external.'
        },
        'feature-has-cartodb_id': {
            messageRegex: /featureHasCartodbId$/,
            friendlyMessage: '`cartodb_id` is a reserved property so it can not be used'
        }
    },
    viz: {
        'non-valid-definition': {
            messageRegex: /nonValidDefinition$/,
            friendlyMessage: 'viz definition should be a vizSpec object or a valid viz string.'
        },
        'non-valid-expression': {
            messageRegex: /nonValidExpression\[(.+)\]$/,
            friendlyMessage: '`$0` parameter is not a valid viz Expresion.'
        },
        'resolution-number-required': {
            messageRegex: /resolutionNumberRequired$/,
            friendlyMessage: '`resolution` must be a number.'
        },
        'resolution-too-small': {
            messageRegex: /resolutionTooSmall\[(.+)\]$/,
            friendlyMessage: '`resolution` must be greater than $0.'
        },
        'resolution-too-big': {
            messageRegex: /resolutionTooBig\[(.+)\]$/,
            friendlyMessage: '`resolution` must be less than $0.'
        }
    }
};




/***/ }),

/***/ "./src/api/feature.js":
/*!****************************!*\
  !*** ./src/api/feature.js ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Feature; });
/* harmony import */ var _featureVizProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./featureVizProperty */ "./src/api/featureVizProperty.js");


/**
 *
 * Feature objects are provided by {@link FeatureEvent} events.
 *
 * @typedef {object} Feature
 * @property {number} id - Unique identification code
 * @property {FeatureVizProperty} color
 * @property {FeatureVizProperty} width
 * @property {FeatureVizProperty} colorStroke
 * @property {FeatureVizProperty} widthStroke
 * @property {FeatureVizProperty[]} variables - Declared variables in the viz object
 * @property {function} reset - Reset custom feature vizs by fading out `duration` milliseconds, where `duration` is the first parameter to reset
 * @api
 */
class Feature {
    constructor(rawFeature, viz, customizedFeatures, trackFeatureViz) {
        const variables = {};
        Object.keys(viz.variables).map(varName => {
            variables[varName] = new _featureVizProperty__WEBPACK_IMPORTED_MODULE_0__["default"](`__cartovl_variable_${varName}`, rawFeature, viz, customizedFeatures, trackFeatureViz);
        });

        this.id = rawFeature.id;
        this.color = new _featureVizProperty__WEBPACK_IMPORTED_MODULE_0__["default"]('color', rawFeature, viz, customizedFeatures, trackFeatureViz);
        this.width = new _featureVizProperty__WEBPACK_IMPORTED_MODULE_0__["default"]('width', rawFeature, viz, customizedFeatures, trackFeatureViz);
        this.strokeColor = new _featureVizProperty__WEBPACK_IMPORTED_MODULE_0__["default"]('strokeColor', rawFeature, viz, customizedFeatures, trackFeatureViz);
        this.strokeWidth = new _featureVizProperty__WEBPACK_IMPORTED_MODULE_0__["default"]('strokeWidth', rawFeature, viz, customizedFeatures, trackFeatureViz);
        this.variables = variables;
    }

    reset(duration = 500) {
        this.color.reset(duration);
        this.width.reset(duration);
        this.strokeColor.reset(duration);
        this.strokeWidth.reset(duration);

        for (let key in this.variables) {
            this.variables[key].reset(duration);
        }

    }
}


/***/ }),

/***/ "./src/api/featureVizProperty.js":
/*!***************************************!*\
  !*** ./src/api/featureVizProperty.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return FeatureVizProperty; });
/* harmony import */ var _core_viz_functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/viz/functions */ "./src/core/viz/functions.js");
/* harmony import */ var _core_viz_parser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/viz/parser */ "./src/core/viz/parser.js");



/**
 *
 * FeatureVizProperty objects can be accessed through {@link Feature} objects.
 *
 * @typedef {object} FeatureVizProperty
 * @property {function} blendTo - Change the feature viz by blending to a destination viz expression `expr` in `duration` milliseconds, where `expr` is the first parameter and `duration` the last one
 * @property {function} reset - Reset custom feature viz property by fading out `duration` milliseconds, where `duration` is the first parameter to reset
 * @property {function} value - Getter that evaluates the property and returns the computed value
 * @api
 */
class FeatureVizProperty {
    get value() {
        return this._viz[this._propertyName].eval(this._properties);
    }

    constructor(propertyName, feature, viz, customizedFeatures, trackFeatureViz) {
        this._propertyName = propertyName;
        this._feature = feature;
        this._viz = viz;
        this._properties = this._feature.properties;

        this.blendTo = _generateBlenderFunction(propertyName, feature, customizedFeatures, viz, trackFeatureViz);
        this.reset = _generateResetFunction(propertyName, feature, customizedFeatures, viz);
    }
}

function _generateResetFunction(propertyName, feature, customizedFeatures, viz) {
    return function reset(duration = 500) {
        if (customizedFeatures[feature.id] && customizedFeatures[feature.id][propertyName]) {
            customizedFeatures[feature.id][propertyName].replaceChild(
                customizedFeatures[feature.id][propertyName].mix,
                // animate(0) is used to ensure that blend._predraw() "GC" collects it
                Object(_core_viz_functions__WEBPACK_IMPORTED_MODULE_0__["blend"])(Object(_core_viz_functions__WEBPACK_IMPORTED_MODULE_0__["notEquals"])(Object(_core_viz_functions__WEBPACK_IMPORTED_MODULE_0__["property"])('cartodb_id'), feature.id), Object(_core_viz_functions__WEBPACK_IMPORTED_MODULE_0__["animate"])(0), Object(_core_viz_functions__WEBPACK_IMPORTED_MODULE_0__["animate"])(duration))
            );
            viz[propertyName].notify();
            customizedFeatures[feature.id][propertyName] = undefined;
        }
    };
}


function _generateBlenderFunction(propertyName, feature, customizedFeatures, viz, trackFeatureViz) {
    return function generatedBlendTo(newExpression, duration = 500) {
        if (typeof newExpression == 'string') {
            newExpression = Object(_core_viz_parser__WEBPACK_IMPORTED_MODULE_1__["parseVizExpression"])(newExpression);
        }
        if (customizedFeatures[feature.id] && customizedFeatures[feature.id][propertyName]) {
            customizedFeatures[feature.id][propertyName].a.blendTo(newExpression, duration);
            return;
        }
        const blendExpr = Object(_core_viz_functions__WEBPACK_IMPORTED_MODULE_0__["blend"])(
            newExpression,
            viz[propertyName],
            Object(_core_viz_functions__WEBPACK_IMPORTED_MODULE_0__["blend"])(1, Object(_core_viz_functions__WEBPACK_IMPORTED_MODULE_0__["notEquals"])(Object(_core_viz_functions__WEBPACK_IMPORTED_MODULE_0__["property"])('cartodb_id'), feature.id), Object(_core_viz_functions__WEBPACK_IMPORTED_MODULE_0__["animate"])(duration))
        );
        trackFeatureViz(feature.id, propertyName, blendExpr, customizedFeatures);
        viz.replaceChild(
            viz[propertyName],
            blendExpr,
        );
        viz[propertyName].notify();
    };
}


/***/ }),

/***/ "./src/api/integrator/carto.js":
/*!*************************************!*\
  !*** ./src/api/integrator/carto.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return getCartoMapIntegrator; });
/* harmony import */ var _core_renderer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/renderer */ "./src/core/renderer.js");


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
        this.renderer = new _core_renderer__WEBPACK_IMPORTED_MODULE_0__["Renderer"]();
        this.renderer._initGL(this.map._gl);
        this.invalidateWebGLState = () => {};
    }

    addLayer(layerId, layer) {
        this.map.addLayer(layerId, layer);
    }
    needRefresh() {
    }
}


/***/ }),

/***/ "./src/api/integrator/mapbox-gl.js":
/*!*****************************************!*\
  !*** ./src/api/integrator/mapbox-gl.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return getMGLIntegrator; });
/* harmony import */ var mitt__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mitt */ "./node_modules/mitt/dist/mitt.es.js");
/* harmony import */ var _core_renderer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/renderer */ "./src/core/renderer.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util */ "./src/api/util.js");




let uid = 0;

// TODO This needs to be separated by each mgl map to support multi map pages
const integrators = new WeakMap();
function getMGLIntegrator(map) {
    if (!integrators.get(map)) {
        integrators.set(map, new MGLIntegrator(map));
    }
    return integrators.get(map);
}


/**
 * Responsabilities, keep all MGL integration state and functionality that lies outside Layer
 */
class MGLIntegrator {
    constructor(map) {
        this.renderer = new _core_renderer__WEBPACK_IMPORTED_MODULE_1__["Renderer"]();
        this.map = map;
        this.invalidateWebGLState = null;
        this._emitter = Object(mitt__WEBPACK_IMPORTED_MODULE_0__["default"])();


        this._suscribeToMapEvents(map);
        this.moveObservers = {};
        this._layers = [];
        this._paintedLayers = 0;
        this.invalidateWebGLState = () => { };
    }

    on(name, cb) {
        return this._emitter.on(name, cb);
    }

    off(name, cb) {
        return this._emitter.off(name, cb);
    }

    _suscribeToMapEvents(map) {
        map.on('movestart', this.move.bind(this));
        map.on('move', this.move.bind(this));
        map.on('moveend', this.move.bind(this));
        map.on('resize', this.move.bind(this));

        map.on('mousemove', data => {
            this._emitter.emit('mousemove', data);
        });
        map.on('click', data => {
            this._emitter.emit('click', data);
        });
    }

    _registerMoveObserver(observerName, observerCallback) {
        this.moveObservers[observerName] = observerCallback;
    }

    _unregisterMoveObserver(observerName) {
        delete this.moveObservers[observerName];
    }

    addLayer(layer, beforeLayerID) {
        const callbackID = `_cartovl_${uid++}`;
        const layerId = layer.getId();
        this._registerMoveObserver(callbackID, layer.requestData.bind(layer));
        let firstCallback = true;
        this.map.setCustomWebGLDrawCallback(layerId, (gl, invalidate) => {
            if (firstCallback) {
                firstCallback = false;
                this.invalidateWebGLState = invalidate;
                this.notifyObservers();
                this.renderer._initGL(gl);
                this._layers.map(layer => layer.initCallback());
            }
            layer.$paintCallback();
            this._paintedLayers++;

            if (this._paintedLayers % this._layers.length == 0) {
                // Last layer has been painted
                const isAnimated = this._layers.some(layer =>
                    layer.getViz() && layer.getViz().isAnimated());
                // Checking this.map.repaint is needed, because MGL repaint is a setter and it has the strange quite buggy side-effect of doing a "final" repaint after being disabled
                // if we disable it every frame, MGL will do a "final" repaint every frame, which will not disabled it in practice
                if (!isAnimated && this.map.repaint) {
                    this.map.repaint = false;
                }
            }

            invalidate();
        });
        this.map.addLayer({
            id: layerId,
            type: 'custom-webgl'
        }, beforeLayerID);
        this._layers.push(layer);
        this.move();
    }

    needRefresh() {
        this.map.repaint = true;
    }

    move() {
        const c = this.map.getCenter();
        // TODO create getCenter method
        this.renderer.setCenter(c.lng / 180., _util__WEBPACK_IMPORTED_MODULE_2__["projectToWebMercator"](c).y / _util__WEBPACK_IMPORTED_MODULE_2__["WM_R"]);
        this.renderer.setZoom(this.getZoom());
        this.notifyObservers();
    }

    notifyObservers() {
        Object.keys(this.moveObservers).map(id => this.moveObservers[id]());
    }

    getZoom() {
        const b = this.map.getBounds();
        const c = this.map.getCenter();
        const nw = b.getNorthWest();
        const sw = b.getSouthWest();
        const z = (_util__WEBPACK_IMPORTED_MODULE_2__["projectToWebMercator"](nw).y - _util__WEBPACK_IMPORTED_MODULE_2__["projectToWebMercator"](sw).y) / _util__WEBPACK_IMPORTED_MODULE_2__["WM_2R"];
        this.renderer.setCenter(c.lng / 180., _util__WEBPACK_IMPORTED_MODULE_2__["projectToWebMercator"](c).y / _util__WEBPACK_IMPORTED_MODULE_2__["WM_R"]);
        return z;
    }
}


/***/ }),

/***/ "./src/api/interactivity.js":
/*!**********************************!*\
  !*** ./src/api/interactivity.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Interactivity; });
/* harmony import */ var mitt__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mitt */ "./node_modules/mitt/dist/mitt.es.js");
/* harmony import */ var _layer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./layer */ "./src/api/layer.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util */ "./src/api/util.js");
/* harmony import */ var _client_rsys__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../client/rsys */ "./src/client/rsys.js");





/**
 *
 * FeatureEvent objects are fired by {@link carto.Interactivity|Interactivity} objects.
 *
 * @typedef {object} FeatureEvent
 * @property {object} coordinates - LongLat coordinates in { lng, lat } form
 * @property {object} position - Pixel coordinates in { x, y } form
 * @property {Feature[]} features - Array of {@link Feature}
 * @api
 */

/**
 * featureClick events are fired when the user clicks on features. The list of features behind the cursor is provided.
 *
 * @event featureClick
 * @type {FeatureEvent}
 * @api
 */

/**
 * featureClickOut events are fired when the user clicks outside a feature that was clicked in the last featureClick event.
 * The list of features that were clicked before and that are no longer behind this new click is provided.
 *
 * @event featureClickOut
 * @type {FeatureEvent}
 * @api
 */

/**
 * featureEnter events are fired when the user moves the cursor and the movement implies that a non-previously hovered feature (as reported by featureHover or featureLeave) is now under the cursor.
 * The list of features that are now behind the cursor and that weren't before is provided.
 *
 * @event featureEnter
 * @type {FeatureEvent}
 * @api
 */

/**
 * featureHover events are fired when the user moves the cursor.
 * The list of features behind the cursor is provided.
 *
 * @event featureHover
 * @type {FeatureEvent}
 * @api
 */

/**
 * featureLeave events are fired when the user moves the cursor and the movement implies that a previously hovered feature (as reported by featureHover or featureEnter) is no longer behind the cursor.
 * The list of features that are no longer behind the cursor and that were before is provided.
 *
 * @event featureLeave
 * @type {FeatureEvent}
 * @api
 */

const EVENTS = [
    'featureClick',
    'featureClickOut',
    'featureEnter',
    'featureHover',
    'featureLeave',
];

class Interactivity {
    /**
    *
    * Interactivity purpose is to allow the reception and management of user-generated events, like clicking, over layer features.
    *
    * To create a Interactivity object an array of {@link carto.Layer} is required.
    * Events fired from interactivity objects will refer to the features of these layers and only these layers.
    * Moreover, the order of the features in the events will be determined by the order of the layers in this list.
    *
    * @param {carto.Layer|carto.Layer[]} layerList - {@link carto.Layer} or array of {@link carto.Layer}, events will be fired based on the features of these layers. The array cannot be empty, and all the layers must be attached to the same map.
    * @param {object} [options={}] - Object containing interactivity options
    * @param {boolean} [options.autoChangePointer=true] - A boolean flag indicating if the cursor should change when the mouse is over a feature.
    * 
    * @example
    * const interactivity = new carto.Interactivity(layer);
    * interactivity.on('click', event => {
    *   style(event.features);
    *   show(event.coordinates);
    * });
    *
    * @fires featureClick
    * @fires featureClickOut
    * @fires featureHover
    * @fires featureEnter
    * @fires featureLeave
    * @fires CartoError
    *
    * @constructor Interactivity
    * @memberof carto
    * @api
    */
    constructor(layerList, options = { autoChangePointer: true }) {
        if (layerList instanceof _layer__WEBPACK_IMPORTED_MODULE_1__["default"]) {
            // Allow one layer as input
            layerList = [layerList];
        }
        preCheckLayerList(layerList);
        this._init(layerList, options);
    }

    /**
     * Register an event handler for the given type.
     *
     * @param {string} eventName - Type of event to listen for
     * @param {function} callback - Function to call in response to given event, function will be called with a {@link carto.FeatureEvent}
     * @memberof carto.Interactivity
     * @instance
     * @api
     */
    on(eventName, callback) {
        checkEvent(eventName);
        this._numListeners[eventName] = (this._numListeners[eventName] || 0) + 1;
        return this._emitter.on(eventName, callback);
    }

    /**
     * Remove an event handler for the given type.
     *
     * @param {string} eventName - Type of event to unregister
     * @param {function} callback - Handler function to unregister
     * @memberof carto.Interactivity
     * @instance
     * @api
     */
    off(eventName, callback) {
        checkEvent(eventName);
        this._numListeners[eventName] = this._numListeners[eventName] - 1;
        return this._emitter.off(eventName, callback);
    }

    _init(layerList, options) {
        this._emitter = Object(mitt__WEBPACK_IMPORTED_MODULE_0__["default"])();
        this._layerList = layerList;
        this._prevHoverFeatures = [];
        this._prevClickFeatures = [];
        this._numListeners = {};
        return Promise.all(layerList.map(layer => layer._context)).then(() => {
            postCheckLayerList(layerList);
            this._subscribeToIntegratorEvents(layerList[0].getIntegrator());
        }).then(() => {
            if (options.autoChangePointer) {
                this._setInteractiveCursor();
            }
        });
    }

    _setInteractiveCursor() {
        const map = this._layerList[0].getIntegrator().map; // All layers belong to the same map
        if (!map.__carto_interacivities) {
            map.__carto_interacivities = new Set();
        }
        this.on('featureHover', event => {
            if (event.features.length) {
                map.__carto_interacivities.add(this);
            } else {
                map.__carto_interacivities.delete(this);
            }
            map.getCanvas().style.cursor = (map.__carto_interacivities.size > 0) ? 'pointer' : '';
        });
    }

    _subscribeToIntegratorEvents(integrator) {
        integrator.on('mousemove', this._onMouseMove.bind(this));
        integrator.on('click', this._onClick.bind(this));
    }

    _onMouseMove(event) {
        if (!this._numListeners['featureEnter'] && !this._numListeners['featureHover'] && !this._numListeners['featureLeave']) {
            return;
        }

        const featureEvent = this._createFeatureEvent(event);
        const currentFeatures = featureEvent.features;

        // Manage enter/leave events
        const featuresLeft = this._getDiffFeatures(this._prevHoverFeatures, currentFeatures);
        const featuresEntered = this._getDiffFeatures(currentFeatures, this._prevHoverFeatures);

        if (featuresLeft.length > 0) {
            this._fireEvent('featureLeave', {
                coordinates: featureEvent.coordinates,
                position: featureEvent.position,
                features: featuresLeft
            });
        }

        if (featuresEntered.length > 0) {
            this._fireEvent('featureEnter', {
                coordinates: featureEvent.coordinates,
                position: featureEvent.position,
                features: featuresEntered
            });
        }

        this._prevHoverFeatures = featureEvent.features;

        // Launch hover event
        this._fireEvent('featureHover', featureEvent);
    }

    _onClick(event) {
        if (!this._numListeners['featureClick'] && !this._numListeners['featureClickOut']) {
            return;
        }

        const featureEvent = this._createFeatureEvent(event);
        const currentFeatures = featureEvent.features;

        // Manage clickOut event
        const featuresClickedOut = this._getDiffFeatures(this._prevClickFeatures, currentFeatures);

        if (featuresClickedOut.length > 0) {
            this._fireEvent('featureClickOut', {
                coordinates: featureEvent.coordinates,
                position: featureEvent.position,
                features: featuresClickedOut
            });
        }

        this._prevClickFeatures = featureEvent.features;

        // Launch click event
        this._fireEvent('featureClick', featureEvent);
    }

    _createFeatureEvent(eventData) {
        const features = this._getFeaturesAtPosition(eventData.lngLat);
        return {
            coordinates: eventData.lngLat,
            position: eventData.point,
            features
        };
    }

    _fireEvent(type, featureEvent) {
        this._emitter.emit(type, featureEvent);
    }

    _getFeaturesAtPosition(lngLat) {
        const wm = Object(_util__WEBPACK_IMPORTED_MODULE_2__["projectToWebMercator"])(lngLat);
        const nwmc = Object(_client_rsys__WEBPACK_IMPORTED_MODULE_3__["wToR"])(wm.x, wm.y, { scale: _util__WEBPACK_IMPORTED_MODULE_2__["WM_R"], center: { x: 0, y: 0 } });
        return [].concat(...this._layerList.map(layer => layer.getFeaturesAtPosition(nwmc)));
    }

    /**
     * Return the difference between the feature arrays A and B.
     * The output value is also an array of features.
     */
    _getDiffFeatures(featuresA, featuresB) {
        const IDs = this._getFeatureIDs(featuresB);
        return featuresA.filter(feature => !IDs.includes(feature.id));
    }

    _getFeatureIDs(features) {
        return features.map(feature => feature.id);
    }
}

function preCheckLayerList(layerList) {
    if (!Array.isArray(layerList)) {
        throw new Error('Invalid layer list, parameter must be an array of carto.Layer objects');
    }
    if (!layerList.length) {
        throw new Error('Invalid argument, layer list must not be empty');
    }
    if (!layerList.every(layer => layer instanceof _layer__WEBPACK_IMPORTED_MODULE_1__["default"])) {
        throw new Error('Invalid layer, layer must be an instance of carto.Layer');
    }
}
function postCheckLayerList(layerList) {
    if (!layerList.every(layer => layer.getIntegrator() == layerList[0].getIntegrator())) {
        throw new Error('Invalid argument, all layers must belong to the same map');
    }
}

function checkEvent(eventName) {
    if (!EVENTS.includes(eventName)) {
        throw new Error(`Unrecognized event: ${eventName}. Available events: ${EVENTS.join(', ')}`);
    }
}


/***/ }),

/***/ "./src/api/layer.js":
/*!**************************!*\
  !*** ./src/api/layer.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Layer; });
/* harmony import */ var mitt__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mitt */ "./node_modules/mitt/dist/mitt.es.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util */ "./src/api/util.js");
/* harmony import */ var _source_base__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./source/base */ "./src/api/source/base.js");
/* harmony import */ var _viz__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./viz */ "./src/api/viz.js");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./map */ "./src/api/map.js");
/* harmony import */ var _integrator_carto__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./integrator/carto */ "./src/api/integrator/carto.js");
/* harmony import */ var _integrator_mapbox_gl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./integrator/mapbox-gl */ "./src/api/integrator/mapbox-gl.js");
/* harmony import */ var _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./error-handling/carto-validation-error */ "./src/api/error-handling/carto-validation-error.js");
/* harmony import */ var _core_viz_functions__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/viz/functions */ "./src/core/viz/functions.js");
/* harmony import */ var _core_renderLayer__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/renderLayer */ "./src/core/renderLayer.js");











/**
 *
 * LayerEvent objects are fired by {@link carto.Layer|Layer} objects.
 *
 * @typedef {object} LayerEvent
 * @api
 */

/**
 * A loaded event is fired once the layer is firstly loaded. Loaded events won't be fired after the initial load.
 *
 * @event loaded
 * @type {LayerEvent}
 * @api
 */

/**
 * Updated events are fired every time that viz variables could have changed, like: map panning, map zooming, source data loading or viz changes.
 * This is useful to create external widgets that are refreshed reactively to changes in the CARTO VL map.
 *
 * @event updated
 * @type {LayerEvent}
 * @api
*/


/**
*
* A Layer is the primary way to visualize geospatial data.
*
* To create a layer a {@link carto.source.Base|source} and {@link carto.Viz|viz} are required:
*
* - The {@link carto.source.Base|source} is used to know **what** data will be displayed in the Layer.
* - The {@link carto.Viz|viz} is used to know **how** to draw the data in the Layer.
*
* @param {string} id - The ID of the layer. Can be used in the {@link addTo|addTo} function
* @param {carto.source.Base} source - The source of the data
* @param {carto.Viz} viz - The description of the visualization of the data
*
* @example
* const layer = new carto.Layer('layer0', source, viz);
*
* @fires CartoError
*
* @constructor Layer
* @memberof carto
* @api
*/
class Layer {
    constructor(id, source, viz) {
        this._checkId(id);
        this._checkSource(source);
        this._checkViz(viz);

        this._init(id, source, viz);
    }

    _init(id, source, viz) {
        viz._boundLayer = this;
        this.state = 'init';
        this._id = id;

        this._emitter = Object(mitt__WEBPACK_IMPORTED_MODULE_0__["default"])();
        this._lastViewport = null;
        this._lastMNS = null;
        this._integrator = null;
        this._context = new Promise((resolve) => {
            this._contextInitCallback = resolve;
        });
        this._integratorPromise = new Promise((resolve) => {
            this._integratorCallback = resolve;
        });

        this.metadata = null;
        this._renderLayer = new _core_renderLayer__WEBPACK_IMPORTED_MODULE_9__["default"]();
        this.state = 'init';
        this._isLoaded = false;
        this._isUpdated = false;

        this.update(source, viz);
    }

    /**
     * Register an event handler for the given event name. Valid names are: `loaded`, `updated`.
     *
     * @param {string} eventName - Type of event to listen for
     * @param {function} callback - Function to call in response to given event
     * @memberof carto.Layer
     * @instance
     * @api
     */
    on(eventName, callback) {
        return this._emitter.on(eventName, callback);
    }

    /**
     * Remove an event handler for the given type.
     *
     * @param {string} eventName - Type of event to unregister
     * @param {function} callback - Handler function to unregister
     * @memberof carto.Layer
     * @instance
     * @api
     */
    off(eventName, callback) {
        return this._emitter.off(eventName, callback);
    }

    /**
     * Add this layer to a map.
     *
     * @param {mapboxgl.Map} map - The map on which to add the layer
     * @param {string?} beforeLayerID - The ID of an existing layer to insert the new layer before. If this values is not passed the layer will be added on the top of the existing layers.
     * @memberof carto.Layer
     * @instance
     * @api
     */
    addTo(map, beforeLayerID) {
        if (this._isCartoMap(map)) {
            this._addToCartoMap(map, beforeLayerID);
        } else if (this._isMGLMap(map)) {
            this._addToMGLMap(map, beforeLayerID);
        } else {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_7__["default"]('layer', 'nonValidMap');
        }
    }

    /**
     * Update the layer with a new Source and a new Viz object, replacing the current ones. The update is done atomically, i.e.: the viz will be changed with the source, not before it.
     * This method will return a promise that will be resolved once the source and the visualization are validated.
     * The promise will be rejected if the validation fails, for example because the visualization expects a property name that is not present in the source.
     * The promise will be rejected also if this method is invoked again before the first promise is resolved.
     * If the promise is rejected the layer's source and viz won't be changed.
     * @param {carto.source.Base} source - the new Source object
     * @param {carto.Viz} viz - the new Viz object
     * @memberof carto.Layer
     * @async
     * @instance
     * @api
     */
    async update(source, viz) {
        this._checkSource(source);
        this._checkViz(viz);
        source = source._clone();
        this._atomicChangeUID = this._atomicChangeUID + 1 || 1;
        const uid = this._atomicChangeUID;
        const loadSpritesPromise = viz.loadSprites();
        const metadata = await source.requestMetadata(viz);
        await this._integratorPromise;
        await loadSpritesPromise;

        await this._context;
        if (this._atomicChangeUID > uid) {
            throw new Error('Another atomic change was done before this one committed');
        }

        // Everything was ok => commit changes
        this.metadata = metadata;

        viz.setDefaultsIfRequired(this.metadata.geomType);

        source.bindLayer(this._onDataframeAdded.bind(this), this._onDataFrameRemoved.bind(this), this._onDataLoaded.bind(this));
        if (this._source !== source) {
            this._freeSource();
        }
        this._source = source;
        this.requestData();

        await this._context;
        if (this._atomicChangeUID > uid) {
            throw new Error('Another atomic change was done before this one committed');
        }

        if (this._viz) {
            this._viz.onChange(null);
        }
        this._viz = viz;
        viz.onChange(this._vizChanged.bind(this));
        this._compileShaders(viz, metadata);
    }

    /**
     * Blend the current viz with another viz.
     *
     * This allows smooth transforms between two different vizs.
     *
     * @example <caption> Smooth transition variating point size </caption>
     * // We create two different vizs varying the width
     * const viz0 = new carto.Viz({ width: 10 });
     * const viz1 = new carto.Viz({ width: 20 });
     * // Create a layer with the first viz
     * const layer = new carto.Layer('layer', source, viz0);
     * // We add the layer to the map, the points in this layer will have widh 10
     * layer.addTo(map, 'layer0');
     * // The points will be animated from 10px to 20px for 500ms.
     * layer.blendToViz(viz1, 500);
     *
     * @param {carto.Viz} viz - The final viz
     * @param {number} [duration=400] - The animation duration in milliseconds
     *
     * @memberof carto.Layer
     * @instance
     * @api
     */
    async blendToViz(viz, ms = 400, interpolator = _core_viz_functions__WEBPACK_IMPORTED_MODULE_8__["cubic"]) {
        try {
            this._checkViz(viz);
            viz.setDefaultsIfRequired(this.metadata.geomType);
            if (this._viz) {
                Object.keys(this._viz.variables).map(varName => {
                    // If an existing variable is not re-declared we add it to the new viz
                    if (!viz.variables[varName]) {
                        viz.variables[varName] = this._viz.variables[varName];
                    }
                });

                Object.keys(viz.variables).map(varName => {
                    // If the variable existed, we need to blend it, nothing to do if not
                    if (this._viz.variables[varName]) {
                        viz.variables[varName]._blendFrom(this._viz.variables[varName], ms, interpolator);
                    }
                });

                viz.color._blendFrom(this._viz.color, ms, interpolator);
                viz.strokeColor._blendFrom(this._viz.strokeColor, ms, interpolator);
                viz.width._blendFrom(this._viz.width, ms, interpolator);
                viz.strokeWidth._blendFrom(this._viz.strokeWidth, ms, interpolator);
                viz.filter._blendFrom(this._viz.filter, ms, interpolator);
            }

            return this._vizChanged(viz).then(() => {
                if (this._viz) {
                    this._viz.onChange(null);
                }
                this._viz = viz;
                this._viz.onChange(this._vizChanged.bind(this));
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // The integrator will call this method once the webgl context is ready.
    initCallback() {
        this._renderLayer.renderer = this._integrator.renderer;
        this._contextInitCallback();
        this._renderLayer.dataframes.forEach(d => d.bind(this._integrator.renderer));
        this.requestMetadata();
    }

    async requestMetadata(viz) {
        viz = viz || this._viz;
        if (!viz) {
            return;
        }
        return this._source.requestMetadata(viz);
    }

    async requestData() {
        if (!this.metadata) {
            return;
        }
        this._source.requestData(this._getViewport());
        this._isUpdated = true;
    }

    hasDataframes() {
        return this._renderLayer.hasDataframes();
    }

    getId() {
        return this._id;
    }

    getSource() {
        return this._source;
    }

    getViz() {
        return this._viz;
    }

    getNumFeatures() {
        return this._renderLayer.getNumFeatures();
    }

    getIntegrator() {
        return this._integrator;
    }

    getFeaturesAtPosition(pos) {
        return this._renderLayer.getFeaturesAtPosition(pos).map(this._addLayerIdToFeature.bind(this));
    }

    $paintCallback() {
        if (this._viz && this._viz.colorShader) {
            this._renderLayer.viz = this._viz;
            this._integrator.renderer.renderLayer(this._renderLayer);
            if (this._viz.isAnimated() || this._isUpdated) {
                this._isUpdated = false;
                this._fire('updated');
            }
            if (!this._isLoaded && this.state == 'dataLoaded') {
                this._isLoaded = true;
                this._fire('loaded');
            }
        }
    }

    _fire(eventType, eventData) {
        try {
            return this._emitter.emit(eventType, eventData);
        } catch(err) {
            console.error(err);
        }
    }

    /**
     * Callback executed when the client adds a new dataframe
     * @param {Dataframe} dataframe
     */
    _onDataframeAdded(dataframe) {
        this._renderLayer.addDataframe(dataframe);
        this._integrator.invalidateWebGLState();
        this._integrator.needRefresh();
        this._isUpdated = true;
    }

    /**
     * Callback executed when the client removes dataframe
     * @param {Dataframe} dataframe
     */
    _onDataFrameRemoved(dataframe) {
        this._renderLayer.removeDataframe(dataframe);
        this._integrator.invalidateWebGLState();
        this._integrator.needRefresh();
    }

    /**
     * Callback executed when the client finishes loading data
     */
    _onDataLoaded() {
        this.state = 'dataLoaded';
        this._integrator.needRefresh();
    }

    _addLayerIdToFeature(feature) {
        feature.layerId = this._id;
        return feature;
    }

    _isCartoMap(map) {
        return map instanceof _map__WEBPACK_IMPORTED_MODULE_4__["default"];
    }

    _isMGLMap() {
        // TODO: implement this
        return true;
    }

    _addToCartoMap(map, beforeLayerID) {
        this._integrator = Object(_integrator_carto__WEBPACK_IMPORTED_MODULE_5__["default"])(map);
        this._integrator.addLayer(this, beforeLayerID);
        this._integratorCallback(this._integrator);
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
        this._integrator = Object(_integrator_mapbox_gl__WEBPACK_IMPORTED_MODULE_6__["default"])(map);
        this._integrator.addLayer(this, beforeLayerID);
        this._integratorCallback(this._integrator);
    }

    _compileShaders(viz, metadata) {
        viz.compileShaders(this._integrator.renderer.gl, metadata);
    }

    async _vizChanged(viz) {
        await this._context;
        if (!this._source) {
            throw new Error('A source is required before changing the viz');
        }
        const source = this._source;
        const loadSpritesPromise = viz.loadSprites();
        const metadata = await source.requestMetadata(viz);
        await loadSpritesPromise;

        if (this._source !== source) {
            throw new Error('A source change was made before the metadata was retrieved, therefore, metadata is stale and it cannot be longer consumed');
        }
        this.metadata = metadata;
        this._compileShaders(viz, this.metadata);
        this._integrator.needRefresh();
        return this.requestData();
    }

    _checkId(id) {
        if (_util__WEBPACK_IMPORTED_MODULE_1__["isUndefined"](id)) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_7__["default"]('layer', 'idRequired');
        }
        if (!_util__WEBPACK_IMPORTED_MODULE_1__["isString"](id)) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_7__["default"]('layer', 'idStringRequired');
        }
        if (id === '') {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_7__["default"]('layer', 'nonValidId');
        }
    }

    _checkSource(source) {
        if (_util__WEBPACK_IMPORTED_MODULE_1__["isUndefined"](source)) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_7__["default"]('layer', 'sourceRequired');
        }
        if (!(source instanceof _source_base__WEBPACK_IMPORTED_MODULE_2__["default"])) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_7__["default"]('layer', 'nonValidSource');
        }
    }

    _checkViz(viz) {
        if (_util__WEBPACK_IMPORTED_MODULE_1__["isUndefined"](viz)) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_7__["default"]('layer', 'vizRequired');
        }
        if (!(viz instanceof _viz__WEBPACK_IMPORTED_MODULE_3__["default"])) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_7__["default"]('layer', 'nonValidViz');
        }
        if (viz._boundLayer && viz._boundLayer !== this) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_7__["default"]('layer', 'sharedViz');
        }
    }

    _getViewport() {
        if (this._integrator) {
            return this._integrator.renderer.getBounds();
        }
    }

    _freeSource() {
        if (this._source) {
            this._source.free();
        }
        this._renderLayer.freeDataframes();
    }
}


/***/ }),

/***/ "./src/api/map.js":
/*!************************!*\
  !*** ./src/api/map.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Map; });
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
        this.invalidateWebGLState = () => { };
        this._canvas = this._createCanvas();
        this._container.appendChild(this._canvas);
        this._gl = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');

        this._resizeCanvas(this._containerDimensions());
    }

    addLayer(layer, beforeLayerID) {
        layer.initCallback();

        let index;
        for (index = 0; index < this._layers.length; index++) {
            if (this._layers[index].getId() === beforeLayerID) {
                break;
            }
        }
        this._layers.splice(index, 0, layer);

        window.requestAnimationFrame(this.update.bind(this));
    }

    update(timestamp) {
        // Don't re-render more than once per animation frame
        if (this.lastFrame === timestamp) {
            return;
        }
        this.lastFrame = timestamp;

        this._drawBackground(this._background);

        let loaded = true;
        let animated = false;
        this._layers.forEach((layer) => {
            const hasData = layer.hasDataframes();
            const hasAnimation = layer.getViz() && layer.getViz().isAnimated();
            if (hasData || hasAnimation) {
                layer.$paintCallback();
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


/***/ }),

/***/ "./src/api/setup/auth-service.js":
/*!***************************************!*\
  !*** ./src/api/setup/auth-service.js ***!
  \***************************************/
/*! exports provided: setDefaultAuth, getDefaultAuth, checkAuth, cleanDefaultAuth */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setDefaultAuth", function() { return setDefaultAuth; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDefaultAuth", function() { return getDefaultAuth; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkAuth", function() { return checkAuth; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cleanDefaultAuth", function() { return cleanDefaultAuth; });
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util */ "./src/api/util.js");
/* harmony import */ var _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../error-handling/carto-validation-error */ "./src/api/error-handling/carto-validation-error.js");



let defaultAuth = undefined;

/**
 * Set default authentication parameters: user and apiKey.
 *
 * @param {object} auth
 * @param {string} auth.user - Name of the user
 * @param {string} auth.apiKey - API key used to authenticate against CARTO
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
    if (_util__WEBPACK_IMPORTED_MODULE_0__["isUndefined"](auth)) {
        throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_1__["default"]('setup', 'authRequired');
    }
    if (!_util__WEBPACK_IMPORTED_MODULE_0__["isObject"](auth)) {
        throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_1__["default"]('setup', 'authObjectRequired');
    }
    auth.username = auth.user; // API adapter
    checkApiKey(auth.apiKey);
    checkUsername(auth.username);
}

function checkApiKey(apiKey) {
    if (_util__WEBPACK_IMPORTED_MODULE_0__["isUndefined"](apiKey)) {
        throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_1__["default"]('setup', 'apiKeyRequired');
    }
    if (!_util__WEBPACK_IMPORTED_MODULE_0__["isString"](apiKey)) {
        throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_1__["default"]('setup', 'apiKeyStringRequired');
    }
    if (apiKey === '') {
        throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_1__["default"]('setup', 'nonValidApiKey');
    }
}

function checkUsername(username) {
    if (_util__WEBPACK_IMPORTED_MODULE_0__["isUndefined"](username)) {
        throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_1__["default"]('setup', 'usernameRequired');
    }
    if (!_util__WEBPACK_IMPORTED_MODULE_0__["isString"](username)) {
        throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_1__["default"]('setup', 'usernameStringRequired');
    }
    if (username === '') {
        throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_1__["default"]('setup', 'nonValidUsername');
    }
}




/***/ }),

/***/ "./src/api/setup/config-service.js":
/*!*****************************************!*\
  !*** ./src/api/setup/config-service.js ***!
  \*****************************************/
/*! exports provided: setDefaultConfig, getDefaultConfig, checkConfig, cleanDefaultConfig */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setDefaultConfig", function() { return setDefaultConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDefaultConfig", function() { return getDefaultConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkConfig", function() { return checkConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cleanDefaultConfig", function() { return cleanDefaultConfig; });
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util */ "./src/api/util.js");
/* harmony import */ var _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../error-handling/carto-validation-error */ "./src/api/error-handling/carto-validation-error.js");



let defaultConfig = undefined;

/**
 * Set default configuration parameters
 *
 * @param {object} config
 * @param {string} config.serverURL='https://{user}.carto.com' - Template URL of the CARTO Maps API server
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
        if (!_util__WEBPACK_IMPORTED_MODULE_0__["isObject"](config)) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_1__["default"]('setup', 'configObjectRequired');
        }
        _checkServerURL(config.serverURL);
    }
}

function _checkServerURL(serverURL) {
    if (!_util__WEBPACK_IMPORTED_MODULE_0__["isString"](serverURL)) {
        throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_1__["default"]('setup', 'serverURLStringRequired');
    }
}




/***/ }),

/***/ "./src/api/source/base-windshaft.js":
/*!******************************************!*\
  !*** ./src/api/source/base-windshaft.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BaseWindshaft; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/api/source/base.js");
/* harmony import */ var _client_windshaft__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../client/windshaft */ "./src/client/windshaft.js");
/* harmony import */ var _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../error-handling/carto-validation-error */ "./src/api/error-handling/carto-validation-error.js");
/* harmony import */ var _setup_auth_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../setup/auth-service */ "./src/api/setup/auth-service.js");
/* harmony import */ var _setup_config_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../setup/config-service */ "./src/api/setup/config-service.js");






const DEFAULT_SERVER_URL_TEMPLATE = 'https://{user}.carto.com';

class BaseWindshaft extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {

    constructor() {
        super();
        this._client = new _client_windshaft__WEBPACK_IMPORTED_MODULE_1__["default"](this);
    }

    initialize(auth, config) {
        this._auth = auth || Object(_setup_auth_service__WEBPACK_IMPORTED_MODULE_3__["getDefaultAuth"])();
        this._config = config || Object(_setup_config_service__WEBPACK_IMPORTED_MODULE_4__["getDefaultConfig"])();
        Object(_setup_auth_service__WEBPACK_IMPORTED_MODULE_3__["checkAuth"])(this._auth);
        Object(_setup_config_service__WEBPACK_IMPORTED_MODULE_4__["checkConfig"])(this._config);
        this._apiKey = this._auth.apiKey;
        this._username = this._auth.username;
        this._serverURL = this._generateURL(this._auth, this._config);
    }

    bindLayer(...args) {
        this._client._bindLayer(...args);
    }

    requestMetadata(viz) {
        return this._client.getMetadata(viz);
    }

    requestData(viewport) {
        return this._client.getData(viewport);
    }

    free() {
        this._client.free();
    }

    _generateURL(auth, config) {
        let url = (config && config.serverURL) || DEFAULT_SERVER_URL_TEMPLATE;
        url = url.replace(/{user}/, auth.username);
        this._validateServerURL(url.replace(/{local}/, ''));
        return {
            maps: url.replace(/{local}/, ':8181'),
            sql:  url.replace(/{local}/, ':8080')
        };
    }

    _validateServerURL(serverURL) {
        let urlregex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
        if (!serverURL.match(urlregex)) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_2__["default"]('source', 'nonValidServerURL');
        }
    }
}


/***/ }),

/***/ "./src/api/source/base.js":
/*!********************************!*\
  !*** ./src/api/source/base.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Base; });
class Base {

    /**
     * Base data source object.
     *
     * The methods listed in the {@link carto.source.Base} object are available in all source objects.
     *
     * Use a source to reference the data used in a {@link carto.layer.Base|layer}.
     *
     * {@link carto.source.Base} should not be used directly use {@link carto.source.Dataset}, {@link carto.source.SQL} of {@link carto.source.GeoJSON} instead.
     *
     *
     * @memberof carto.source
     * @constructor Base
     * @abstract
     * @api
     */
    constructor() {
    }
}


/***/ }),

/***/ "./src/api/source/dataset.js":
/*!***********************************!*\
  !*** ./src/api/source/dataset.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Dataset; });
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util */ "./src/api/util.js");
/* harmony import */ var _base_windshaft__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base-windshaft */ "./src/api/source/base-windshaft.js");
/* harmony import */ var _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../error-handling/carto-validation-error */ "./src/api/error-handling/carto-validation-error.js");




class Dataset extends _base_windshaft__WEBPACK_IMPORTED_MODULE_1__["default"] {

    /**
     * A dataset defines the data that will be displayed in a layer and is equivalent
     * to a table in the server.
     *
     * If you have a table named `european_cities` in your CARTO account you could load all the
     * data in a layer using a `carto.source.Dataset`.
     *
     * If you want to load data applying a SQL query see {@link carto.source.SQL|carto.source.SQL}.
     *
     * Since tables in the server are protected you must provide valid credentials in order to get access to the data.
     * This can be done {@link carto.setDefaultAuth|setting the default auth} in the carto object or providing an `auth`
     * object with your username and apiKey.
     *
     * If your server is not hosted by CARTO you must add a third parameter that includes the serverURL. This can be done {@link carto.setDefaultConfig|setting the default config} in the carto object or providing a `config`
     * object with your serverURL.
     *
     * @param {string} tableName - The name of an existing table
     * @param {object} auth
     * @param {string} auth.apiKey - API key used to authenticate against CARTO
     * @param {string} auth.user - Name of the user
     * @param {object} config
     * @param {string} [config.serverURL='https://{user}.carto.com'] - URL of the CARTO Maps API server
     *
     * @example
     * const source = new carto.source.Dataset('european_cities', {
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

    _clone() {
        return new Dataset(this._tableName, this._auth, this._config);
    }

    _checkTableName(tableName) {
        if (_util__WEBPACK_IMPORTED_MODULE_0__["isUndefined"](tableName)) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_2__["default"]('source', 'tableNameRequired');
        }
        if (!_util__WEBPACK_IMPORTED_MODULE_0__["isString"](tableName)) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_2__["default"]('source', 'tableNameStringRequired');
        }
        if (tableName === '') {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_2__["default"]('source', 'nonValidTableName');
        }
    }
}


/***/ }),

/***/ "./src/api/source/geojson.js":
/*!***********************************!*\
  !*** ./src/api/source/geojson.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return GeoJSON; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/api/source/base.js");
/* harmony import */ var _core_renderer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/renderer */ "./src/core/renderer.js");
/* harmony import */ var _client_rsys__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../client/rsys */ "./src/client/rsys.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../util */ "./src/api/util.js");
/* harmony import */ var _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../error-handling/carto-validation-error */ "./src/api/error-handling/carto-validation-error.js");
/* harmony import */ var _core_metadata__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../core/metadata */ "./src/core/metadata.js");







const SAMPLE_TARGET_SIZE = 1000;

class GeoJSON extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {

    /**
     * Create a carto.source.GeoJSON source from a GeoJSON object.
     *
     * @param {object} data - A GeoJSON data object
     * @param {object} options - Options
     * @param {array<string>} options.dateColumns - List of columns that contain dates. 
     *
     * @example
     * const source = new carto.source.GeoJSON({
     *   "type": "Feature",
     *   "geometry": {
     *     "type": "Point",
     *     "coordinates": [ 0, 0 ]
     *   },
     *   "properties": {
     *     "index": 1
     *   }
     * });
     *
     * @fires CartoError
     *
     * @constructor GeoJSON
     * @extends carto.source.Base
     * @memberof carto.source
     * @api
     */
    constructor(data, options = {}) {
        super();
        this._checkData(data);

        this._type = ''; // Point, LineString, MultiLineString, Polygon, MultiPolygon
        this._categoryStringToIDMap = {};
        this._numCategories = 0;
        this._numFields = new Set();
        this._catFields = new Set();
        this._dateFields = new Set();
        this._providedDateColumns = new Set(options.dateColumns);
        this._columns = [];
        this._categoryIDs = {};
        this._boundColumns = new Set();

        this._data = data;
        if (data.type === 'FeatureCollection') {
            this._features = data.features;
        } else if (data.type === 'Feature') {
            this._features = [data];
        } else {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_4__["default"]('source', 'nonValidGeoJSONData');
        }
    }

    bindLayer(addDataframe, removeDataframe, dataLoadedCallback) {
        this._addDataframe = addDataframe;
        this._removeDataframe = removeDataframe;
        this._dataLoadedCallback = dataLoadedCallback;
    }

    requestMetadata(viz) {
        return Promise.resolve(this._computeMetadata(viz));
    }

    requestData() {
        if (this._dataframe) {
            const newProperties = this._decodeUnboundProperties();
            this._dataframe.addProperties(newProperties);
            Object.keys(newProperties).forEach(propertyName => {
                this._boundColumns.add(propertyName);
            });
            return;
        }
        const dataframe = new _core_renderer__WEBPACK_IMPORTED_MODULE_1__["Dataframe"]({
            active: true,
            center: { x: 0, y: 0 },
            geom: this._decodeGeometry(),
            properties: this._decodeUnboundProperties(),
            scale: 1,
            size: this._features.length,
            type: this._getDataframeType(this._type),
            metadata: this._metadata,
        });
        this._boundColumns = new Set(Object.keys(dataframe.properties));
        this._dataframe = dataframe;
        this._addDataframe(dataframe);
        this._dataLoadedCallback();
    }

    _clone() {
        return new GeoJSON(this._data, { dateColumns: Array.from(this._providedDateColumns) });
    }

    _checkData(data) {
        if (_util__WEBPACK_IMPORTED_MODULE_3__["isUndefined"](data)) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_4__["default"]('source', 'dataRequired');
        }
        if (!_util__WEBPACK_IMPORTED_MODULE_3__["isObject"](data)) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_4__["default"]('source', 'dataObjectRequired');
        }
    }

    _computeMetadata(viz) {
        const sample = [];
        this._addNumericColumnField('cartodb_id');

        const featureCount = this._features.length;
        const requiredColumns = new Set(viz.getMinimumNeededSchema().columns);
        for (let i = 0; i < this._features.length; i++) {
            const properties = this._features[i].properties;
            const keys = Object.keys(properties);
            for (let j = 0, len = keys.length; j < len; j++) {
                const name = keys[j];
                if (!requiredColumns.has(name) || this._boundColumns.has(name)) {
                    continue;
                }
                const value = properties[name];
                this._addPropertyToMetadata(name, value);
            }
            this._sampleFeatureOnMetadata(properties, sample, this._features.length);
        }

        this._numFields.forEach(name => {
            const column = this._columns.find(c => c.name == name);
            column.avg = column.sum / column.count;
        });
        this._catFields.forEach(name => {
            if (!this._boundColumns.has(name)) {
                const column = this._columns.find(c => c.name == name);
                column.categoryNames = [...column.categoryNames];
                column.categoryNames.forEach(name => this._categoryIDs[name] = this._getCategoryIDFromString(name));
            }
        });

        let geomType = '';
        if (featureCount > 0) {
            // Set the geomType of the first feature to the metadata
            geomType = this._getDataframeType(this._features[0].geometry.type);
        }

        this._metadata = new _core_metadata__WEBPACK_IMPORTED_MODULE_5__["default"](this._categoryIDs, this._columns, featureCount, sample, geomType);

        return this._metadata;
    }

    _sampleFeatureOnMetadata(properties, sample, featureCount) {
        if (featureCount > SAMPLE_TARGET_SIZE) {
            const sampling = SAMPLE_TARGET_SIZE / featureCount;
            if (Math.random() > sampling) {
                return;
            }
        }
        sample.push(properties);
    }

    _addNumericPropertyToMetadata(propertyName, value) {
        if (this._catFields.has(propertyName) || this._dateFields.has(propertyName)) {
            throw new Error(`Unsupported GeoJSON: the property '${propertyName}' has different types in different features.`);
        }
        this._addNumericColumnField(propertyName, this._columns);
        const column = this._columns.find(c => c.name == propertyName);
        column.min = Math.min(column.min, value);
        column.max = Math.max(column.max, value);
        column.sum += value;
        column.count++;
    }

    _addNumericColumnField(propertyName) {
        if (!this._numFields.has(propertyName)) {
            this._numFields.add(propertyName);
            this._columns.push({
                name: propertyName,
                type: 'number',
                min: Number.POSITIVE_INFINITY,
                max: Number.NEGATIVE_INFINITY,
                avg: Number.NaN,
                sum: 0,
                count: 0
            });
        }
    }

    _addDatePropertyToMetadata(propertyName, value) {
        if (this._catFields.has(propertyName) || this._numFields.has(propertyName)) {
            throw new Error(`Unsupported GeoJSON: the property '${propertyName}' has different types in different features.`);
        }
        this._addDateColumnField(propertyName, this._columns);
        const column = this._columns.find(c => c.name == propertyName);
        const dateValue = _util__WEBPACK_IMPORTED_MODULE_3__["castDate"](value);
        column.min = column.min ? _util__WEBPACK_IMPORTED_MODULE_3__["castDate"](Math.min(column.min, dateValue)) : dateValue;
        column.max = column.max ? _util__WEBPACK_IMPORTED_MODULE_3__["castDate"](Math.max(column.max, dateValue)) : dateValue;
        column.sum += value;
        column.count++;
    }

    _addDateColumnField(propertyName) {
        if (!this._dateFields.has(propertyName)) {
            this._dateFields.add(propertyName);
            this._columns.push({
                name: propertyName,
                type: 'date',
                min: null,
                max: null,
                avg: null,
                sum: 0,
                count: 0
            });
        }
    }

    _addPropertyToMetadata(propertyName, value) {
        if (this._providedDateColumns.has(propertyName)) {
            return this._addDatePropertyToMetadata(propertyName, value);
        }
        if (Number.isFinite(value)) {
            return this._addNumericPropertyToMetadata(propertyName, value);
        }
        this._addCategoryPropertyToMetadata(propertyName, value);
    }

    _addCategoryPropertyToMetadata(propertyName, value) {
        if (this._numFields.has(propertyName) || this._dateFields.has(propertyName)) {
            throw new Error(`Unsupported GeoJSON: the property '${propertyName}' has different types in different features.`);
        }
        if (!this._catFields.has(propertyName)) {
            this._catFields.add(propertyName);
            this._columns.push({
                name: propertyName,
                type: 'category',
                categoryNames: new Set(),
            });
        }
        const column = this._columns.find(c => c.name == propertyName);
        column.categoryNames.add(value);
    }

    _decodeUnboundProperties() {
        const properties = {};
        [...this._numFields].concat([...this._catFields]).concat([...this._dateFields]).map(name => {
            if (this._boundColumns.has(name)) {
                return;
            }
            // The dataframe expects to have a padding of 1024, adding 1024 empty values assures this condition is met
            properties[name] = new Float32Array(this._features.length + 1024);
        });

        const catFields = [...this._catFields].filter(name => !this._boundColumns.has(name));
        const numFields = [...this._numFields].filter(name => !this._boundColumns.has(name));
        const dateFields = [...this._dateFields].filter(name => !this._boundColumns.has(name));
        
        for (let i = 0; i < this._features.length; i++) {
            const f = this._features[i];

            catFields.forEach(name => {
                properties[name][i] = this._getCategoryIDFromString(f.properties[name]);
            });
            numFields.forEach(name => {
                if (name === 'cartodb_id' && !Number.isFinite(f.properties.cartodb_id)) {
                    // Using negative ids for GeoJSON features
                    f.properties.cartodb_id = -i;
                }
                properties[name][i] = Number(f.properties[name]);
            });
            dateFields.forEach(name => {
                const column = this._columns.find(c => c.name == name);
                // dates in Dataframes are mapped to [0,1] to maximize precision
                const d = _util__WEBPACK_IMPORTED_MODULE_3__["castDate"](f.properties[name]).getTime();
                const min = column.min;
                const max = column.max;
                const n = (d - min.getTime()) / (max.getTime() - min.getTime());
                properties[name][i] = n;
            });
        }
        return properties;
    }

    _getCategoryIDFromString(category) {
        if (this._categoryStringToIDMap[category] !== undefined) {
            return this._categoryStringToIDMap[category];
        }
        this._categoryStringToIDMap[category] = this._numCategories;
        this._numCategories++;
        return this._categoryStringToIDMap[category];
    }

    _getDataframeType(type) {
        switch (type) {
            case 'Point':
                return 'point';
            case 'LineString':
            case 'MultiLineString':
                return 'line';
            case 'Polygon':
            case 'MultiPolygon':
                return 'polygon';
            default:
                return '';
        }
    }

    _decodeGeometry() {
        let geometry = null;
        const numFeatures = this._features.length;
        for (let i = 0; i < numFeatures; i++) {
            const feature = this._features[i];
            if (feature.type === 'Feature') {
                const type = feature.geometry.type;
                const coordinates = feature.geometry.coordinates;
                if (!this._type) {
                    this._type = type;
                } else if (this._type !== type) {
                    throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_4__["default"]('source', `multipleFeatureTypes[${this._type}, ${type}]`);
                }
                if (type === 'Point') {
                    if (!geometry) {
                        geometry = new Float32Array(numFeatures * 2);
                    }
                    const point = this._computePointGeometry(coordinates);
                    geometry[2 * i + 0] = point.x;
                    geometry[2 * i + 1] = point.y;
                }
                else if (type === 'LineString') {
                    if (!geometry) {
                        geometry = [];
                    }
                    const line = this._computeLineStringGeometry(coordinates);
                    geometry.push([line]);
                }
                else if (type === 'MultiLineString') {
                    if (!geometry) {
                        geometry = [];
                    }
                    const multiline = this._computeMultiLineStringGeometry(coordinates);
                    geometry.push(multiline);
                }
                else if (type === 'Polygon') {
                    if (!geometry) {
                        geometry = [];
                    }
                    const polygon = this._computePolygonGeometry(coordinates);
                    geometry.push([polygon]);
                }
                else if (type === 'MultiPolygon') {
                    if (!geometry) {
                        geometry = [];
                    }
                    const multipolygon = this._computeMultiPolygonGeometry(coordinates);
                    geometry.push(multipolygon);
                }
            }
        }
        return geometry;
    }

    _computePointGeometry(data) {
        const lat = data[1];
        const lng = data[0];
        const wm = _util__WEBPACK_IMPORTED_MODULE_3__["projectToWebMercator"]({ lat, lng });
        return _client_rsys__WEBPACK_IMPORTED_MODULE_2__["wToR"](wm.x, wm.y, { scale: _util__WEBPACK_IMPORTED_MODULE_3__["WM_R"], center: { x: 0, y: 0 } });
    }

    _computeLineStringGeometry(data) {
        let line = [];
        for (let i = 0; i < data.length; i++) {
            const point = this._computePointGeometry(data[i]);
            line.push(point.x, point.y);
        }
        return line;
    }

    _computeMultiLineStringGeometry(data) {
        let multiline = [];
        for (let i = 0; i < data.length; i++) {
            let line = this._computeLineStringGeometry(data[i]);
            if (line.length > 0) {
                multiline.push(line);
            }
        }
        return multiline;
    }

    _computePolygonGeometry(data) {
        let polygon = {
            flat: [],
            holes: [],
            clipped: []
        };
        let holeIndex = 0;
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                const point = this._computePointGeometry(data[i][j]);
                polygon.flat.push(point.x, point.y);
            }
            if (!this._isClockWise(data[i])) {
                if (i > 0) {
                    holeIndex += data[i - 1].length;
                    polygon.holes.push(holeIndex);
                } else {
                    throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_4__["default"]('source', 'firstPolygonExternal');
                }
            }
        }
        return polygon;
    }

    _computeMultiPolygonGeometry(data) {
        let multipolygon = [];
        for (let i = 0; i < data.length; i++) {
            let polygon = this._computePolygonGeometry(data[i]);
            if (polygon.flat.length > 0) {
                multipolygon.push(polygon);
            }
        }
        return multipolygon;
    }

    _isClockWise(vertices) {
        let total = 0;
        let pt1 = vertices[0], pt2;
        for (let i = 0; i < vertices.length - 1; i++) {
            pt2 = vertices[i + 1];
            total += (pt2[1] - pt1[1]) * (pt2[0] + pt1[0]);
            pt1 = pt2;
        }
        return total >= 0;
    }

    free() {
    }
}


/***/ }),

/***/ "./src/api/source/sql.js":
/*!*******************************!*\
  !*** ./src/api/source/sql.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return SQL; });
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util */ "./src/api/util.js");
/* harmony import */ var _base_windshaft__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base-windshaft */ "./src/api/source/base-windshaft.js");
/* harmony import */ var _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../error-handling/carto-validation-error */ "./src/api/error-handling/carto-validation-error.js");




class SQL extends _base_windshaft__WEBPACK_IMPORTED_MODULE_1__["default"] {

    /**
     * A SQL defines the data that will be displayed in a layer.
     *
     * Imagine you have a table named `european_cities` and you only want to download data from european cities with population > 100000
     *
     * ```javascript
     * const source = new carto.source.SQL(`SELECT * FROM european_cities WHERE country like 'europe' AND population > 10000`, {
     *   apiKey: 'YOUR_API_KEY_HERE',
     *   user: 'YOUR_USERNAME_HERE'
     * });
     * ````
     *
     * This only downloads the data you need from the server reducing data usage.
     *
     * If you need all the data see {@link carto.source.Dataset|carto.source.Dataset}.
     *
     * Since tables in the server are protected you must provide valid credentials in order to get access to the data.
     * This can be done {@link carto.setDefaultAuth|setting the default auth} in the carto object or providing an `auth`
     * object with your username and apiKey.
     *
     * If your server is not hosted by CARTO you must add a third parameter that includes the serverURL. This can be done {@link carto.setDefaultConfig|setting the default config} in the carto object or providing a `config`
     * object with your serverURL.
     *
     * @param {string} query - A SQL query containing a SELECT statement
     * @param {object} auth
     * @param {string} auth.apiKey - API key used to authenticate against CARTO
     * @param {string} auth.user - Name of the user
     * @param {object} config
     * @param {string} [config.serverURL='https://{user}.carto.com'] - URL of the CARTO Maps API server
     *
     * @example
     * const source = new carto.source.SQL('SELECT * FROM european_cities', {
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

    _clone() {
        return new SQL(this._query, this._auth, this._config);
    }

    _checkQuery(query) {
        if (_util__WEBPACK_IMPORTED_MODULE_0__["isUndefined"](query)) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_2__["default"]('source', 'queryRequired');
        }
        if (!_util__WEBPACK_IMPORTED_MODULE_0__["isString"](query)) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_2__["default"]('source', 'queryStringRequired');
        }
        if (query === '') {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_2__["default"]('source', 'nonValidQuery');
        }
        let sqlRegex = /\bSELECT\b/i;
        if (!query.match(sqlRegex)) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_2__["default"]('source', 'nonValidSQLQuery');
        }
    }
}


/***/ }),

/***/ "./src/api/util.js":
/*!*************************!*\
  !*** ./src/api/util.js ***!
  \*************************/
/*! exports provided: WM_R, WM_2R, projectToWebMercator, isUndefined, isString, isNumber, isObject, castDate */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WM_R", function() { return WM_R; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WM_2R", function() { return WM_2R; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "projectToWebMercator", function() { return projectToWebMercator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isUndefined", function() { return isUndefined; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isString", function() { return isString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNumber", function() { return isNumber; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isObject", function() { return isObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "castDate", function() { return castDate; });
/**
 * Export util functions
 */

const DEG2RAD = Math.PI / 180;
const EARTH_RADIUS = 6378137;
const WM_R = EARTH_RADIUS * Math.PI; // Webmercator *radius*: half length Earth's circumference
const WM_2R = WM_R * 2; // Webmercator coordinate range (Earth's circumference)

function projectToWebMercator(latLng) {
    let lat = latLng.lat * DEG2RAD;
    let lng = latLng.lng * DEG2RAD;
    let x = lng * EARTH_RADIUS;
    let y = Math.log(Math.tan(lat / 2 + Math.PI / 4)) * EARTH_RADIUS;
    return { x, y };
}

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
/**
 * Transform the given parameter into a Date object.
 * When a number is given as a parameter is asummed to be a milliseconds epoch.
 * @param {Date|number|string} date 
 */
function castDate(date) {
    if (date instanceof Date) {
        return date;
    }
    if (typeof (date) === 'number') {
        const msEpoch = date;
        date = new Date(0);
        date.setUTCMilliseconds(msEpoch);
        return date;
    }
    return new Date(date);
}




/***/ }),

/***/ "./src/api/viz.js":
/*!************************!*\
  !*** ./src/api/viz.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Viz; });
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util */ "./src/api/util.js");
/* harmony import */ var _core_viz_functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/viz/functions */ "./src/core/viz/functions.js");
/* harmony import */ var _core_schema__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/schema */ "./src/core/schema.js");
/* harmony import */ var _core_shaders__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/shaders */ "./src/core/shaders/index.js");
/* harmony import */ var _core_viz_shader_compiler__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/viz/shader-compiler */ "./src/core/viz/shader-compiler.js");
/* harmony import */ var _core_viz_parser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/viz/parser */ "./src/core/viz/parser.js");
/* harmony import */ var _core_viz_expressions_base__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/viz/expressions/base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _core_viz_expressions_utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/viz/expressions/utils */ "./src/core/viz/expressions/utils.js");
/* harmony import */ var _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./error-handling/carto-validation-error */ "./src/api/error-handling/carto-validation-error.js");
/* harmony import */ var _core_shaders_symbolizer__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/shaders/symbolizer */ "./src/core/shaders/symbolizer.js");











const DEFAULT_COLOR_EXPRESSION = () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["rgb"](0, 0, 0));
const DEFAULT_WIDTH_EXPRESSION = () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["number"](1));
const DEFAULT_STROKE_COLOR_EXPRESSION = () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["rgb"](0, 0, 0));
const DEFAULT_STROKE_WIDTH_EXPRESSION = () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["number"](0));
const DEFAULT_ORDER_EXPRESSION = () => _core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["noOrder"]();
const DEFAULT_FILTER_EXPRESSION = () => _core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["constant"](1);
const DEFAULT_SYMBOL_EXPRESSION = () => { const expr = _core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["FALSE"]; expr._default = true; return expr; };
const DEFAULT_SYMBOLPLACEMENT_EXPRESSION = () => _core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["ALIGN_BOTTOM"];
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

class Viz {

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
    * @property {Color} color - fill color of points and polygons and color of lines, if used with `symbol` the color will override the original sprite RGB channels
    * @property {Number} width - fill diameter of points, thickness of lines, not applicable to polygons
    * @property {Color} strokeColor - stroke/border color of points and polygons, not applicable to lines
    * @property {Number} strokeWidth - stroke width of points and polygons, not applicable to lines
    * @property {Number} filter - filter features by removing from rendering and interactivity all the features that don't pass the test
    * @property {Sprite} symbol - show a sprite instead in the place of points
    * @property {Placement} symbolPlacement - when using `symbol`, offset to apply to the sprite
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
                    expr = Object(_core_viz_expressions_utils__WEBPACK_IMPORTED_MODULE_7__["implicitCast"])(expr);
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
                    value = Object(_core_viz_expressions_utils__WEBPACK_IMPORTED_MODULE_7__["implicitCast"])(value);
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
        return exprs.map(expr => expr._getMinimumNeededSchema()).reduce(_core_schema__WEBPACK_IMPORTED_MODULE_2__["union"], _core_schema__WEBPACK_IMPORTED_MODULE_2__["IDENTITY"]);
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
                COLOR_EXPRESSION: () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["hex"]('#EE4D5A')),
                WIDTH_EXPRESSION: () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["number"](7)),
                STROKE_COLOR_EXPRESSION: () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["hex"]('#FFF')),
                STROKE_WIDTH_EXPRESSION: () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["number"](1))
            };
        }
        if (geomType === 'line') {
            return {
                COLOR_EXPRESSION: () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["hex"]('#4CC8A3')),
                WIDTH_EXPRESSION: () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["number"](1.5)),
                STROKE_COLOR_EXPRESSION: () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["hex"]('#FFF')), // Not used in lines
                STROKE_WIDTH_EXPRESSION: () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["number"](1))  // Not used in lines
            };
        }
        if (geomType === 'polygon') {
            return {
                COLOR_EXPRESSION: () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["hex"]('#826DBA')),
                WIDTH_EXPRESSION: () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["number"](1)), // Not used in polygons
                STROKE_COLOR_EXPRESSION: () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["hex"]('#FFF')),
                STROKE_WIDTH_EXPRESSION: () => _markDefault(_core_viz_functions__WEBPACK_IMPORTED_MODULE_1__["number"](1))
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

        this.colorShader = Object(_core_viz_shader_compiler__WEBPACK_IMPORTED_MODULE_4__["compileShader"])(gl, _core_shaders__WEBPACK_IMPORTED_MODULE_3__["styleColorGLSL"], { color: this.color });
        this.widthShader = Object(_core_viz_shader_compiler__WEBPACK_IMPORTED_MODULE_4__["compileShader"])(gl, _core_shaders__WEBPACK_IMPORTED_MODULE_3__["styleWidthGLSL"], { width: this.width });
        this.strokeColorShader = Object(_core_viz_shader_compiler__WEBPACK_IMPORTED_MODULE_4__["compileShader"])(gl, _core_shaders__WEBPACK_IMPORTED_MODULE_3__["styleColorGLSL"], { color: this.strokeColor });
        this.strokeWidthShader = Object(_core_viz_shader_compiler__WEBPACK_IMPORTED_MODULE_4__["compileShader"])(gl, _core_shaders__WEBPACK_IMPORTED_MODULE_3__["styleWidthGLSL"], { width: this.strokeWidth });
        this.filterShader = Object(_core_viz_shader_compiler__WEBPACK_IMPORTED_MODULE_4__["compileShader"])(gl, _core_shaders__WEBPACK_IMPORTED_MODULE_3__["styleFilterGLSL"], { filter: this.filter });

        this.symbolPlacement._bind(metadata);
        if (!this.symbol._default) {
            this.symbolShader = Object(_core_viz_shader_compiler__WEBPACK_IMPORTED_MODULE_4__["compileShader"])(gl, _core_shaders_symbolizer__WEBPACK_IMPORTED_MODULE_9__["symbolizerGLSL"], {
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
        if (_util__WEBPACK_IMPORTED_MODULE_0__["isUndefined"](definition)) {
            return this._setDefaults({});
        }
        if (_util__WEBPACK_IMPORTED_MODULE_0__["isObject"](definition)) {
            return this._setDefaults(definition);
        }
        if (_util__WEBPACK_IMPORTED_MODULE_0__["isString"](definition)) {
            return this._setDefaults(Object(_core_viz_parser__WEBPACK_IMPORTED_MODULE_5__["parseVizDefinition"])(definition));
        }
        throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_8__["default"]('viz', 'nonValidDefinition');
    }

    /**
     * Add default values to a vizSpec object.
     *
     * @param {VizSpec} vizSpec
     * @return {VizSpec}
     */
    _setDefaults(vizSpec) {
        if (_util__WEBPACK_IMPORTED_MODULE_0__["isUndefined"](vizSpec.color)) {
            vizSpec.color = DEFAULT_COLOR_EXPRESSION();
        }
        if (_util__WEBPACK_IMPORTED_MODULE_0__["isUndefined"](vizSpec.width)) {
            vizSpec.width = DEFAULT_WIDTH_EXPRESSION();
        }
        if (_util__WEBPACK_IMPORTED_MODULE_0__["isUndefined"](vizSpec.strokeColor)) {
            vizSpec.strokeColor = DEFAULT_STROKE_COLOR_EXPRESSION();
        }
        if (_util__WEBPACK_IMPORTED_MODULE_0__["isUndefined"](vizSpec.strokeWidth)) {
            vizSpec.strokeWidth = DEFAULT_STROKE_WIDTH_EXPRESSION();
        }
        if (_util__WEBPACK_IMPORTED_MODULE_0__["isUndefined"](vizSpec.order)) {
            vizSpec.order = DEFAULT_ORDER_EXPRESSION();
        }
        if (_util__WEBPACK_IMPORTED_MODULE_0__["isUndefined"](vizSpec.filter)) {
            vizSpec.filter = DEFAULT_FILTER_EXPRESSION();
        }
        if (_util__WEBPACK_IMPORTED_MODULE_0__["isUndefined"](vizSpec.resolution)) {
            vizSpec.resolution = DEFAULT_RESOLUTION();
        }
        if (_util__WEBPACK_IMPORTED_MODULE_0__["isUndefined"](vizSpec.symbol)) {
            vizSpec.symbol = DEFAULT_SYMBOL_EXPRESSION();
        }
        if (_util__WEBPACK_IMPORTED_MODULE_0__["isUndefined"](vizSpec.symbolPlacement)) {
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
         * @property {Color} color - fill color of points and polygons and color of lines, if used with `symbol` the color will override the original sprite RGB channels
         * @property {Number} width - fill diameter of points, thickness of lines, not applicable to polygons
         * @property {Color} strokeColor - stroke/border color of points and polygons, not applicable to lines
         * @property {Number} strokeWidth - stroke width of points and polygons, not applicable to lines
         * @property {Number} filter - filter features by removing from rendering and interactivity all the features that don't pass the test
         * @property {Sprite} symbol - show a sprite instead in the place of points
         * @property {Placement} symbolPlacement - when using `symbol`, offset to apply to the sprite
         * @IGNOREproperty {Order} order - rendering order of the features, only applicable to points
         * @property {number} resolution - resolution of the property-aggregation functions, a value of 4 means to produce aggregation on grid cells of 4x4 pixels, only applicable to points
         * @property {object} variables - An object describing the variables used.
         * @api
         */

        // TODO: Check expression types ie: color is not a number expression!

        // Apply implicit cast to numeric style properties
        vizSpec.width = Object(_core_viz_expressions_utils__WEBPACK_IMPORTED_MODULE_7__["implicitCast"])(vizSpec.width);
        vizSpec.strokeWidth = Object(_core_viz_expressions_utils__WEBPACK_IMPORTED_MODULE_7__["implicitCast"])(vizSpec.strokeWidth);
        vizSpec.symbolPlacement = Object(_core_viz_expressions_utils__WEBPACK_IMPORTED_MODULE_7__["implicitCast"])(vizSpec.symbolPlacement);
        vizSpec.symbol = Object(_core_viz_expressions_utils__WEBPACK_IMPORTED_MODULE_7__["implicitCast"])(vizSpec.symbol);
        vizSpec.filter = Object(_core_viz_expressions_utils__WEBPACK_IMPORTED_MODULE_7__["implicitCast"])(vizSpec.filter);

        if (!_util__WEBPACK_IMPORTED_MODULE_0__["isNumber"](vizSpec.resolution)) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_8__["default"]('viz', 'resolutionNumberRequired');
        }
        if (vizSpec.resolution <= MIN_RESOLUTION) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_8__["default"]('viz', `resolutionTooSmall[${MIN_RESOLUTION}]`);
        }
        if (vizSpec.resolution >= MAX_RESOLUTION) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_8__["default"]('viz', `resolutionTooBig[${MAX_RESOLUTION}]`);
        }
        if (!(vizSpec.color instanceof _core_viz_expressions_base__WEBPACK_IMPORTED_MODULE_6__["default"])) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_8__["default"]('viz', 'nonValidExpression[color]');
        }
        if (!(vizSpec.strokeColor instanceof _core_viz_expressions_base__WEBPACK_IMPORTED_MODULE_6__["default"])) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_8__["default"]('viz', 'nonValidExpression[strokeColor]');
        }
        if (!(vizSpec.width instanceof _core_viz_expressions_base__WEBPACK_IMPORTED_MODULE_6__["default"])) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_8__["default"]('viz', 'nonValidExpression[width]');
        }
        if (!(vizSpec.strokeWidth instanceof _core_viz_expressions_base__WEBPACK_IMPORTED_MODULE_6__["default"])) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_8__["default"]('viz', 'nonValidExpression[strokeWidth]');
        }
        if (!(vizSpec.order instanceof _core_viz_expressions_base__WEBPACK_IMPORTED_MODULE_6__["default"])) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_8__["default"]('viz', 'nonValidExpression[order]');
        }
        if (!(vizSpec.filter instanceof _core_viz_expressions_base__WEBPACK_IMPORTED_MODULE_6__["default"])) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_8__["default"]('viz', 'nonValidExpression[filter]');
        }
        if (!(vizSpec.symbol instanceof _core_viz_expressions_base__WEBPACK_IMPORTED_MODULE_6__["default"])) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_8__["default"]('viz', 'nonValidExpression[symbol]');
        }
        if (!(vizSpec.symbolPlacement instanceof _core_viz_expressions_base__WEBPACK_IMPORTED_MODULE_6__["default"])) {
            throw new _error_handling_carto_validation_error__WEBPACK_IMPORTED_MODULE_8__["default"]('viz', 'nonValidExpression[symbolPlacement]');
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


/***/ }),

/***/ "./src/client/mvt/feature-decoder.js":
/*!*******************************************!*\
  !*** ./src/client/mvt/feature-decoder.js ***!
  \*******************************************/
/*! exports provided: Polygon, decodePolygons, isClockWise, clipPolygon, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Polygon", function() { return Polygon; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decodePolygons", function() { return decodePolygons; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isClockWise", function() { return isClockWise; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clipPolygon", function() { return clipPolygon; });
/* harmony import */ var _utils_geometry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/geometry */ "./src/utils/geometry.js");

class Polygon {
    constructor() {
        this.flat = [];
        this.holes = [];
        this.clipped = [];
        this.clippedType = []; // Store a bitmask of the clipped half-planes
    }
}

/*
    All this clockwise non-sense is needed because the MVT decoder dont decode the MVT fully.
    It doesn't distinguish between internal polygon rings (which defines holes) or external ones, which defines more polygons (mulipolygons)
    See:
        https://github.com/mapbox/vector-tile-spec/tree/master/2.1
        https://en.wikipedia.org/wiki/Shoelace_formula
*/
function decodePolygons(geometries, mvtExtent) {
    let currentPolygon = null;
    let decoded = [];

    geometries.forEach((geom, index) => {
        const isExternalPolygon = isClockWise(geom);
        const preClippedVertices = _getPreClippedVertices(geom, mvtExtent);

        _checkIsFirstPolygonInternal(isExternalPolygon, index);

        if (isExternalPolygon) {
            if (currentPolygon) {
                decoded.push(currentPolygon);
            }

            currentPolygon = new Polygon();
        }

        currentPolygon = clipPolygon(preClippedVertices, currentPolygon, !isExternalPolygon);
    });

    if (currentPolygon) {
        decoded.push(currentPolygon);
    }

    return decoded;
}

function isClockWise(vertices) {
    let a = 0;
    for (let i = 0; i < vertices.length; i++) {
        let j = (i + 1) % vertices.length;
        a += vertices[i].x * vertices[j].y;
        a -= vertices[j].x * vertices[i].y;
    }
    return a > 0;
}

function clipPolygon(preClippedVertices, polygon, isHole) {
    // Sutherland-Hodgman Algorithm to clip polygons to the tile
    // https://www.cs.drexel.edu/~david/Classes/CS430/Lectures/L-05_Polygons.6.pdf
    const clippingEdges = [
        p => p[0] <= 1,
        p => p[1] <= 1,
        p => p[0] >= -1,
        p => p[1] >= -1,
    ];

    const clippingEdgeIntersectFn = [
        (a, b) => _utils_geometry__WEBPACK_IMPORTED_MODULE_0__["default"].intersect(a, b, [1, -10], [1, 10]),
        (a, b) => _utils_geometry__WEBPACK_IMPORTED_MODULE_0__["default"].intersect(a, b, [-10, 1], [10, 1]),
        (a, b) => _utils_geometry__WEBPACK_IMPORTED_MODULE_0__["default"].intersect(a, b, [-1, -10], [-1, 10]),
        (a, b) => _utils_geometry__WEBPACK_IMPORTED_MODULE_0__["default"].intersect(a, b, [-10, -1], [10, -1]),
    ];

    // for each clipping edge
    for (let i = 0; i < 4; i++) {
        const preClippedVertices2 = [];

        // for each edge on polygon
        for (let k = 0; k < preClippedVertices.length - 1; k++) {
            // clip polygon edge
            const a = preClippedVertices[k];
            const b = preClippedVertices[k + 1];

            const insideA = clippingEdges[i](a);
            const insideB = clippingEdges[i](b);

            if (insideA && insideB) {
                // case 1: both inside, push B vertex
                preClippedVertices2.push(b);
            } else if (insideA) {
                // case 2: just B outside, push intersection
                const intersectionPoint = clippingEdgeIntersectFn[i](a, b);
                preClippedVertices2.push(intersectionPoint);
            } else if (insideB) {
                // case 4: just A outside: push intersection, push B
                const intersectionPoint = clippingEdgeIntersectFn[i](a, b);
                preClippedVertices2.push(intersectionPoint);
                preClippedVertices2.push(b);
            } else {
                // case 3: both outside: do nothing
            }
        }
        if (preClippedVertices2.length) {
            preClippedVertices2.push(preClippedVertices2[0]);
        }
        preClippedVertices = preClippedVertices2;
    }

    if (preClippedVertices.length > 3) {
        if (isHole) {
            polygon.holes.push(polygon.flat.length / 2);
        }
        preClippedVertices.forEach(v => {
            polygon.flat.push(v[0], v[1]);
        });
    }

    return polygon;
}

function _checkIsFirstPolygonInternal(isExternalPolygon, index) {
    const IS_FIRST_POLYGON = index === 0;

    if (!isExternalPolygon && IS_FIRST_POLYGON) {
        throw new Error('Invalid MVT tile: first polygon ring MUST be external');
    }
}

function _getPreClippedVertices(geom, mvtExtent) {
    return geom.map((coord) => {
        let x = coord.x;
        let y = coord.y;

        x = 2 * x / mvtExtent - 1;	
        y = 2 * (1 - y / mvtExtent) - 1;	

        return [x, y];
    });
}

/* harmony default export */ __webpack_exports__["default"] = ({
    decodePolygons,
    isClockWise,
    clipPolygon
});


/***/ }),

/***/ "./src/client/rsys.js":
/*!****************************!*\
  !*** ./src/client/rsys.js ***!
  \****************************/
/*! exports provided: rTiles, getRsysFromTile, wToR */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rTiles", function() { return rTiles; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getRsysFromTile", function() { return getRsysFromTile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "wToR", function() { return wToR; });
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

/***/ "./src/client/windshaft-filtering.js":
/*!*******************************************!*\
  !*** ./src/client/windshaft-filtering.js ***!
  \*******************************************/
/*! exports provided: getFiltering, getSQLWhere, getAggregationFilters */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFiltering", function() { return getFiltering; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSQLWhere", function() { return getSQLWhere; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getAggregationFilters", function() { return getAggregationFilters; });
/* harmony import */ var _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/viz/expressions/binary */ "./src/core/viz/expressions/binary.js");
/* harmony import */ var _core_viz_expressions_belongs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/viz/expressions/belongs */ "./src/core/viz/expressions/belongs.js");
/* harmony import */ var _core_viz_expressions_between__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/viz/expressions/between */ "./src/core/viz/expressions/between.js");
/* harmony import */ var _core_viz_expressions_basic_property__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/viz/expressions/basic/property */ "./src/core/viz/expressions/basic/property.js");
/* harmony import */ var _core_viz_expressions_blend__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/viz/expressions/blend */ "./src/core/viz/expressions/blend.js");
/* harmony import */ var _core_viz_expressions_animate__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../core/viz/expressions/animate */ "./src/core/viz/expressions/animate.js");
/* harmony import */ var _core_viz_expressions_basic_number__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../core/viz/expressions/basic/number */ "./src/core/viz/expressions/basic/number.js");
/* harmony import */ var _core_viz_expressions_basic_constant__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/viz/expressions/basic/constant */ "./src/core/viz/expressions/basic/constant.js");
/* harmony import */ var _core_viz_expressions_basic_category__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../core/viz/expressions/basic/category */ "./src/core/viz/expressions/basic/category.js");
/* harmony import */ var _core_viz_expressions_aggregation_clusterAggregation__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/viz/expressions/aggregation/clusterAggregation */ "./src/core/viz/expressions/aggregation/clusterAggregation.js");
/* harmony import */ var _core_schema__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../core/schema */ "./src/core/schema.js");












class AggregationFiltering {

    /**
     * Generate aggregation filters:
     * This extracts, from the vizs filters, those compatible to be
     * executed through the Maps API aggregation API.
     * The extracted filters are in the format admitted by the Maps API
     * `filters` parameter.
     * Filters affecting dimensions (non-aggregated columns) can optionally
     * be extracted too, but it is more efficient to not do so and apply those
     * filters before aggregation.
     */
    constructor(options) {
        // exclusive mode: aggregate filters don't include pre-aggregate conditions (dimensions)
        // in that case pre-aggregate filters should always be applied, even with aggregation
        // (which can be more efficient)
        this._onlyAggregateFilters = options.exclusive;
    }

    // return (partial) filters as an object (JSON) in the format of the Maps API aggregation interface
    getFilters(vizFilter) {
        let filters = {};
        let filterList = this._and(vizFilter).filter(Boolean);
        for (let p of filterList) {
            let name = p.property;
            let existingFilter = filters[name];
            if (existingFilter) {
                if (this._compatibleAndFilters(existingFilter, p.filters)) {
                    // combine inequalities into a range
                    Object.assign(existingFilter[0], p.filters[0]);
                }
                else {
                    // can't AND-combine filters for the same property
                    return {};
                }
            }
            else {
                filters[name] = p.filters;
            }
        }
        return filters;
    }

    _and(f) {
        if (f instanceof _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["And"]) {
            return this._and(f.a).concat(this._and(f.b)).filter(Boolean);
        }
        return [this._or(f)].filter(Boolean);
    }

    _or(f) {
        if (f instanceof _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["Or"]) {
            let a = this._basicCondition(f.a);
            let b = this._basicCondition(f.b);
            if (a && b) {
                if (a.property == b.property) {
                    a.filters = a.filters.concat(b.filters);
                    return a;
                }
            }
        }
        return this._basicCondition(f);
    }

    _removeBlend(f) {
        if (f instanceof _core_viz_expressions_blend__WEBPACK_IMPORTED_MODULE_4__["default"] && f.originalMix instanceof _core_viz_expressions_animate__WEBPACK_IMPORTED_MODULE_5__["default"]) {
            return f.b;
        }
        return f;
    }

    _basicCondition(f) {
        f = this._removeBlend(f);
        return this._between(f)
            || this._equals(f) || this._notEquals(f)
            || this._lessThan(f) || this._lessThanOrEqualTo(f)
            || this._greaterThan(f) || this._greaterThanOrEqualTo(f)
            || this._in(f) || this._notIn(f);
    }

    _value(f) {
        f = this._removeBlend(f);
        if (f instanceof _core_viz_expressions_basic_number__WEBPACK_IMPORTED_MODULE_6__["default"] || f instanceof _core_viz_expressions_basic_constant__WEBPACK_IMPORTED_MODULE_7__["default"] || f instanceof _core_viz_expressions_basic_category__WEBPACK_IMPORTED_MODULE_8__["default"]) {
            return f.expr;
        }
    }

    _between(f) {
        if (f instanceof _core_viz_expressions_between__WEBPACK_IMPORTED_MODULE_2__["default"]) {
            let p = this._aggregation(f.value);
            let lo = p && this._value(f.lowerLimit);
            let hi = p && lo && this._value(f.upperLimit);
            if (hi) {
                p.filters.push({
                    greater_than_or_equal_to: lo,
                    less_than_or_equal_to: hi
                });
                return p;
            }
        }
    }

    _in(f) {
        if (f instanceof _core_viz_expressions_belongs__WEBPACK_IMPORTED_MODULE_1__["In"]) {
            let p = this._aggregation(f.value);
            let values = f.list.elems.map(c => this._value(c)).filter(v => v != null);
            if (p && values.length > 0 && values.length == f.list.elems.length) {
                p.filters.push({
                    in: values
                });
                return p;
            }
        }
    }

    _notIn(f) {
        if (f instanceof _core_viz_expressions_belongs__WEBPACK_IMPORTED_MODULE_1__["Nin"]) {
            let p = this._aggregation(f.value);
            let values = f.list.elems.map(c => this._value(c)).filter(v => v != null);
            if (p && values.length > 0 && values.length == f.list.elems.length) {
                p.filters.push({
                    not_in: values
                });
                return p;
            }
        }
    }

    _equals(f) {
        return this._cmpOp(f, _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["Equals"], 'equal');
    }

    _notEquals(f) {
        return this._cmpOp(f, _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["NotEquals"], 'not_equal');
    }

    _lessThan(f) {
        return this._cmpOp(f, _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["LessThan"], 'less_than', 'greater_than');
    }

    _lessThanOrEqualTo(f) {
        return this._cmpOp(f, _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["LessThanOrEqualTo"], 'less_than_or_equal_to', 'greater_than_or_equal_to');
    }

    _greaterThan(f) {
        return this._cmpOp(f, _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["GreaterThan"], 'greater_than', 'less_than');
    }

    _greaterThanOrEqualTo(f) {
        return this._cmpOp(f, _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["GreaterThanOrEqualTo"], 'greater_than_or_equal_to', 'less_than_or_equal_to');
    }

    _aggregation(f) {
        f = this._removeBlend(f);
        if (f instanceof _core_viz_expressions_aggregation_clusterAggregation__WEBPACK_IMPORTED_MODULE_9__["ClusterAvg"] || f instanceof _core_viz_expressions_aggregation_clusterAggregation__WEBPACK_IMPORTED_MODULE_9__["ClusterMax"] || f instanceof _core_viz_expressions_aggregation_clusterAggregation__WEBPACK_IMPORTED_MODULE_9__["ClusterMin"] || f instanceof _core_viz_expressions_aggregation_clusterAggregation__WEBPACK_IMPORTED_MODULE_9__["ClusterMode"] || f instanceof _core_viz_expressions_aggregation_clusterAggregation__WEBPACK_IMPORTED_MODULE_9__["ClusterSum"]) {
            let p = this._property(f.property);
            if (p) {
                p.property = _core_schema__WEBPACK_IMPORTED_MODULE_10__["column"].aggColumn(p.property, f.aggName);
                return p;
            }
        }
        if (this._onlyAggregateFilters) {
            // no filters on non-aggregate columns (i.e. dimensions) are generated
            // such filtering should be applied elsewhere
            return;
        }
        return this._property(f);
    }

    _property(f) {
        f = this._removeBlend(f);
        if (f instanceof _core_viz_expressions_basic_property__WEBPACK_IMPORTED_MODULE_3__["default"]) {
            return {
                property: f.name,
                filters: []
            };
        }
    }

    _cmpOp(f, opClass, opParam, inverseOpParam) {
        inverseOpParam = inverseOpParam || opParam;
        if (f instanceof opClass) {
            let p = this._aggregation(f.a);
            let v = p && this._value(f.b);
            let op = opParam;
            if (!v) {
                p = this._aggregation(f.b);
                v = p && this._value(f.a);
                op = inverseOpParam;
            }
            if (v) {
                let filter = {};
                filter[op] = v;
                p.filters.push(filter);
                return p;
            }
        }
    }

    _compatibleAndFilters(a, b) {
        // check if a and b can be combined into a range filter
        if (a.length === 0 || b.length === 0) {
            return true;
        }
        if (a.length === 1 && b.length === 1) {
            const af = a[0];
            const bf = b[0];
            if (Object.keys(af).length === 1 && Object.keys(bf).length === 1) {
                const ka = Object.keys(af)[0];
                const kb = Object.keys(bf)[0];
                const less_ops = ['less_than', 'less_than_or_equal_to'];
                const greater_ops = ['greater_than', 'greater_than_or_equal_to'];
                return (less_ops.includes(ka) && greater_ops.includes(kb))
                    || (less_ops.includes(kb) && greater_ops.includes(ka));
            }
        }
        return false;
    }
}

class PreaggregationFiltering {

    /**
     * Generate pre-aggregation filters, i.e. filters that can be
     * applied to the dataset before aggregation.
     * This extracts, from the vizs filters, those compatible to be
     * executed before aggregation.
     * The extracted filters are in an internal tree-like format;
     * each node has a `type` property and various other parameters
     * that depend on the type.
     */
    constructor() {
    }

    // return (partial) filters as an object (JSON) representing the SQL syntax tree
    getFilter(vizFilter) {
        return this._filter(vizFilter);
    }

    _filter(f) {
        return this._and(f) || this._or(f)
            || this._in(f) || this._notIn(f)
            || this._between(f)
            || this._equals(f) || this._notEquals(f)
            || this._lessThan(f) || this._lessThanOrEqualTo(f)
            || this._greaterThan(f) || this._greaterThanOrEqualTo(f)
            || this._blend(f) || null;
    }

    _and(f) {
        if (f instanceof _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["And"]) {
            // we can ignore nonsupported (null) subexpressions that are combined with AND
            // and keep the supported ones as a partial filter
            const l = [this._filter(f.a), this._filter(f.b)].filter(Boolean).reduce((x, y) => x.concat(y), []);
            if (l.length) {
                if (l.length == 1) {
                    return l[0];
                }
                return {
                    type: 'and',
                    left: l[0],
                    right: l[1]
                };
            }
        }
    }

    _or(f) {
        if (f instanceof _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["Or"]) {
            // if any subexpression is not supported the OR combination isn't supported either
            let a = this._filter(f.a);
            let b = this._filter(f.b);
            if (a && b) {
                return {
                    type: 'or',
                    left: a,
                    right: b
                };
            }
        }
    }

    _lessThan(f) {
        return this._cmpOp(f, _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["LessThan"], 'lessThan');
    }

    _lessThanOrEqualTo(f) {
        return this._cmpOp(f, _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["LessThanOrEqualTo"], 'lessThanOrEqualTo');
    }

    _greaterThan(f) {
        return this._cmpOp(f, _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["GreaterThan"], 'greaterThan');
    }

    _greaterThanOrEqualTo(f) {
        return this._cmpOp(f, _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["GreaterThanOrEqualTo"], 'greaterThanOrEqualTo');
    }

    _equals(f) {
        return this._cmpOp(f, _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["Equals"], 'equals');
    }

    _notEquals(f) {
        return this._cmpOp(f, _core_viz_expressions_binary__WEBPACK_IMPORTED_MODULE_0__["NotEquals"], 'notEquals');
    }

    _cmpOp(f, opClass, type) {
        if (f instanceof opClass) {
            let a = this._property(f.a) || this._value(f.a);
            let b = this._property(f.b) || this._value(f.b);
            if (a && b) {
                return {
                    type: type,
                    left: a,
                    right: b
                };
            }
        }
    }

    _blend(f) {
        if (f instanceof _core_viz_expressions_blend__WEBPACK_IMPORTED_MODULE_4__["default"] && f.originalMix instanceof _core_viz_expressions_animate__WEBPACK_IMPORTED_MODULE_5__["default"]) {
            return this._filter(f.b);
        }
    }

    _property(f) {
        if (f instanceof _core_viz_expressions_basic_property__WEBPACK_IMPORTED_MODULE_3__["default"]) {
            return {
                type: 'property',
                property: f.name
            };
        }
    }

    _value(f) {
        if (f instanceof _core_viz_expressions_basic_number__WEBPACK_IMPORTED_MODULE_6__["default"] || f instanceof _core_viz_expressions_basic_constant__WEBPACK_IMPORTED_MODULE_7__["default"] || f instanceof _core_viz_expressions_basic_category__WEBPACK_IMPORTED_MODULE_8__["default"]) {
            return {
                type: 'value',
                value: f.expr
            };
        }
    }

    _in(f) {
        if (f instanceof _core_viz_expressions_belongs__WEBPACK_IMPORTED_MODULE_1__["In"]) {
            let p = this._property(f.value);
            let values = f.list.elems.map(cat => this._value(cat));
            if (p && values.length > 0 && values.length == f.list.elems.length) {
                return {
                    type: 'in',
                    property: p.property,
                    values: values.map(v => v.value)
                };
            }
        }
    }

    _notIn(f) {
        if (f instanceof _core_viz_expressions_belongs__WEBPACK_IMPORTED_MODULE_1__["Nin"]) {
            let p = this._property(f.value);
            let values = f.list.elems.map(cat => this._value(cat));
            if (p && values.length > 0 && values.length == f.list.elems.length) {
                return {
                    type: 'notIn',
                    property: p.property,
                    values: values.map(v => v.value)
                };
            }
        }
    }

    _between(f) {
        if (f instanceof _core_viz_expressions_between__WEBPACK_IMPORTED_MODULE_2__["default"]) {
            let p = this._property(f.value);
            let lo = this._value(f.lowerLimit);
            let hi = this._value(f.upperLimit);
            if (p && lo != null && hi != null) {
                return {
                    type: 'between',
                    property: p.property,
                    lower: lo.value,
                    upper: hi.value
                };
            }
        }
    }
}

function getSQL(node) {
    if (node.type) {
        return `(${SQLGenerators[node.type](node)})`;
    }
    return sqlQ(node);
}

function sqlQ(value) {
    if (isFinite(value)) {
        return String(value);
    }
    return `'${value.replace(/\'/g,'\'\'')}'`;
}

function sqlId(id) {
    if (!id.match(/^[a-z\d_]+$/)) {
        id = `"${id.replace(/\"/g,'""')}"`;
    }
    return id;
}

function sqlSep(sep, ...args) {
    return args.map(arg => getSQL(arg)).join(sep);
}

const SQLGenerators = {
    'and':                  f => sqlSep(' AND ', f.left, f.right),
    'or':                   f => sqlSep(' OR ', f.left, f.right),
    'between':              f => `${sqlId(f.property)} BETWEEN ${sqlQ(f.lower)} AND ${sqlQ(f.upper)}`,
    'in':                   f => `${sqlId(f.property)} IN (${sqlSep(',', ...f.values)})`,
    'notIn':                f => `${sqlId(f.property)} NOT IN (${sqlSep(',', ...f.values)})`,
    'equals':               f => sqlSep( ' = ', f.left, f.right),
    'notEquals':            f => sqlSep(' <> ', f.left, f.right),
    'lessThan':             f => sqlSep(' < ', f.left, f.right),
    'lessThanOrEqualTo':    f => sqlSep(' <= ', f.left, f.right),
    'greaterThan':          f => sqlSep( ' > ', f.left, f.right),
    'greaterThanOrEqualTo': f => sqlSep(' >= ', f.left, f.right),
    'property':             f => sqlId(f.property),
    'value':                f => sqlQ(f.value)
};

/**
 * Returns supported windshaft filters for the viz
 * @param {*} viz
 * @returns {Filtering}
 */
function getFiltering(viz, options = {}) {
    const aggrFiltering = new AggregationFiltering(options);
    const preFiltering = new PreaggregationFiltering(options);
    const filtering = {
        preaggregation: preFiltering.getFilter(viz.filter),
        aggregation: aggrFiltering.getFilters(viz.filter)
    };
    if (!filtering.preaggregation && !filtering.aggregation) {
        return null;
    }
    return filtering;
}

/**
 * Convert preaggregation filters (as generated by PreaggregationFiltering)
 * into an equivalent SQL WHERE expression.
 *
 * @param {Filtering} filtering
 */
function getSQLWhere(filtering) {
    filtering = filtering && filtering.preaggregation;
    let sql;
    if (filtering && Object.keys(filtering).length > 0) {
        sql = getSQL(filtering);
    }
    return sql ? 'WHERE ' + sql : '';
}

function getAggregationFilters(filtering) {
    return filtering && filtering.aggregation;
}


/***/ }),

/***/ "./src/client/windshaft.js":
/*!*********************************!*\
  !*** ./src/client/windshaft.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Windshaft; });
/* harmony import */ var _core_renderer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/renderer */ "./src/core/renderer.js");
/* harmony import */ var _rsys__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rsys */ "./src/client/rsys.js");
/* harmony import */ var _core_dataframe__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/dataframe */ "./src/core/dataframe.js");
/* harmony import */ var pbf__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! pbf */ "./node_modules/pbf/index.js");
/* harmony import */ var pbf__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(pbf__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var lru_cache__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lru-cache */ "./node_modules/lru-cache/index.js");
/* harmony import */ var lru_cache__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(lru_cache__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _windshaft_filtering__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./windshaft-filtering */ "./src/client/windshaft-filtering.js");
/* harmony import */ var _mapbox_vector_tile__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @mapbox/vector-tile */ "./node_modules/@mapbox/vector-tile/index.js");
/* harmony import */ var _mapbox_vector_tile__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_mapbox_vector_tile__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _core_metadata__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../core/metadata */ "./src/core/metadata.js");
/* harmony import */ var _package__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../package */ "./package.json");
var _package__WEBPACK_IMPORTED_MODULE_8___namespace = /*#__PURE__*/__webpack_require__.t(/*! ../../package */ "./package.json", 1);
/* harmony import */ var _core_viz_expressions_time__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../core/viz/expressions/time */ "./src/core/viz/expressions/time.js");
/* harmony import */ var _mvt_feature_decoder__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./mvt/feature-decoder */ "./src/client/mvt/feature-decoder.js");













const SAMPLE_ROWS = 1000;
const MIN_FILTERING = 2000000;

const geometryTypes = {
    UNKNOWN: 'unknown',
    POINT: 'point',
    LINE: 'line',
    POLYGON: 'polygon'
};

// Get dataframes <- MVT <- Windshaft
// Get metadata
// Instantiate map Windshaft
// Requrest SQL API (temp)
// Cache dataframe

class Windshaft {

    constructor(source) {
        this._source = source;

        this._exclusive = true;

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
        this.cache = lru_cache__WEBPACK_IMPORTED_MODULE_4__(lruOptions);
        this.inProgressInstantiations = {};
    }

    _bindLayer(addDataframe, removeDataframe, dataLoadedCallback) {
        this._addDataframe = addDataframe;
        this._removeDataframe = removeDataframe;
        this._dataLoadedCallback = dataLoadedCallback;
    }

    _getInstantiationID(MNS, resolution, filtering, choices) {
        return JSON.stringify({
            MNS,
            resolution,
            filtering: choices.backendFilters ? filtering : null,
            options: choices
        });
    }

    /**
     * Should be called whenever the viz changes (even if metadata is not going to be used)
     * This not only computes metadata: it also updates the map (instantiates) for the new viz if needed
     * Returns  a promise to a Metadata
     * @param {*} viz
     */
    async getMetadata(viz) {
        const MNS = viz.getMinimumNeededSchema();
        const resolution = viz.resolution;
        const filtering = _windshaft_filtering__WEBPACK_IMPORTED_MODULE_5__["getFiltering"](viz, { exclusive: this._exclusive });
        // Force to include `cartodb_id` in the MNS columns.
        // TODO: revisit this request to Maps API
        if (!MNS.columns.includes('cartodb_id')) {
            MNS.columns.push('cartodb_id');
        }
        if (this._needToInstantiate(MNS, resolution, filtering)) {
            const instantiationData = await this._repeatableInstantiate(MNS, resolution, filtering);
            this._updateStateAfterInstantiating(instantiationData);
        }
        return this.metadata;
    }

    /**
     * After calling getMetadata(), data for a viewport can be obtained with this function.
     * So long as the viz doesn't change, getData() can be called repeatedly for different
     * viewports. If viz changes getMetadata() should be called before requesting data
     * for the new viz.
     * @param {*} viewport
     */
    getData(viewport) {
        if (this._isInstantiated()) {
            const tiles = _rsys__WEBPACK_IMPORTED_MODULE_1__["rTiles"](viewport);
            this._getTiles(tiles);
        }
    }

    _getTiles(tiles) {
        this._requestGroupID++;
        let completedTiles = [];
        let needToComplete = tiles.length;
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
        return !_core_renderer__WEBPACK_IMPORTED_MODULE_0__["schema"].equals(this._MNS, MNS)
            || resolution != this.resolution
            || (
                JSON.stringify(filtering) != JSON.stringify(this.filtering)
                && this.metadata.featureCount > MIN_FILTERING
            );
    }

    _isInstantiated() {
        return !!this.metadata;
    }

    _getCategoryIDFromString(category, readonly = true) {
        if (category === undefined) {
            category = 'null';
        }
        if (this._categoryStringToIDMap[category] !== undefined) {
            return this._categoryStringToIDMap[category];
        }
        if (readonly) {
            console.warn(`category ${category} not present in metadata`);
            return -1;
        }
        this._categoryStringToIDMap[category] = this._numCategories;
        this._numCategories++;
        return this._categoryStringToIDMap[category];
    }

    _intantiationChoices(metadata) {
        let choices = {
            // default choices
            backendFilters: true
        };
        if (metadata) {
            if (metadata.featureCount >= 0) {
                choices.backendFilters = metadata.featureCount > MIN_FILTERING || !metadata.backendFiltersApplied;
            }
        }
        return choices;
    }

    async _instantiateUncached(MNS, resolution, filters, choices = { backendFilters: true }, overrideMetadata = null) {
        const conf = this._getConfig();
        const agg = await this._generateAggregation(MNS, resolution);
        let select = this._buildSelectClause(MNS);
        let aggSQL = this._buildQuery(select);

        const query = `(${aggSQL}) AS tmp`;

        let backendFilters = choices.backendFilters ? filters : null;
        let backendFiltersApplied = false;

        if (backendFilters && this._requiresAggregation(MNS)) {
            agg.filters = _windshaft_filtering__WEBPACK_IMPORTED_MODULE_5__["getAggregationFilters"](backendFilters);
            if (agg.filters) {
                backendFiltersApplied = true;
            }
            if (!this._exclusive) {
                backendFilters = null;
            }
        }
        if (backendFilters) {
            const filteredSQL = this._buildQuery(select, backendFilters);
            backendFiltersApplied = backendFiltersApplied || filteredSQL != aggSQL;
            aggSQL = filteredSQL;
        }

        let { url, metadata } = await this._getInstantiationPromise(query, conf, agg, aggSQL, select, overrideMetadata);
        metadata.backendFiltersApplied = backendFiltersApplied;

        return { MNS, resolution, filters, metadata, urlTemplate: url };
    }

    _updateStateAfterInstantiating({ MNS, resolution, filters, metadata, urlTemplate }) {
        this._oldDataframes = [];
        this.cache.reset();
        this.urlTemplate = urlTemplate;
        this.metadata = metadata;
        this._MNS = MNS;
        this.filtering = filters;
        this.resolution = resolution;
        this._checkLayerMeta(MNS);
    }

    async _instantiate(MNS, resolution, filters, choices, metadata) {
        if (this.inProgressInstantiations[this._getInstantiationID(MNS, resolution, filters, choices)]) {
            return this.inProgressInstantiations[this._getInstantiationID(MNS, resolution, filters, choices)];
        }
        const instantiationPromise = this._instantiateUncached(MNS, resolution, filters, choices, metadata);
        this.inProgressInstantiations[this._getInstantiationID(MNS, resolution, filters, choices)] = instantiationPromise;
        return instantiationPromise;
    }

    async _repeatableInstantiate(MNS, resolution, filters) {
        // TODO: we shouldn't reinstantiate just to not apply backend filters
        // (we'd need to add a choice comparison function argument to repeatablePromise)
        let finalMetadata = null;
        const initialChoices = this._intantiationChoices(this.metadata);
        const finalChoices = instantiation => {
            // first instantiation metadata is kept
            finalMetadata = instantiation.metadata;
            return this._intantiationChoices(instantiation.metadata);
        };
        return repeatablePromise(initialChoices, finalChoices, choices => this._instantiate(MNS, resolution, filters, choices, finalMetadata));
    }

    _checkLayerMeta(MNS) {
        if (!this._isAggregated()) {
            if (this._requiresAggregation(MNS)) {
                throw new Error('Aggregation not supported for this dataset');
            }
        }
    }

    _isAggregated() {
        return this.metadata && this.metadata.isAggregated;
    }

    _requiresAggregation(MNS) {
        return MNS.columns.some(column => _core_renderer__WEBPACK_IMPORTED_MODULE_0__["schema"].column.isAggregated(column));
    }

    _generateAggregation(MNS, resolution) {
        let aggregation = {
            columns: {},
            dimensions: {},
            placement: 'centroid',
            resolution: resolution,
            threshold: 1,
        };

        MNS.columns
            .forEach(name => {
                if (name !== 'cartodb_id') {
                    if (_core_renderer__WEBPACK_IMPORTED_MODULE_0__["schema"].column.isAggregated(name)) {
                        aggregation.columns[name] = {
                            aggregate_function: _core_renderer__WEBPACK_IMPORTED_MODULE_0__["schema"].column.getAggFN(name),
                            aggregated_column: _core_renderer__WEBPACK_IMPORTED_MODULE_0__["schema"].column.getBase(name)
                        };
                    } else {
                        aggregation.dimensions[name] = name;
                    }
                }
            });

        return aggregation;
    }

    _buildSelectClause(MNS) {
        const columns = MNS.columns.map(name => _core_renderer__WEBPACK_IMPORTED_MODULE_0__["schema"].column.getBase(name))
            .concat(['the_geom', 'the_geom_webmercator', 'cartodb_id']);
        return columns.filter((item, pos) => columns.indexOf(item) == pos); // get unique values
    }

    _buildQuery(select, filters) {
        const columns = select.join();
        const relation = this._source._query ? `(${this._source._query}) as _cdb_query_wrapper` : this._source._tableName;
        const condition = filters ? _windshaft_filtering__WEBPACK_IMPORTED_MODULE_5__["getSQLWhere"](filters) : '';
        return `SELECT ${columns} FROM ${relation} ${condition}`;
    }

    _getConfig() {
        // for local environments, which require direct access to Maps and SQL API ports, end the configured URL with "{local}"
        return {
            apiKey: this._source._apiKey,
            username: this._source._username,
            mapsServerURL: this._source._serverURL.maps,
            sqlServerURL: this._source._serverURL.sql
        };
    }

    free() {
        this.cache.reset();
        this._oldDataframes = [];
    }

    _generateDataFrame(rs, geometry, properties, size, type) {
        const dataframe = new _core_dataframe__WEBPACK_IMPORTED_MODULE_2__["default"]({
            active: false,
            center: rs.center,
            geom: geometry,
            properties: properties,
            scale: rs.scale,
            size: size,
            type: type,
            metadata: this.metadata,
        });

        return dataframe;
    }

    async _getInstantiationPromise(query, conf, agg, aggSQL, columns, overrideMetadata = null) {
        const LAYER_INDEX = 0;
        const mapConfigAgg = {
            buffersize: {
                'mvt': 0
            },
            layers: [
                {
                    type: 'mapnik',
                    options: {
                        sql: aggSQL,
                        aggregation: agg,
                        dates_as_numbers: true
                    }
                }
            ]
        };
        if (!overrideMetadata) {
            const excludedColumns = ['the_geom', 'the_geom_webmercator'];
            const includedColumns = columns.filter(name => !excludedColumns.includes(name));
            mapConfigAgg.layers[0].options.metadata = {
                geometryType: true,
                columnStats: { topCategories: 32768, includeNulls: true },
                sample: {
                    num_rows: SAMPLE_ROWS,
                    include_columns: includedColumns // TODO: when supported by Maps API: exclude_columns: excludedColumns
                }
            };
        }
        const response = await fetch(endpoint(conf), this._getRequestConfig(mapConfigAgg));
        const layergroup = await response.json();
        if (!response.ok) {
            throw new Error(`Maps API error: ${JSON.stringify(layergroup)}`);
        }
        this._subdomains = layergroup.cdn_url ? layergroup.cdn_url.templates.https.subdomains : [];
        return {
            url: getLayerUrl(layergroup, LAYER_INDEX, conf),
            metadata: overrideMetadata || this._adaptMetadata(layergroup.metadata.layers[0].meta)
        };
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
                let tile = new _mapbox_vector_tile__WEBPACK_IMPORTED_MODULE_6__["VectorTile"](new pbf__WEBPACK_IMPORTED_MODULE_3__(response));
                const mvtLayer = tile.layers[Object.keys(tile.layers)[0]];
                let fieldMap = {};

                const numFields = [];
                const catFields = [];
                const dateFields = [];
                this._MNS.columns.map(name => {
                    const basename = _core_renderer__WEBPACK_IMPORTED_MODULE_0__["schema"].column.getBase(name);
                    const type = this.metadata.columns.find(c => c.name == basename).type;
                    if (type == 'category') {
                        catFields.push(name);
                    } else if (type == 'number') {
                        numFields.push(name);
                    } else if (type == 'date') {
                        dateFields.push(name);
                    } else {
                        throw new Error(`Column type '${type}' not supported`);
                    }

                });
                catFields.map((name, i) => fieldMap[name] = i);
                numFields.map((name, i) => fieldMap[name] = i + catFields.length);
                dateFields.map((name, i) => fieldMap[name] = i + catFields.length + numFields.length);

                const { points, featureGeometries, properties } = this._decodeMVTLayer(mvtLayer, this.metadata, mvt_extent, catFields, numFields, dateFields);

                let rs = _rsys__WEBPACK_IMPORTED_MODULE_1__["getRsysFromTile"](x, y, z);
                let dataframeProperties = {};
                Object.keys(fieldMap).map((name, pid) => {
                    dataframeProperties[name] = properties[pid];
                });
                let dataFrameGeometry = this.metadata.geomType == geometryTypes.POINT ? points : featureGeometries;
                const dataframe = this._generateDataFrame(rs, dataFrameGeometry, dataframeProperties, mvtLayer.length, this.metadata.geomType);
                this._addDataframe(dataframe);
                return dataframe;
            });
    }

    _getTileUrl(x, y, z) {
        return this.urlTemplate.replace('{x}', x).replace('{y}', y).replace('{z}', z).replace('{s}', this._getSubdomain(x, y));
    }

    _getSubdomain(x, y) {
        // Reference https://github.com/Leaflet/Leaflet/blob/v1.3.1/src/layer/tile/TileLayer.js#L214-L217
        return this._subdomains[Math.abs(x + y) % this._subdomains.length];
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

    _decodeMVTLayer(mvtLayer, metadata, mvt_extent, catFields, numFields, dateFields) {
        const properties = [];
        for (let i = 0; i < catFields.length + numFields.length + dateFields.length; i++) {
            properties.push(new Float32Array(mvtLayer.length + 1024));
        }
        let points;
        if (metadata.geomType == geometryTypes.POINT) {
            points = new Float32Array(mvtLayer.length * 2);
        }
        let featureGeometries = [];
        for (let i = 0; i < mvtLayer.length; i++) {
            const f = mvtLayer.feature(i);
            const geom = f.loadGeometry();
            if (metadata.geomType == geometryTypes.POINT) {
                points[2 * i + 0] = 2 * (geom[0][0].x) / mvt_extent - 1.;
                points[2 * i + 1] = 2 * (1. - (geom[0][0].y) / mvt_extent) - 1.;
            } else if (metadata.geomType == geometryTypes.POLYGON) {
                const decodedPolygons = _mvt_feature_decoder__WEBPACK_IMPORTED_MODULE_10__["default"].decodePolygons(geom, mvt_extent);
                featureGeometries.push(decodedPolygons);
            } else if (metadata.geomType == geometryTypes.LINE) {
                this._decodeLines(geom, featureGeometries, mvt_extent);
            } else {
                throw new Error(`Unimplemented geometry type: '${metadata.geomType}'`);
            }

            catFields.map((name, index) => {
                properties[index][i] = this._getCategoryIDFromString(f.properties[name]);
            });
            numFields.map((name, index) => {
                properties[index + catFields.length][i] = Number(f.properties[name]);
            });
            dateFields.map((name, index) => {
                const d = f.properties[name] * 1000;
                const metadataColumn = metadata.columns.find(c => c.name == name);
                const min = metadataColumn.min;
                const max = metadataColumn.max;
                const n = (d - min.getTime()) / (max.getTime() - min.getTime());

                properties[index + catFields.length + numFields.length][i] = n;
            });
        }

        return { properties, points, featureGeometries };
    }

    _adaptMetadata(meta) {
        const { stats, aggregation, dates_as_numbers } = meta;
        const featureCount = stats.hasOwnProperty('featureCount') ? stats.featureCount : stats.estimatedFeatureCount;
        const geomType = adaptGeometryType(stats.geometryType);
        const columns = Object.keys(stats.columns)
            .map(name => Object.assign({ name }, stats.columns[name]))
            .map(col => Object.assign(col, { type: adaptColumnType(col.type) }))
            .filter(col => ['number', 'date', 'category'].includes(col.type));
        const categoryIDs = {};
        columns.forEach(column => {
            if (column.type === 'category' && column.categories) {
                column.categories.forEach(category => {
                    categoryIDs[category.category] = this._getCategoryIDFromString(category.category, false);
                });
                column.categoryNames = column.categories.map(cat => cat.category);
            }
            else if (dates_as_numbers && dates_as_numbers.includes(column.name)) {
                column.type = 'date';
                ['min', 'max', 'avg'].map(fn => {
                    if (column[fn]) {
                        column[fn] = new _core_viz_expressions_time__WEBPACK_IMPORTED_MODULE_9__["default"](column[fn]*1000).value;
                    }
                });
            }
        });

        return new _core_metadata__WEBPACK_IMPORTED_MODULE_7__["default"](categoryIDs, columns, featureCount, stats.sample, geomType, aggregation.mvt);
    }
}

const endpoint = (conf, path = '') => {
    let url = `${conf.mapsServerURL}/api/v1/map`;
    if (path) {
        url += '/' + path;
    }
    url = authURL(url, conf);
    return url;
};

function getLayerUrl(layergroup, layerIndex, conf) {
    if (layergroup.cdn_url && layergroup.cdn_url.templates) {
        const urlTemplates = layergroup.cdn_url.templates.https;
        return authURL(`${urlTemplates.url}/${conf.username}/api/v1/map/${layergroup.layergroupid}/${layerIndex}/{z}/{x}/{y}.mvt`, conf);
    }
    return endpoint(conf, `${layergroup.layergroupid}/${layerIndex}/{z}/{x}/{y}.mvt`);
}

function authURL(url, conf) {
    if (conf.apiKey) {
        const sep = url.includes('?') ? '&' : '?';
        url += sep + 'api_key=' + encodeURIComponent(conf.apiKey);
        url += '&client=' + encodeURIComponent('vl-' + _package__WEBPACK_IMPORTED_MODULE_8__["version"]);
    }
    return url;
}

function adaptGeometryType(type) {
    switch (type) {
        case 'ST_MultiPolygon':
        case 'ST_Polygon':
            return 'polygon';
        case 'ST_Point':
            return 'point';
        case 'ST_MultiLineString':
        case 'ST_LineString':
            return 'line';
        default:
            throw new Error(`Unimplemented geometry type ''${type}'`);
    }
}

function adaptColumnType(type) {
    if (type === 'string') {
        return 'category';
    }
    return type;
}

// generate a promise under certain assumptions/choices; then if the result changes the assumptions,
// repeat the generation with the new information
async function repeatablePromise(initialAssumptions, assumptionsFromResult, promiseGenerator) {
    let promise = promiseGenerator(initialAssumptions);
    let result = await promise;
    let finalAssumptions = assumptionsFromResult(result);
    if (JSON.stringify(initialAssumptions) == JSON.stringify(finalAssumptions)) {
        return promise;
    }
    else {
        return promiseGenerator(finalAssumptions);
    }
}

/**
 * Responsabilities: get tiles, decode tiles, return dataframe promises, optionally: cache, coalesce all layer with a source engine, return bound dataframes
 */


/***/ }),

/***/ "./src/core/dataframe.js":
/*!*******************************!*\
  !*** ./src/core/dataframe.js ***!
  \*******************************/
/*! exports provided: default, pointInTriangle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Dataframe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pointInTriangle", function() { return pointInTriangle; });
/* harmony import */ var _decoder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./decoder */ "./src/core/decoder.js");
/* harmony import */ var _client_rsys__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../client/rsys */ "./src/client/rsys.js");



class Dataframe {
    // `type` is one of 'point' or 'line' or 'polygon'
    constructor({ center, scale, geom, properties, type, active, size, metadata }) {
        this.active = active;
        this.center = center;
        this.geom = geom;
        this.properties = properties;
        this.scale = scale;
        this.size = size;
        this.type = type;
        this.decodedGeom = _decoder__WEBPACK_IMPORTED_MODULE_0__["default"].decodeGeom(this.type, this.geom);
        this.numVertex = this.decodedGeom.vertices.length / 2;
        this.numFeatures = this.decodedGeom.breakpoints.length || this.numVertex;
        this.propertyTex = [];
        this.metadata = metadata;
        this.propertyID = {}; //Name => PID
        this.propertyCount = 0;
        if (this.type == 'polygon') {
            this._aabb = [];
            geom.forEach(feature => {
                const aabb = {
                    minx: Number.POSITIVE_INFINITY,
                    miny: Number.POSITIVE_INFINITY,
                    maxx: Number.NEGATIVE_INFINITY,
                    maxy: Number.NEGATIVE_INFINITY,
                };
                feature.forEach(polygon => {
                    const vertices = polygon.flat;
                    const numVertices = polygon.holes[0] || polygon.flat.length / 2;
                    for (let i = 0; i < numVertices; i++) {
                        aabb.minx = Math.min(aabb.minx, vertices[2 * i + 0]);
                        aabb.miny = Math.min(aabb.miny, vertices[2 * i + 1]);
                        aabb.maxx = Math.max(aabb.maxx, vertices[2 * i + 0]);
                        aabb.maxy = Math.max(aabb.maxy, vertices[2 * i + 1]);
                    }
                });
                this._aabb.push(aabb);
            });
        } else if (this.type == 'line') {
            this._aabb = [];
            geom.forEach(feature => {
                const aabb = {
                    minx: Number.POSITIVE_INFINITY,
                    miny: Number.POSITIVE_INFINITY,
                    maxx: Number.NEGATIVE_INFINITY,
                    maxy: Number.NEGATIVE_INFINITY,
                };
                feature.forEach(line => {
                    const vertices = line;
                    const numVertices = line.length;
                    for (let i = 0; i < numVertices; i++) {
                        aabb.minx = Math.min(aabb.minx, vertices[2 * i + 0]);
                        aabb.miny = Math.min(aabb.miny, vertices[2 * i + 1]);
                        aabb.maxx = Math.max(aabb.maxx, vertices[2 * i + 0]);
                        aabb.maxy = Math.max(aabb.maxy, vertices[2 * i + 1]);
                    }
                });
                this._aabb.push(aabb);
            });
        }
    }

    bind(renderer) {
        const gl = renderer.gl;
        this.renderer = renderer;

        const vertices = this.decodedGeom.vertices;
        const breakpoints = this.decodedGeom.breakpoints;

        this.addProperties(this.properties);

        const width = this.renderer.RTT_WIDTH;
        const height = Math.ceil(this.numFeatures / width);

        this.vertexBuffer = gl.createBuffer();
        this.featureIDBuffer = gl.createBuffer();

        this.texColor = this._createStyleTileTexture(this.numFeatures);
        this.texWidth = this._createStyleTileTexture(this.numFeatures);
        this.texStrokeColor = this._createStyleTileTexture(this.numFeatures);
        this.texStrokeWidth = this._createStyleTileTexture(this.numFeatures);
        this.texFilter = this._createStyleTileTexture(this.numFeatures);

        const ids = new Float32Array(vertices.length);
        let index = 0;
        for (let i = 0; i < vertices.length; i += 2) {
            if (!breakpoints.length) {
                if (i > 0) {
                    index++;
                }
            } else {
                while (i == breakpoints[index]) {
                    index++;
                }
            }
            // Transform integer ID into a `vec2` to overcome WebGL 1 limitations, output IDs will be in the `vec2([0,1], [0,1])` range
            ids[i + 0] = ((index) % width) / (width - 1);
            ids[i + 1] = height > 1 ? Math.floor((index) / width) / (height - 1) : 0.5;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        if (this.decodedGeom.normals) {
            this.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.decodedGeom.normals, gl.STATIC_DRAW);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.featureIDBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);
    }

    getFeaturesAtPosition(pos, viz) {
        switch (this.type) {
            case 'point':
                return this._getPointsAtPosition(pos, viz);
            case 'line':
                return this._getLinesAtPosition(pos, viz);
            case 'polygon':
                return this._getPolygonAtPosition(pos, viz);
            default:
                return [];
        }
    }

    inViewport(featureIndex, minx, miny, maxx, maxy) {
        switch (this.type) {
            case 'point':
            {
                const x = this.geom[2 * featureIndex + 0];
                const y = this.geom[2 * featureIndex + 1];
                return x > minx && x < maxx && y > miny && y < maxy;
            }
            case 'line':
            case 'polygon':
            {
                const aabb = this._aabb[featureIndex];
                return !(minx > aabb.maxx || maxx < aabb.minx || miny > aabb.maxy || maxy < aabb.miny);

            }
            default:
                return false;
        }
    }

    _getPointsAtPosition(p, viz) {
        p = Object(_client_rsys__WEBPACK_IMPORTED_MODULE_1__["wToR"])(p.x, p.y, { center: this.center, scale: this.scale });
        const points = this.decodedGeom.vertices;
        const features = [];
        // The viewport is in the [-1,1] range (on Y axis), therefore a pixel is equal to the range size (2) divided by the viewport height in pixels
        const widthScale = (2 / this.renderer.gl.canvas.clientHeight) / this.scale * this.renderer._zoom;
        const columnNames = Object.keys(this.properties);
        const vizWidth = viz.width;
        const vizStrokeWidth = viz.strokeWidth;

        for (let i = 0; i < points.length; i += 2) {
            const featureIndex = i / 2;
            const center = {
                x: points[i],
                y: points[i + 1],
            };
            const f = this._getFeature(columnNames, featureIndex);
            if (this._isFeatureFiltered(f, viz.filter)) {
                continue;
            }
            const pointWidth = vizWidth.eval(f);
            const pointStrokeWidth = vizStrokeWidth.eval(f);
            const diameter = Math.min(pointWidth + pointStrokeWidth, 126);

            // width and strokeWidth are diameters and scale is a radius, we need to divide by 2
            const scale = diameter / 2 * widthScale;
            const inside = pointInCircle(p, center, scale);
            if (inside) {
                features.push(this._getUserFeature(featureIndex));
            }
        }
        return features;
    }

    _getLinesAtPosition(pos, viz) {
        return this._getFeaturesFromTriangles(pos, viz.width, viz.filter);
    }
    _getPolygonAtPosition(pos, viz) {
        return this._getFeaturesFromTriangles(pos, viz.strokeWidth, viz.filter);
    }
    _getFeaturesFromTriangles(pos, widthExpression, filterExpression) {
        const p = Object(_client_rsys__WEBPACK_IMPORTED_MODULE_1__["wToR"])(pos.x, pos.y, { center: this.center, scale: this.scale });
        const vertices = this.decodedGeom.vertices;
        const normals = this.decodedGeom.normals;
        const breakpoints = this.decodedGeom.breakpoints;
        const features = [];
        // The viewport is in the [-1,1] range (on Y axis), therefore a pixel is equal to the range size (2) divided by the viewport height in pixels
        const widthScale = (2 / this.renderer.gl.canvas.clientHeight) / this.scale * this.renderer._zoom;
        const columnNames = Object.keys(this.properties);
        // Linear search for all features
        // Tests triangles since we already have the triangulated form
        // Moreover, with an acceleration structure and triangle testing features could be subdivided easily
        let featureIndex = -1;
        let scale;
        let computeScale = feature => {
            // Width is saturated at 336px
            const width = Math.min(widthExpression.eval(feature), 336);
            // width is a diameter and scale is radius-like, we need to divide by 2
            scale = width / 2 * widthScale;
        };
        for (let i = 0; i < vertices.length; i += 6) {
            if (i == 0 || i >= breakpoints[featureIndex]) {
                featureIndex++;
                const feature = this._getFeature(columnNames, featureIndex);
                if (this._isFeatureFiltered(feature, filterExpression)) {
                    i = breakpoints[featureIndex] - 6;
                    continue;
                }
                computeScale(feature);
            }
            const v1 = {
                x: vertices[i + 0] + normals[i + 0] * scale,
                y: vertices[i + 1] + normals[i + 1] * scale
            };
            const v2 = {
                x: vertices[i + 2] + normals[i + 2] * scale,
                y: vertices[i + 3] + normals[i + 3] * scale
            };
            const v3 = {
                x: vertices[i + 4] + normals[i + 4] * scale,
                y: vertices[i + 5] + normals[i + 5] * scale
            };
            const inside = pointInTriangle(p, v1, v2, v3);
            if (inside) {
                features.push(this._getUserFeature(featureIndex));
                // Don't repeat a feature if we the point is on a shared (by two triangles) edge
                // Also, don't waste CPU cycles
                i = breakpoints[featureIndex] - 6;
            }
        }
        return features;
    }

    _getFeature(columnNames, featureIndex) {
        const f = {};
        columnNames.forEach(name => {
            f[name] = this.properties[name][featureIndex];
        });
        return f;
    }
    _isFeatureFiltered(feature, filterExpression) {
        const isFiltered = filterExpression.eval(feature) < 0.5;
        return isFiltered;
    }

    _getUserFeature(featureIndex) {
        let id = '';
        const properties = {};
        Object.keys(this.properties).map(propertyName => {
            let prop = this.properties[propertyName][featureIndex];
            if (propertyName === 'cartodb_id') {
                id = prop;
            } else {
                const column = this.metadata.columns.find(c => c.name == propertyName);
                if (column && column.type == 'category') {
                    prop = this.metadata.categoryIDsToName[prop];
                }
                properties[propertyName] = prop;
            }
        });
        return { id, properties };
    }

    _addProperty(propertyName, propertiesFloat32Array) {
        if (!this.renderer) {
            // Properties will be bound to the GL context on the initial this.bind() call
            return;
        }
        // Dataframe is already bound to this context, "hot update" it
        const gl = this.renderer.gl;
        const width = this.renderer.RTT_WIDTH;
        const height = Math.ceil(this.numFeatures / width);
        this.height = height;

        let propertyID = this.propertyID[propertyName];
        if (propertyID === undefined) {
            propertyID = this.propertyCount;
            this.propertyCount++;
            this.propertyID[propertyName] = propertyID;
        }
        this.propertyTex[propertyID] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.propertyTex[propertyID]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA,
            width, height, 0, gl.ALPHA, gl.FLOAT,
            propertiesFloat32Array);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    // Add new properties to the dataframe or overwrite previously stored ones.
    // `properties` is of the form: {propertyName: Float32Array}
    addProperties(properties) {
        Object.keys(properties).forEach(propertyName => {
            this._addProperty(propertyName, properties[propertyName]);
            this.properties[propertyName] = properties[propertyName];
        });
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

// Returns true if p is inside the triangle or on a triangle's edge, false otherwise
// Parameters in {x: 0, y:0} form
function pointInTriangle(p, v1, v2, v3) {
    // https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
    // contains an explanation of both this algorithm and one based on barycentric coordinates,
    // which could be faster, but, nevertheless, it is quite similar in terms of required arithmetic operations

    if (equal(v1, v2) || equal(v2, v3) || equal(v3, v1)) {
        // Avoid zero area triangle
        return false;
    }

    // A point is inside a triangle or in one of the triangles edges
    // if the point is in the three half-plane defined by the 3 edges
    const b1 = halfPlaneTest(p, v1, v2) < 0;
    const b2 = halfPlaneTest(p, v2, v3) < 0;
    const b3 = halfPlaneTest(p, v3, v1) < 0;

    return (b1 == b2) && (b2 == b3);
}

// Tests if a point `p` is in the half plane defined by the line with points `a` and `b`
// Returns a negative number if the result is INSIDE, returns 0 if the result is ON_LINE,
// returns >0 if the point is OUTSIDE
// Parameters in {x: 0, y:0} form
function halfPlaneTest(p, a, b) {
    // We use the cross product of `PB x AB` to get `sin(angle(PB, AB))`
    // The result's sign is the half plane test result
    return (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
}

function equal(a, b) {
    return (a.x == b.x) && (a.y == b.y);
}

function pointInCircle(p, center, scale) {
    const diff = {
        x: p.x - center.x,
        y: p.y - center.y
    };
    const lengthSquared = diff.x * diff.x + diff.y * diff.y;
    return lengthSquared <= scale * scale;
}


/***/ }),

/***/ "./src/core/decoder.js":
/*!*****************************!*\
  !*** ./src/core/decoder.js ***!
  \*****************************/
/*! exports provided: decodeGeom, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "decodeGeom", function() { return decodeGeom; });
/* harmony import */ var earcut__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! earcut */ "./node_modules/earcut/src/earcut.js");
/* harmony import */ var earcut__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(earcut__WEBPACK_IMPORTED_MODULE_0__);



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
        return decodePoint(geom);
    }
    if (geomType == 'polygon') {
        return decodePolygon(geom);
    }
    if (geomType == 'line') {
        return decodeLine(geom);
    }
    throw new Error(`Unimplemented geometry type: '${geomType}'`);
}

function decodePoint(vertices) {
    return {
        vertices: vertices,
        breakpoints: []
    };
}

function isClipped(l) {
    return l[0] == -1 || l[0] == 1 || l[1] == -1 || l[1] == 1;
}

function decodePolygon(geometry) {
    let vertices = []; //Array of triangle vertices
    let normals = [];
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    geometry.forEach(feature => {
        feature.forEach(polygon => {
            const triangles = earcut__WEBPACK_IMPORTED_MODULE_0__(polygon.flat, polygon.holes);
            const trianglesLength = triangles.length;
            for (let i = 0; i < trianglesLength; i++) {
                const index = triangles[i];
                vertices.push(polygon.flat[2 * index], polygon.flat[2 * index + 1]);
                normals.push(0, 0);
            }

            const lineString = polygon.flat;
            for (let i = 0; i < lineString.length - 2; i += 2) {
                if (polygon.holes.includes((i + 2) / 2)) {
                    // Skip adding the line which connects two rings
                    continue;
                }

                const a = [lineString[i + 0], lineString[i + 1]];
                const b = [lineString[i + 2], lineString[i + 3]];

                if (isClipped(a) && isClipped(b)) {
                    continue;
                }

                let normal = getLineNormal(b, a);

                if (isNaN(normal[0]) || isNaN(normal[1])) {
                    // Skip when there is no normal vector
                    continue;
                }

                let na = normal;
                let nb = normal;

                // First triangle

                normals.push(-na[0], -na[1]);
                normals.push(na[0], na[1]);
                normals.push(-nb[0], -nb[1]);

                vertices.push(a[0], a[1]);
                vertices.push(a[0], a[1]);
                vertices.push(b[0], b[1]);

                // Second triangle

                normals.push(na[0], na[1]);
                normals.push(nb[0], nb[1]);
                normals.push(-nb[0], -nb[1]);

                vertices.push(a[0], a[1]);
                vertices.push(b[0], b[1]);
                vertices.push(b[0], b[1]);
            }
        });
        breakpoints.push(vertices.length);
    });
    return {
        vertices: new Float32Array(vertices),
        breakpoints,
        normals: new Float32Array(normals)
    };
}

function decodeLine(geom) {
    let vertices = [];
    let normals = [];
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    geom.map(feature => {
        feature.map(lineString => {
            // Create triangulation

            for (let i = 0; i < lineString.length - 2; i += 2) {
                const a = [lineString[i + 0], lineString[i + 1]];
                const b = [lineString[i + 2], lineString[i + 3]];
                const normal = getLineNormal(b, a);
                let na = normal;
                let nb = normal;

                if (i > 0) {
                    const prev = [lineString[i - 2], lineString[i - 1]];
                    na = getJointNormal(prev, a, b) || na;
                }
                if (i < lineString.length - 4) {
                    const next = [lineString[i + 4], lineString[i + 5]];
                    nb = getJointNormal(a, b, next) || nb;
                }

                // First triangle

                normals.push(-na[0], -na[1]);
                normals.push(na[0], na[1]);
                normals.push(-nb[0], -nb[1]);

                vertices.push(a[0], a[1]);
                vertices.push(a[0], a[1]);
                vertices.push(b[0], b[1]);

                // Second triangle

                normals.push(na[0], na[1]);
                normals.push(nb[0], nb[1]);
                normals.push(-nb[0], -nb[1]);

                vertices.push(a[0], a[1]);
                vertices.push(b[0], b[1]);
                vertices.push(b[0], b[1]);
            }
        });
        breakpoints.push(vertices.length);
    });
    return {
        vertices: new Float32Array(vertices),
        breakpoints,
        normals: new Float32Array(normals)
    };
}

function getLineNormal(a, b) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    return normalize([-dy, dx]);
}

function getJointNormal(a, b, c) {
    const u = normalize([a[0] - b[0], a[1] - b[1]]);
    const v = normalize([c[0] - b[0], c[1] - b[1]]);
    const sin = - u[1] * v[0] + u[0] * v[1];
    if (sin !== 0) {
        return [(u[0] + v[0]) / sin, (u[1] + v[1]) / sin];
    }
}

function normalize(v) {
    const s = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / s, v[1] / s];
}

/* harmony default export */ __webpack_exports__["default"] = ({ decodeGeom });


/***/ }),

/***/ "./src/core/metadata.js":
/*!******************************!*\
  !*** ./src/core/metadata.js ***!
  \******************************/
/*! exports provided: IDENTITY, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IDENTITY", function() { return IDENTITY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Metadata; });

// The IDENTITY metadata contains zero columns
const IDENTITY = {
    featureCount: 0,
    columns: []
};

/*
const metadataExample = {
    featureCount: 0,
    columns: [
        {
            name: 'temp',
            type: 'number',
            min: -10,
            max: 45,
            avg: 25,
            histogram: [3, 6, 10, 22, 21, 14, 2, 1],
            jenks3: [10, 20],
            jenks4: [8, 15, 22],
            jenks5: [7, 14, 18, 23],
            jenks6: [],
            jenks7: [],
        },
        {
            name: 'cat',
            type: 'category',
            categoryNames: ['red', 'blue', 'green'],
            categoryCount: [10, 30, 15],
        }
    ]
};
*/

class Metadata {
    constructor(categoryIDs, columns, featureCount, sample, geomType, isAggregated = false) {
        this.categoryIDsToName = {};
        Object.keys(categoryIDs).forEach(name=>{
            this.categoryIDsToName[categoryIDs[name]] = name;
        });

        this.categoryIDs = categoryIDs;
        this.columns = columns;
        this.featureCount = featureCount;
        this.sample = sample;
        this.geomType = geomType;
        this.isAggregated = isAggregated;
    }
}


/***/ }),

/***/ "./src/core/renderLayer.js":
/*!*********************************!*\
  !*** ./src/core/renderLayer.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return RenderLayer; });
/* harmony import */ var _api_feature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../api/feature */ "./src/api/feature.js");


class RenderLayer {
    constructor() {
        this.dataframes = [];
        this.renderer = null;
        this.viz = null;
        this.type = null;
        this.customizedFeatures = {};
    }
    // Performance-intensive. The required allocation and copy of resources will happen synchronously.
    // To achieve good performance, avoid multiple calls within the same event, particularly with large dataframes.
    addDataframe(dataframe) {
        if (this.type) {
            this._checkDataframeType(dataframe);
        }
        this.type = dataframe.type;
        if (this.renderer) {
            dataframe.bind(this.renderer);
        }
        this.dataframes.push(dataframe);
    }

    // Removes a dataframe for the renderer. Freeing its resources.
    removeDataframe(dataframe) {
        this.dataframes = this.dataframes.filter(df => df !== dataframe);
    }

    getActiveDataframes() {
        return this.dataframes.filter(df => df.active);
    }

    hasDataframes() {
        return this.dataframes.length > 0;
    }

    getNumFeatures() {
        return this.dataframes.filter(d => d.active).map(d => d.numFeatures).reduce((x, y) => x + y, 0);
    }

    _checkDataframeType(dataframe) {
        if (this.type != dataframe.type) {
            throw new Error('Layer dataframes must always be of the same type');
        }
    }

    getFeaturesAtPosition(pos) {
        if (!this.viz) {
            return [];
        }
        return [].concat(...this.getActiveDataframes().map(df => df.getFeaturesAtPosition(pos, this.viz))).map(this._generateApiFeature.bind(this));
    }

    /**
     * Return a public `Feature` object from the internal feature object obtained from a dataframe.
     */
    _generateApiFeature(rawFeature) {
        return new _api_feature__WEBPACK_IMPORTED_MODULE_0__["default"](rawFeature, this.viz, this.customizedFeatures, this.trackFeatureViz);
    }

    trackFeatureViz(featureID, vizProperty, newViz, customizedFeatures) {
        customizedFeatures[featureID] = customizedFeatures[featureID] || {};
        customizedFeatures[featureID][vizProperty] = newViz;
    }

    freeDataframes() {
        this.dataframes.map(df => df.free());
        this.dataframes = [];
        this.type = null;
    }
}


/***/ }),

/***/ "./src/core/renderer.js":
/*!******************************!*\
  !*** ./src/core/renderer.js ***!
  \******************************/
/*! exports provided: Renderer, Dataframe, schema */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Renderer", function() { return Renderer; });
/* harmony import */ var _shaders__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shaders */ "./src/core/shaders/index.js");
/* harmony import */ var _schema__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./schema */ "./src/core/schema.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "schema", function() { return _schema__WEBPACK_IMPORTED_MODULE_1__; });
/* harmony import */ var _dataframe__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./dataframe */ "./src/core/dataframe.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Dataframe", function() { return _dataframe__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _viz_functions__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./viz/functions */ "./src/core/viz/functions.js");





const INITIAL_TIMESTAMP = Date.now();

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
        const vertices = [
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

    getAspect() {
        if (this.gl) {
            return this.gl.canvas.width / this.gl.canvas.height;
        }
        return 1;
    }

    _computeDrawMetadata(renderLayer) {
        const tiles = renderLayer.getActiveDataframes();
        const viz = renderLayer.viz;
        const aspect = this.getAspect();
        let drawMetadata = {
            zoom: 1. / this._zoom,
            columns: []
        };

        const s = 1. / this._zoom;

        const rootExprs = viz._getRootExpressions();
        // Performance optimization to avoid doing DFS at each feature iteration
        const viewportExprs = [];
        function dfs(expr) {
            if (expr._isViewport) {
                viewportExprs.push(expr);
            } else {
                expr._getChildren().map(dfs);
            }
        }
        rootExprs.map(dfs);
        const numViewportExprs = viewportExprs.length;
        viewportExprs.forEach(expr => expr._resetViewportAgg());

        if (!viewportExprs.length) {
            return drawMetadata;
        }
        tiles.forEach(d => {
            d.vertexScale = [(s / aspect) * d.scale, s * d.scale];
            d.vertexOffset = [(s / aspect) * (this._center.x - d.center.x), s * (this._center.y - d.center.y)];
            const minx = (-1 + d.vertexOffset[0]) / d.vertexScale[0];
            const maxx = (1 + d.vertexOffset[0]) / d.vertexScale[0];
            const miny = (-1 + d.vertexOffset[1]) / d.vertexScale[1];
            const maxy = (1 + d.vertexOffset[1]) / d.vertexScale[1];

            const propertyNames = Object.keys(d.properties);
            const propertyNamesLength = propertyNames.length;
            const f = {};

            for (let i = 0; i < d.numFeatures; i++) {
                if (d.inViewport(i, minx, miny, maxx, maxy)) {

                    for (let j = 0; j < propertyNamesLength; j++) {
                        const name = propertyNames[j];
                        f[name] = d.properties[name][i];
                    }

                    if (viz.filter.eval(f) < 0.5) {
                        continue;
                    }

                    for (let j = 0; j < numViewportExprs; j++) {
                        const expr = viewportExprs[j];
                        expr._accumViewportAgg(f);
                    }
                }
            }
        });
        return drawMetadata;
    }

    renderLayer(layer) {
        const tiles = layer.getActiveDataframes();
        const viz = layer.viz;
        const gl = this.gl;
        const aspect = this.getAspect();

        if (!tiles.length) {
            return;
        }

        gl.enable(gl.CULL_FACE);

        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.STENCIL_TEST);
        gl.depthMask(false);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.auxFB);


        const drawMetadata = this._computeDrawMetadata(layer);

        Object.values(viz.variables).map(v => {
            v._updateDrawMetadata(drawMetadata);
        });

        const styleDataframe = (tile, tileTexture, shader, vizExpr) => {
            const TID = shader.tid;
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tileTexture, 0);
            gl.viewport(0, 0, RTT_WIDTH, tile.height);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(shader.program);
            // Enforce that property texture TextureUnit don't clash with auxiliar ones
            drawMetadata.freeTexUnit = Object.keys(TID).length;
            vizExpr._setTimestamp((Date.now() - INITIAL_TIMESTAMP) / 1000.);
            vizExpr._updateDrawMetadata(drawMetadata);
            vizExpr._preDraw(shader.program, drawMetadata, gl);

            Object.keys(TID).forEach((name, i) => {
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[tile.propertyID[name]]);
                gl.uniform1i(TID[name], i);
            });

            gl.enableVertexAttribArray(shader.vertexAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bigTriangleVBO);
            gl.vertexAttribPointer(shader.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.disableVertexAttribArray(shader.vertexAttribute);
        };
        tiles.map(tile => styleDataframe(tile, tile.texColor, viz.colorShader, viz.color));
        tiles.map(tile => styleDataframe(tile, tile.texWidth, viz.widthShader, viz.width));
        tiles.map(tile => styleDataframe(tile, tile.texStrokeColor, viz.strokeColorShader, viz.strokeColor));
        tiles.map(tile => styleDataframe(tile, tile.texStrokeWidth, viz.strokeWidthShader, viz.strokeWidth));
        tiles.map(tile => styleDataframe(tile, tile.texFilter, viz.filterShader, viz.filter));

        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        if (layer.type != 'point') {
            const antialiasingScale = (window.devicePixelRatio || 1) >= 2 ? 1 : 2;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._AAFB);
            const [w, h] = [gl.drawingBufferWidth, gl.drawingBufferHeight];

            if (w != this._width || h != this._height) {
                gl.bindTexture(gl.TEXTURE_2D, this._AATex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                    w * antialiasingScale, h * antialiasingScale, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._AATex, 0);

                [this._width, this._height] = [w, h];
            }
            gl.viewport(0, 0, w * antialiasingScale, h * antialiasingScale);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }

        const s = 1. / this._zoom;

        const { orderingMins, orderingMaxs } = getOrderingRenderBuckets(layer);

        const renderDrawPass = orderingIndex => tiles.forEach(tile => {
            let freeTexUnit = 0;
            let renderer = null;
            if (!viz.symbol._default) {
                renderer = viz.symbolShader;
            } else if (tile.type == 'point') {
                renderer = this.finalRendererProgram;
            } else if (tile.type == 'line') {
                renderer = this.lineRendererProgram;
            } else {
                renderer = this.triRendererProgram;
            }
            gl.useProgram(renderer.program);

            if (!viz.symbol._default) {
                gl.uniform1i(renderer.overrideColor, viz.color.default === undefined ? 1 : 0);
            }

            //Set filtering condition on "... AND feature is in current order bucket"
            gl.uniform1f(renderer.orderMinWidth, orderingMins[orderingIndex]);
            gl.uniform1f(renderer.orderMaxWidth, orderingMaxs[orderingIndex]);

            gl.uniform2f(renderer.vertexScaleUniformLocation,
                (s / aspect) * tile.scale,
                s * tile.scale);
            gl.uniform2f(renderer.vertexOffsetUniformLocation,
                (s / aspect) * (this._center.x - tile.center.x),
                s * (this._center.y - tile.center.y));
            if (tile.type == 'line' || tile.type == 'polygon') {
                gl.uniform2f(renderer.normalScale, 1 / gl.canvas.clientWidth, 1 / gl.canvas.clientHeight);
            } else if (tile.type == 'point') {
                gl.uniform1f(renderer.devicePixelRatio, window.devicePixelRatio || 1);
            }

            tile.vertexScale = [(s / aspect) * tile.scale, s * tile.scale];

            tile.vertexOffset = [(s / aspect) * (this._center.x - tile.center.x), s * (this._center.y - tile.center.y)];

            gl.enableVertexAttribArray(renderer.vertexPositionAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, tile.vertexBuffer);
            gl.vertexAttribPointer(renderer.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);


            gl.enableVertexAttribArray(renderer.featureIdAttr);
            gl.bindBuffer(gl.ARRAY_BUFFER, tile.featureIDBuffer);
            gl.vertexAttribPointer(renderer.featureIdAttr, 2, gl.FLOAT, false, 0, 0);

            if (tile.type == 'line' || tile.type == 'polygon') {
                gl.enableVertexAttribArray(renderer.normalAttr);
                gl.bindBuffer(gl.ARRAY_BUFFER, tile.normalBuffer);
                gl.vertexAttribPointer(renderer.normalAttr, 2, gl.FLOAT, false, 0, 0);
            }

            gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, tile.texColor);
            gl.uniform1i(renderer.colorTexture, freeTexUnit);
            freeTexUnit++;

            gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, tile.texWidth);
            gl.uniform1i(renderer.widthTexture, freeTexUnit);
            freeTexUnit++;


            gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, tile.texFilter);
            gl.uniform1i(renderer.filterTexture, freeTexUnit);
            freeTexUnit++;

            if (!viz.symbol._default) {
                // Enforce that property texture and style texture TextureUnits don't clash with auxiliar ones
                drawMetadata.freeTexUnit = freeTexUnit + Object.keys(viz.symbolShader.tid).length;
                viz.symbol._setTimestamp((Date.now() - INITIAL_TIMESTAMP) / 1000.);
                viz.symbol._updateDrawMetadata(drawMetadata);
                viz.symbol._preDraw(viz.symbolShader.program, drawMetadata, gl);

                viz.symbolPlacement._setTimestamp((Date.now() - INITIAL_TIMESTAMP) / 1000.);
                viz.symbolPlacement._updateDrawMetadata(drawMetadata);
                viz.symbolPlacement._preDraw(viz.symbolShader.program, drawMetadata, gl);

                freeTexUnit = drawMetadata.freeTexUnit;
                Object.keys(viz.symbolShader.tid).forEach(name => {
                    gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
                    gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[tile.propertyID[name]]);
                    gl.uniform1i(viz.symbolShader.tid[name], freeTexUnit);
                    freeTexUnit++;
                });

                gl.uniform2f(renderer.resolution, gl.canvas.width, gl.canvas.height);
            } else if (tile.type != 'line') {
                // Lines don't support stroke
                gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
                gl.bindTexture(gl.TEXTURE_2D, tile.texStrokeColor);
                gl.uniform1i(renderer.colorStrokeTexture, freeTexUnit);
                freeTexUnit++;

                gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
                gl.bindTexture(gl.TEXTURE_2D, tile.texStrokeWidth);
                gl.uniform1i(renderer.strokeWidthTexture, freeTexUnit);
                freeTexUnit++;
            }

            gl.drawArrays(tile.type == 'point' ? gl.POINTS : gl.TRIANGLES, 0, tile.numVertex);

            gl.disableVertexAttribArray(renderer.vertexPositionAttribute);
            gl.disableVertexAttribArray(renderer.featureIdAttr);
            if (tile.type == 'line' || tile.type == 'polygon') {
                gl.disableVertexAttribArray(renderer.normalAttr);
            }
        });
        orderingMins.map((_, orderingIndex) => {
            renderDrawPass(orderingIndex);
        });

        if (layer.type != 'point') {
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
        this.finalRendererProgram = _shaders__WEBPACK_IMPORTED_MODULE_0__["renderer"].createPointShader(this.gl);
        this.triRendererProgram = _shaders__WEBPACK_IMPORTED_MODULE_0__["renderer"].createTriShader(this.gl);
        this.lineRendererProgram = _shaders__WEBPACK_IMPORTED_MODULE_0__["renderer"].createLineShader(this.gl);
        this._aaBlendShader = new _shaders__WEBPACK_IMPORTED_MODULE_0__["AABlender"](this.gl);
    }
}

function getOrderingRenderBuckets(renderLayer) {
    const orderer = renderLayer.viz.order;
    let orderingMins = [0];
    let orderingMaxs = [1000];
    // We divide the ordering into 64 buckets of 2 pixels each, since the size limit is 127 pixels
    const NUM_BUCKETS = 64;
    if (orderer instanceof _viz_functions__WEBPACK_IMPORTED_MODULE_3__["Asc"]) {
        orderingMins = Array.from({ length: NUM_BUCKETS }, (_, i) => ((NUM_BUCKETS - 1) - i) * 2);
        orderingMaxs = Array.from({ length: NUM_BUCKETS }, (_, i) => i == 0 ? 1000 : ((NUM_BUCKETS - 1) - i + 1) * 2);
    } else if (orderer instanceof _viz_functions__WEBPACK_IMPORTED_MODULE_3__["Desc"]) {
        orderingMins = Array.from({ length: NUM_BUCKETS }, (_, i) => i * 2);
        orderingMaxs = Array.from({ length: NUM_BUCKETS }, (_, i) => i == (NUM_BUCKETS - 1) ? 1000 : (i + 1) * 2);
    }
    return {
        orderingMins,
        orderingMaxs
    };
}




/***/ }),

/***/ "./src/core/schema.js":
/*!****************************!*\
  !*** ./src/core/schema.js ***!
  \****************************/
/*! exports provided: IDENTITY, union, equals, column */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IDENTITY", function() { return IDENTITY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "union", function() { return union; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equals", function() { return equals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "column", function() { return column; });
// The IDENTITY schema contains zero columns, and it has two interesting properties:
//      union(a,IDENTITY)=union(IDENTITY, a)=a
//      contains(x, IDENTITY)=true  (for x = valid schema)
const IDENTITY = {
    columns: []
};

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
    return a.columns.length==b.columns.length && a.columns.every(v=> b.columns.includes(v));
}

const AGG_PREFIX = '_cdb_agg_';
const AGG_PATTERN = new RegExp('^' + AGG_PREFIX + '[a-zA-Z0-9]+_');

// column information functions
const column = {
    isAggregated: function isAggregated(name) {
        return name.startsWith(AGG_PREFIX);
    },
    getBase: function getBase(name) {
        return name.replace(AGG_PATTERN, '');
    },
    getAggFN: function getAggFN(name) {
        let s = name.substr(AGG_PREFIX.length);
        return s.substr(0, s.indexOf('_'));
    },
    aggColumn(name, aggFN) {
        return `${AGG_PREFIX}${aggFN}_${name}`;
    }
};



/***/ }),

/***/ "./src/core/shaders/Cache.js":
/*!***********************************!*\
  !*** ./src/core/shaders/Cache.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Cache; });
/**
 * Keep a cacheTo avoid recompiling webgl programs and shaders.
 * We need a different shader per webgl context so we use a 2 level cache where at the first level
 * the webgl context is the key and at the second level the shader code is the cache key.
 */
class Cache {
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


/***/ }),

/***/ "./src/core/shaders/common/AntiAliasingShader.js":
/*!*******************************************************!*\
  !*** ./src/core/shaders/common/AntiAliasingShader.js ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return AntiAliasingShader; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/core/shaders/utils.js");
/* harmony import */ var _antialiasing_glsl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./antialiasing-glsl */ "./src/core/shaders/common/antialiasing-glsl.js");



class AntiAliasingShader {
    constructor(gl) {
        Object.assign(this,  Object(_utils__WEBPACK_IMPORTED_MODULE_0__["compileProgram"])(gl, _antialiasing_glsl__WEBPACK_IMPORTED_MODULE_1__["VS"], _antialiasing_glsl__WEBPACK_IMPORTED_MODULE_1__["FS"]));
        this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
        this.readTU = gl.getUniformLocation(this.program, 'aaTex');
    }
}


/***/ }),

/***/ "./src/core/shaders/common/antialiasing-glsl.js":
/*!******************************************************!*\
  !*** ./src/core/shaders/common/antialiasing-glsl.js ***!
  \******************************************************/
/*! exports provided: VS, FS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VS", function() { return VS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FS", function() { return FS; });

const VS = `

precision highp float;
attribute vec2 vertex;

varying  vec2 uv;

void main(void) {
    uv = vertex*0.5+vec2(0.5);
    gl_Position = vec4(vertex, 0.5, 1.);
}
`;

const FS = `

precision highp float;

varying  vec2 uv;

uniform sampler2D aaTex;

void main(void) {
    vec4 aa = texture2D(aaTex, uv);
    gl_FragColor = aa;
}
`;


/***/ }),

/***/ "./src/core/shaders/geometry/LineShader.js":
/*!*************************************************!*\
  !*** ./src/core/shaders/geometry/LineShader.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return LineShader; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/core/shaders/utils.js");
/* harmony import */ var _line_glsl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./line-glsl */ "./src/core/shaders/geometry/line-glsl.js");




class LineShader {
    constructor(gl) {
        Object.assign(this,  Object(_utils__WEBPACK_IMPORTED_MODULE_0__["compileProgram"])(gl, _line_glsl__WEBPACK_IMPORTED_MODULE_1__["VS"], _line_glsl__WEBPACK_IMPORTED_MODULE_1__["FS"]));
        this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
        this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
        this.normalAttr = gl.getAttribLocation(this.program, 'normal');
        this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
        this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
        this.colorTexture = gl.getUniformLocation(this.program, 'colorTex');
        this.widthTexture = gl.getUniformLocation(this.program, 'widthTex');
        this.filterTexture = gl.getUniformLocation(this.program, 'filterTex');
        this.normalScale = gl.getUniformLocation(this.program, 'normalScale');
    }
}


/***/ }),

/***/ "./src/core/shaders/geometry/PointShader.js":
/*!**************************************************!*\
  !*** ./src/core/shaders/geometry/PointShader.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return PointShader; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/core/shaders/utils.js");
/* harmony import */ var _point_glsl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./point-glsl */ "./src/core/shaders/geometry/point-glsl.js");




class PointShader {
    constructor(gl) {
        Object.assign(this,  Object(_utils__WEBPACK_IMPORTED_MODULE_0__["compileProgram"])(gl, _point_glsl__WEBPACK_IMPORTED_MODULE_1__["VS"], _point_glsl__WEBPACK_IMPORTED_MODULE_1__["FS"]));
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
        this.devicePixelRatio = gl.getUniformLocation(this.program, 'devicePixelRatio');
    }
}


/***/ }),

/***/ "./src/core/shaders/geometry/TriangleShader.js":
/*!*****************************************************!*\
  !*** ./src/core/shaders/geometry/TriangleShader.js ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return TriangleShader; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/core/shaders/utils.js");
/* harmony import */ var _triangle_glsl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./triangle-glsl */ "./src/core/shaders/geometry/triangle-glsl.js");



class TriangleShader {
    constructor(gl) {
        Object.assign(this,  Object(_utils__WEBPACK_IMPORTED_MODULE_0__["compileProgram"])(gl, _triangle_glsl__WEBPACK_IMPORTED_MODULE_1__["VS"], _triangle_glsl__WEBPACK_IMPORTED_MODULE_1__["FS"]));
        this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
        this.normalAttr = gl.getAttribLocation(this.program, 'normal');
        this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
        this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
        this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
        this.colorTexture = gl.getUniformLocation(this.program, 'colorTex');
        this.colorStrokeTexture = gl.getUniformLocation(this.program, 'strokeColorTex');
        this.strokeWidthTexture = gl.getUniformLocation(this.program, 'strokeWidthTex');
        this.filterTexture = gl.getUniformLocation(this.program, 'filterTex');
        this.normalScale = gl.getUniformLocation(this.program, 'normalScale');
    }
}


/***/ }),

/***/ "./src/core/shaders/geometry/line-glsl.js":
/*!************************************************!*\
  !*** ./src/core/shaders/geometry/line-glsl.js ***!
  \************************************************/
/*! exports provided: VS, FS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VS", function() { return VS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FS", function() { return FS; });
const VS = `

precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;
attribute vec2 normal;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;
uniform vec2 normalScale;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D filterTex;

varying lowp vec4 color;

// From [0.,1.] in exponential-like form to pixels in [0.,255.]
float decodeWidth(float x){
    float w;
    if (x < 0.25098039215686274){ // x < 64/255
        w = 63.75 * x; // 255 * 0.25
    }else if (x < 0.5019607843137255){ // x < 128/255
        w = x*255. -48.;
    }else {
        w = x*510. -174.;
    }
    return w;
}

void main(void) {
    color = texture2D(colorTex, featureID);
    float filtering = texture2D(filterTex, featureID).a;
    color.a *= filtering;
    color.rgb *= color.a;
    float size = decodeWidth(texture2D(widthTex, featureID).a);

    vec4 p = vec4(vertexScale*(vertexPosition)+normalScale*normal*size-vertexOffset, 0.5, 1.);
    if (size==0. || color.a==0.){
        p.x=10000.;
    }
    gl_Position  = p;
}`;

const FS = `
precision highp float;

varying lowp vec4 color;

void main(void) {
    gl_FragColor = color;
}`;


/***/ }),

/***/ "./src/core/shaders/geometry/point-glsl.js":
/*!*************************************************!*\
  !*** ./src/core/shaders/geometry/point-glsl.js ***!
  \*************************************************/
/*! exports provided: VS, FS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VS", function() { return VS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FS", function() { return FS; });
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
uniform float devicePixelRatio;

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

// From [0.,1.] in exponential-like form to pixels in [0.,255.]
float decodeWidth(float x){
    float w;
    if (x < 0.25098039215686274){ // x < 64/255
        w = 63.75 * x; // 255 * 0.25
    }else if (x < 0.5019607843137255){ // x < 128/255
        w = x*255. -48.;
    }else {
        w = x*510. -174.;
    }
    return w;
}

void main(void) {
    color = texture2D(colorTex, featureID);
    stroke = texture2D(colorStrokeTex, featureID);
    float filtering = texture2D(filterTex, featureID).a;
    color.a *= filtering;
    stroke.a *= filtering;

    float size = decodeWidth(texture2D(widthTex, featureID).a);
    float fillSize = size;
    float strokeSize = decodeWidth(texture2D(strokeWidthTex, featureID).a);
    size+=strokeSize;
    fillScale=size/fillSize;
    strokeScale=size/max(0.001, (fillSize-strokeSize));
    if (fillScale==strokeScale){
        stroke.a=0.;
    }
    if (size > 126.){
        size = 126.;
    }
    gl_PointSize = size * devicePixelRatio + 2.;
    dp = 1.0/(size+1.);
    sizeNormalizer = (size+1.)/(size);

    vec4 p = vec4(vertexScale*vertexPosition-vertexOffset, 0.5, 1.);
    if (size==0. || (stroke.a==0. && color.a==0.) || size<orderMinWidth || size>=orderMaxWidth){
        p.x=10000.;
    }
    gl_Position  = p;
}`;

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


/***/ }),

/***/ "./src/core/shaders/geometry/triangle-glsl.js":
/*!****************************************************!*\
  !*** ./src/core/shaders/geometry/triangle-glsl.js ***!
  \****************************************************/
/*! exports provided: VS, FS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VS", function() { return VS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FS", function() { return FS; });
const VS = `

precision mediump float;

attribute vec2 vertexPosition;
attribute vec2 featureID;
attribute vec2 normal;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;
uniform vec2 normalScale;

uniform sampler2D colorTex;
uniform sampler2D strokeColorTex;
uniform sampler2D strokeWidthTex;
uniform sampler2D filterTex;

varying lowp vec4 color;

// From [0.,1.] in exponential-like form to pixels in [0.,255.]
float decodeWidth(float x){
    float w;
    if (x < 0.25098039215686274){ // x < 64/255
        w = 63.75 * x; // 255 * 0.25
    }else if (x < 0.5019607843137255){ // x < 128/255
        w = x*255. -48.;
    }else {
        w = x*510. -174.;
    }
    return w;
}

void main(void) {
    vec4 c;
    if (normal == vec2(0.)){
        c = texture2D(colorTex, featureID);
    }else{
        c = texture2D(strokeColorTex, featureID);
    }
    float filtering = texture2D(filterTex, featureID).a;
    c.a *= filtering;
    float size = decodeWidth(texture2D(strokeWidthTex, featureID).a);

    vec4 p = vec4(vertexScale*(vertexPosition)+normalScale*normal*size-vertexOffset, 0.5, 1.);

    if (c.a==0.){
        p.x=10000.;
    }
    color = vec4(c.rgb*c.a, c.a);
    gl_Position  = p;
}`;

const FS = `
precision lowp float;

varying lowp vec4 color;

void main(void) {
    gl_FragColor = color;
}`;


/***/ }),

/***/ "./src/core/shaders/index.js":
/*!***********************************!*\
  !*** ./src/core/shaders/index.js ***!
  \***********************************/
/*! exports provided: styleColorGLSL, styleWidthGLSL, styleFilterGLSL, createShaderFromTemplate, renderer, AABlender */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "styleColorGLSL", function() { return styleColorGLSL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "styleWidthGLSL", function() { return styleWidthGLSL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "styleFilterGLSL", function() { return styleFilterGLSL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createShaderFromTemplate", function() { return createShaderFromTemplate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "renderer", function() { return renderer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AABlender", function() { return AABlender; });
/* harmony import */ var _styler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styler */ "./src/core/shaders/styler.js");
/* harmony import */ var _common_AntiAliasingShader__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./common/AntiAliasingShader */ "./src/core/shaders/common/AntiAliasingShader.js");
/* harmony import */ var _geometry_LineShader__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./geometry/LineShader */ "./src/core/shaders/geometry/LineShader.js");
/* harmony import */ var _geometry_PointShader__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./geometry/PointShader */ "./src/core/shaders/geometry/PointShader.js");
/* harmony import */ var _geometry_TriangleShader__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./geometry/TriangleShader */ "./src/core/shaders/geometry/TriangleShader.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils */ "./src/core/shaders/utils.js");









const styleColorGLSL = {
    VS: _styler__WEBPACK_IMPORTED_MODULE_0__["VS"],
    FS: _styler__WEBPACK_IMPORTED_MODULE_0__["FS"].replace('$style_inline', '$color_inline').replace('$style_preface', '$color_preface')
};
const styleWidthGLSL = {
    VS: _styler__WEBPACK_IMPORTED_MODULE_0__["VS"],
    FS: _styler__WEBPACK_IMPORTED_MODULE_0__["FS"].replace('$style_inline', 'vec4(encodeWidth($width_inline))').replace('$style_preface',
        `   // From pixels in [0.,255.] to [0.,1.] in exponential-like form
        float encodeWidth(float x){
            if (x<16.){
                x = x*4.;
            }else if (x<80.){
                x = (x-16.)+64.;
            }else{
                x = (x-80.)*0.5 + 128.;
            }
            return x / 255.;
        }

        $width_preface
        ` )
};
const styleFilterGLSL = {
    VS: _styler__WEBPACK_IMPORTED_MODULE_0__["VS"],
    FS: _styler__WEBPACK_IMPORTED_MODULE_0__["FS"].replace('$style_inline', 'vec4($filter_inline)').replace('$style_preface', '$filter_preface')
};



const AABlender = _common_AntiAliasingShader__WEBPACK_IMPORTED_MODULE_1__["default"];

const renderer = {
    createPointShader: gl => new _geometry_PointShader__WEBPACK_IMPORTED_MODULE_3__["default"](gl),
    createTriShader: gl => new _geometry_TriangleShader__WEBPACK_IMPORTED_MODULE_4__["default"](gl),
    createLineShader: gl => new _geometry_LineShader__WEBPACK_IMPORTED_MODULE_2__["default"](gl)
};

function createShaderFromTemplate(gl, glslTemplate, codes) {
    let VS = glslTemplate.VS;
    let FS = glslTemplate.FS;

    Object.keys(codes).forEach(codeName => {
        VS = VS.replace('$' + codeName, codes[codeName]);
        FS = FS.replace('$' + codeName, codes[codeName]);
    });
    const shader = Object(_utils__WEBPACK_IMPORTED_MODULE_5__["compileProgram"])(gl, VS, FS);
    shader.vertexAttribute = gl.getAttribLocation(shader.program, 'vertex');
    shader.vertexPositionAttribute = gl.getAttribLocation(shader.program, 'vertexPosition');
    shader.featureIdAttr = gl.getAttribLocation(shader.program, 'featureID');
    shader.vertexScaleUniformLocation = gl.getUniformLocation(shader.program, 'vertexScale');
    shader.vertexOffsetUniformLocation = gl.getUniformLocation(shader.program, 'vertexOffset');
    shader.colorTexture = gl.getUniformLocation(shader.program, 'colorTex');
    shader.colorStrokeTexture = gl.getUniformLocation(shader.program, 'colorStrokeTex');
    shader.strokeWidthTexture = gl.getUniformLocation(shader.program, 'strokeWidthTex');
    shader.widthTexture = gl.getUniformLocation(shader.program, 'widthTex');
    shader.orderMinWidth = gl.getUniformLocation(shader.program, 'orderMinWidth');
    shader.orderMaxWidth = gl.getUniformLocation(shader.program, 'orderMaxWidth');
    shader.filterTexture = gl.getUniformLocation(shader.program, 'filterTex');
    shader.devicePixelRatio = gl.getUniformLocation(shader.program, 'devicePixelRatio');
    shader.resolution = gl.getUniformLocation(shader.program, 'resolution');
    shader.overrideColor = gl.getUniformLocation(shader.program, 'overrideColor');
    return shader;
}




/***/ }),

/***/ "./src/core/shaders/styler.js":
/*!************************************!*\
  !*** ./src/core/shaders/styler.js ***!
  \************************************/
/*! exports provided: VS, FS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VS", function() { return VS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FS", function() { return FS; });
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

const FS = `

precision highp float;

varying vec2 uv;

$style_preface
$propertyPreface

void main(void) {
    vec2 featureID = uv;
    gl_FragColor = $style_inline;
}
`;


/***/ }),

/***/ "./src/core/shaders/symbolizer.js":
/*!****************************************!*\
  !*** ./src/core/shaders/symbolizer.js ***!
  \****************************************/
/*! exports provided: symbolizerGLSL */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "symbolizerGLSL", function() { return symbolizerGLSL; });

const symbolizerGLSL = {
    VS: `

precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;
uniform float orderMinWidth;
uniform float orderMaxWidth;
uniform float devicePixelRatio;
uniform vec2 resolution;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D filterTex;
//TODO order bucket texture

varying highp vec2 featureIDVar;
varying highp vec4 color;

// From [0.,1.] in exponential-like form to pixels in [0.,255.]
float decodeWidth(float x){
    x*=255.;
    if (x < 64.){
        return x*0.25;
    }else if (x<128.){
        return (x-64.)+16.;
    }else{
        return (x-127.)*2.+80.;
    }
}

$symbolPlacement_preface
$propertyPreface

void main(void) {
    featureIDVar = featureID;
    color = texture2D(colorTex, featureID);
    float filtering = texture2D(filterTex, featureID).a;
    color.a *= filtering;

    float size = decodeWidth(texture2D(widthTex, featureID).a);
    float fillSize = size;
    if (size > 126.){
        size = 126.;
    }
    gl_PointSize = size * devicePixelRatio;

    vec4 p = vec4(vertexScale*vertexPosition-vertexOffset, 0.5, 1.);
    p.xy += ($symbolPlacement_inline)*gl_PointSize/resolution;
    if (size==0. || color.a==0. || size<orderMinWidth || size>=orderMaxWidth){
        p.x=10000.;
    }
    gl_Position  = p;
}`,

    FS: `
precision highp float;

varying highp vec2 featureIDVar;
varying highp vec4 color;

uniform bool overrideColor;

$symbol_preface
$propertyPreface

void main(void) {
    vec2 featureID = featureIDVar;
    vec2 spriteUV = gl_PointCoord.xy;
    vec4 symbolColor = $symbol_inline;

    vec4 c;
    if (overrideColor){
        c = color * vec4(vec3(1), symbolColor.a);
    }else{
        c = symbolColor;
    }

    gl_FragColor = vec4(c.rgb*c.a, c.a);
}`
};


/***/ }),

/***/ "./src/core/shaders/utils.js":
/*!***********************************!*\
  !*** ./src/core/shaders/utils.js ***!
  \***********************************/
/*! exports provided: compileProgram */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "compileProgram", function() { return compileProgram; });
/* harmony import */ var _Cache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Cache */ "./src/core/shaders/Cache.js");


let programID = 1;
const shaderCache = new _Cache__WEBPACK_IMPORTED_MODULE_0__["default"]();
const programCache = new _Cache__WEBPACK_IMPORTED_MODULE_0__["default"]();

/**
 * Compile a webgl program.
 * Use a cache to improve speed.
 *
 * @param {WebGLRenderingContext} gl - The context where the program will be executed
 * @param {string} glslVS - vertex shader code
 * @param {string} glslFS - fragment shader code
 */
function compileProgram(gl, glslVS, glslFS) {
    const code = glslVS + glslFS;
    if (programCache.has(gl, code)) {
        return programCache.get(gl, code);
    }
    const shader = {};
    const VS = compileShader(gl, glslVS, gl.VERTEX_SHADER);
    const FS = compileShader(gl, glslFS, gl.FRAGMENT_SHADER);
    shader.program = gl.createProgram();
    gl.attachShader(shader.program, VS);
    gl.attachShader(shader.program, FS);
    gl.linkProgram(shader.program);
    gl.deleteShader(VS);
    gl.deleteShader(FS);
    if (!gl.getProgramParameter(shader.program, gl.LINK_STATUS)) {
        throw new Error('Unable to link the shader program: ' + gl.getProgramInfoLog(shader.program));
    }
    shader.programID = programID++;
    programCache.set(gl, code, shader);
    return shader;
}

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


/***/ }),

/***/ "./src/core/viz/colorspaces.js":
/*!*************************************!*\
  !*** ./src/core/viz/colorspaces.js ***!
  \*************************************/
/*! exports provided: sRGBToCielab, cielabToSRGB */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sRGBToCielab", function() { return sRGBToCielab; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cielabToSRGB", function() { return cielabToSRGB; });
/* harmony import */ var _expressions_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./expressions/utils */ "./src/core/viz/expressions/utils.js");


function sRGBToCielab(srgb) {
    return XYZToCieLab(sRGBToXYZ(srgb));
}
function cielabToSRGB(cielab) {
    return XYZToSRGB(cielabToXYZ(cielab));
}


// Following functionality has been inspired by http://www.getreuer.info/home/colorspace
// License:
/*
License (BSD)
Copyright © 2005–2010, Pascal Getreuer
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE U
*/

// Convert sRGB to CIE XYZ with the D65 white point
function sRGBToXYZ(srgb) {
    // Poynton, "Frequently Asked Questions About Color," page 10
    // Wikipedia: http://en.wikipedia.org/wiki/SRGB
    // Wikipedia: http://en.wikipedia.org/wiki/CIE_1931_color_space
    const { r, g, b, a } = sRGBToLinearRGB(srgb);
    return {
        x: (0.4123955889674142161 * r + 0.3575834307637148171 * g + 0.1804926473817015735 * b),
        y: (0.2125862307855955516 * r + 0.7151703037034108499 * g + 0.07220049864333622685 * b),
        z: (0.01929721549174694484 * r + 0.1191838645808485318 * g + 0.9504971251315797660 * b),
        a
    };
}
function sRGBToLinearRGB({ r, g, b, a }) {
    // http://en.wikipedia.org/wiki/SRGB
    const inverseGammaCorrection = t =>
        t <= 0.0404482362771076 ? t / 12.92 : Math.pow((t + 0.055) / 1.055, 2.4);
    return {
        r: inverseGammaCorrection(r),
        g: inverseGammaCorrection(g),
        b: inverseGammaCorrection(b),
        a,
    };
}
function linearRGBToSRGB({ r, g, b, a }) {
    // http://en.wikipedia.org/wiki/SRGB
    const gammaCorrection = t =>
        t <= 0.0031306684425005883 ? 12.92 * t : 1.055 * Math.pow(t, 0.416666666666666667) - 0.055;
    return {
        r: gammaCorrection(r),
        g: gammaCorrection(g),
        b: gammaCorrection(b),
        a,
    };
}

const WHITEPOINT_D65_X = 0.950456;
const WHITEPOINT_D65_Y = 1.0;
const WHITEPOINT_D65_Z = 1.088754;

// Convert CIE XYZ to CIE L*a*b* (CIELAB) with the D65 white point
function XYZToCieLab({ x, y, z, a }) {
    // Wikipedia: http://en.wikipedia.org/wiki/Lab_color_space

    const xn = WHITEPOINT_D65_X;
    const yn = WHITEPOINT_D65_Y;
    const zn = WHITEPOINT_D65_Z;

    const f = t =>
        t >= 8.85645167903563082e-3 ?
            Math.pow(t, 0.333333333333333) : (841.0 / 108.0) * t + 4.0 / 29.0;

    return {
        l: 116 * f(y / yn) - 16,
        a: 500 * (f(x / xn) - f(y / yn)),
        b: 200 * (f(y / yn) - f(z / zn)),
        alpha: a
    };
}

// Convert CIE XYZ to sRGB with the D65 white point
function XYZToSRGB({ x, y, z, a }) {
    // Poynton, "Frequently Asked Questions About Color," page 10
    // Wikipedia: http://en.wikipedia.org/wiki/SRGB
    // Wikipedia: http://en.wikipedia.org/wiki/CIE_1931_color_space

    // Convert XYZ to linear RGB
    const r = Object(_expressions_utils__WEBPACK_IMPORTED_MODULE_0__["clamp"])(3.2406 * x - 1.5372 * y - 0.4986 * z, 0, 1);
    const g = Object(_expressions_utils__WEBPACK_IMPORTED_MODULE_0__["clamp"])(-0.9689 * x + 1.8758 * y + 0.0415 * z, 0, 1);
    const b = Object(_expressions_utils__WEBPACK_IMPORTED_MODULE_0__["clamp"])(0.0557 * x - 0.2040 * y + 1.0570 * z, 0, 1);

    return linearRGBToSRGB({ r, g, b, a });
}

// Convert CIE L*a*b* (CIELAB) to CIE XYZ with the D65 white point
function cielabToXYZ({ l, a, b, alpha }) {
    // Wikipedia: http://en.wikipedia.org/wiki/Lab_color_space

    const f = t =>
        ((t >= 0.206896551724137931) ?
            ((t) * (t) * (t)) : (108.0 / 841.0) * ((t) - (4.0 / 29.0)));

    return {
        x: WHITEPOINT_D65_X * f((l + 16) / 116 + a / 500),
        y: WHITEPOINT_D65_Y * f((l + 16) / 116),
        z: WHITEPOINT_D65_Z * f((l + 16) / 116 - b / 200),
        a: alpha
    };
}


/***/ }),

/***/ "./src/core/viz/expressions/aggregation/clusterAggregation.js":
/*!********************************************************************!*\
  !*** ./src/core/viz/expressions/aggregation/clusterAggregation.js ***!
  \********************************************************************/
/*! exports provided: ClusterAvg, ClusterMax, ClusterMin, ClusterMode, ClusterSum */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ClusterAvg", function() { return ClusterAvg; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ClusterMax", function() { return ClusterMax; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ClusterMin", function() { return ClusterMin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ClusterMode", function() { return ClusterMode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ClusterSum", function() { return ClusterSum; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _schema__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../schema */ "./src/core/schema.js");
/* harmony import */ var _basic_property__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../basic/property */ "./src/core/viz/expressions/basic/property.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");





/**
 * Aggregate using the average. This operation disables the access to the property
 * except within other cluster aggregate functions.
 *
 * Note: `clusterAvg` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number} property - Column of the table to be aggregated
 * @return {Number} Aggregated column
 *
 * @example <caption>Use cluster average of the population as width.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.clusterAvg(s.prop('population'))
 * });
 *
 * @example <caption>Use cluster average of the population as width. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: clusterAvg($population)
 * `);
 *
 * @memberof carto.expressions
 * @name clusterAvg
 * @function
 * @api
 */
const ClusterAvg = genAggregationOp('clusterAvg', 'number');

/**
 * Aggregate using the maximum. This operation disables the access to the property
 * except within other cluster aggregate functions.
 *
 * Note: `clusterMax` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number} property - Column of the table to be aggregated
 * @return {Number} Aggregated column
 *
 * @example <caption>Use cluster maximum of the population as width.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.clusterMax(s.prop('population'))
 * });
 *
 * @example <caption>Use cluster maximum of the population as width. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: clusterMax($population)
 * `);
 *
 * @memberof carto.expressions
 * @name clusterMax
 * @function
 * @api
 */
const ClusterMax = genAggregationOp('clusterMax', 'number');

/**
 * Aggregate using the minimum. This operation disables the access to the property
 * except within other cluster aggregate functions.
 *
 * Note: `clusterMin` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number} property - Column of the table to be aggregated
 * @return {Number} Aggregated column
 *
 * @example <caption>Use cluster minimum of the population as width.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.clusterMin(s.prop('population'))
 * });
 *
 * @example <caption>Use cluster minimum of the population as width. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: clusterMin($population)
 * `);
 *
 * @memberof carto.expressions
 * @name clusterMin
 * @function
 * @api
 */
const ClusterMin = genAggregationOp('clusterMin', 'number');

/**
 * Aggregate using the mode. This operation disables the access to the property
 * except within other cluster aggregate functions.
 *
 * Note: `clusterMode` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Category} property - Column of the table to be aggregated
 * @return {Category} Aggregated column
 *
 * @example <caption>Use cluster mode of the population in a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.clusterMode(s.prop('category')), s.palettes.PRISM)
 * });
 *
 * @example <caption>Use cluster mode of the population in a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(clusterMode($category), PRISM)
 * `);
 *
 * @memberof carto.expressions
 * @name clusterMode
 * @function
 * @api
 */
const ClusterMode = genAggregationOp('clusterMode', 'category');

/**
 * Aggregate using the sum. This operation disables the access to the property
 * except within other cluster aggregate functions.
 *
 * Note: `clusterSum` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number} property - Column of the table to be aggregated
 * @return {Number} Aggregated column
 *
 * @example <caption>Use cluster sum of the population as width.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.clusterSum(s.prop('population'))
 * });
 *
 * @example <caption>Use cluster sum of the population as width. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: clusterSum($population)
 * `);
 *
 * @memberof carto.expressions
 * @name clusterSum
 * @function
 * @api
 */
const ClusterSum = genAggregationOp('clusterSum', 'number');

function genAggregationOp(expressionName, aggType) {
    const aggName = expressionName.replace('cluster', '').toLowerCase();
    return class AggregationOperation extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
        constructor(property) {
            Object(_utils__WEBPACK_IMPORTED_MODULE_3__["checkInstance"])(expressionName, 'property', 0, _basic_property__WEBPACK_IMPORTED_MODULE_2__["default"], property);
            super({ property });
            this._aggName = aggName;
            this.type = aggType;
        }
        get name() {
            return this.property.name;
        }
        get aggName() {
            return this._aggName;
        }
        get numCategories() {
            return this.property.numCategories;
        }
        eval(feature) {
            return feature[_schema__WEBPACK_IMPORTED_MODULE_1__["column"].aggColumn(this.property.name, aggName)];
        }
        //Override super methods, we don't want to let the property use the raw column, we must use the agg suffixed one
        _compile(metadata) {
            super._compile(metadata);
            Object(_utils__WEBPACK_IMPORTED_MODULE_3__["checkType"])(expressionName, 'property', 0, aggType, this.property);
        }
        _applyToShaderSource(getGLSLforProperty) {
            return {
                preface: '',
                inline: `${getGLSLforProperty(_schema__WEBPACK_IMPORTED_MODULE_1__["column"].aggColumn(this.property.name, aggName))}`
            };
        }
        _postShaderCompile() { }
        _getMinimumNeededSchema() {
            return {
                columns: [
                    _schema__WEBPACK_IMPORTED_MODULE_1__["column"].aggColumn(this.property.name, aggName)
                ]
            };
        }
    };
}


/***/ }),

/***/ "./src/core/viz/expressions/aggregation/globalAggregation.js":
/*!*******************************************************************!*\
  !*** ./src/core/viz/expressions/aggregation/globalAggregation.js ***!
  \*******************************************************************/
/*! exports provided: GlobalAvg, GlobalMax, GlobalMin, GlobalSum, GlobalCount, GlobalPercentile */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GlobalAvg", function() { return GlobalAvg; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GlobalMax", function() { return GlobalMax; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GlobalMin", function() { return GlobalMin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GlobalSum", function() { return GlobalSum; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GlobalCount", function() { return GlobalCount; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GlobalPercentile", function() { return GlobalPercentile; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../functions */ "./src/core/viz/functions.js");
/* harmony import */ var _schema__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../schema */ "./src/core/schema.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");





/**
 * Return the average of the feature property for the entire source data.
 *
 * Note: `globalAvg` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number} property - property expression of number type
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the global average of the `amount` property to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      g_avg: s.globalAvg(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the global average of the `amount` property to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@g_avg: globalAvg($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalAvg
 * @function
 * @api
 */
const GlobalAvg = generateGlobalAggregattion('avg');

/**
 * Return the maximum of the feature property for the entire source data.
 *
 * Note: `globalMax` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number|Date} property - property expression of date or number type
 * @return {Number|Date} Result of the aggregation
 *
 * @example <caption>Assign the global maximum of the `amount` property to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      g_max: s.globalMax(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the global maximum of the `amount` property to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@g_max: globalMax($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalMax
 * @function
 * @api
 */
const GlobalMax = generateGlobalAggregattion('max');

/**
 * Return the minimum of the feature property for the entire source data.
 *
 * Note: `globalMin` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number|Date} property - property expression of date or number type
 * @return {Number|Date} Result of the aggregation
 *
 * @example <caption>Assign the global minimum of the `amount` property to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      g_min: s.globalMin(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the global minimum of the `amount` property to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@g_min: globalMin($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalMin
 * @function
 * @api
 */
const GlobalMin = generateGlobalAggregattion('min');

/**
 * Return the sum of the feature property for the entire source data.
 *
 * Note: `globalSum` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number} property - property expression of number type
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the global sum of the `amount` property to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      g_sum: s.globalSum(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the global sum of the `amount` property to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@g_sum: globalSum($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalSum
 * @function
 * @api
 */
const GlobalSum = generateGlobalAggregattion('sum');

/**
 * Return the feature count for the entire source data.
 *
 * Note: `globalCount` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number} property - property expression
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the global count of the `amount` property to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      g_count: s.globalCount(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the global count of the `amount` property to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@g_count: globalCount($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalCount
 * @function
 * @api
 */
const GlobalCount = generateGlobalAggregattion('count');


function generateGlobalAggregattion(metadataPropertyName) {
    return class GlobalAggregattion extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
        /**
         * @param {*} property
         */
        constructor(property) {
            super({ _value: Object(_functions__WEBPACK_IMPORTED_MODULE_1__["number"])(0) });
            this.property = Object(_utils__WEBPACK_IMPORTED_MODULE_3__["implicitCast"])(property);
        }
        isFeatureDependent(){
            return false;
        }
        get value() {
            return this._value.expr;
        }

        eval() {
            return this._value.expr;
        }

        _compile(metadata) {
            super._compile(metadata);
            // TODO improve type check
            this.property._compile(metadata);
            this.type = 'number';
            super.inlineMaker = inline => inline._value;
            this._value.expr = metadata.columns.find(c => c.name === this.property.name)[metadataPropertyName];
        }
        _getMinimumNeededSchema() {
            return this.property._getMinimumNeededSchema();
        }
        _getColumnName() {
            if (this.property.aggName) {
                // Property has aggregation
                return _schema__WEBPACK_IMPORTED_MODULE_2__["column"].aggColumn(this.property.name, this.property.aggName);
            }
            return this.property.name;
        }
    };
}


/**
 * Return the Nth percentile of the feature property for the entire source data.
 *
 * Note: `globalPercentile` can only be created by {@link carto.expressions.prop|carto.expressions.prop}, not other expressions.
 *
 * @param {Number} property - property expression of number type
 * @param {Number} percentile - Numeric expression [0, 100]
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the global percentile of the `amount` property to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      g_percentile: s.globalPercentile(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the global percentile of the `amount` property to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@g_percentile: globalPercentile($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name globalPercentile
 * @function
 * @api
 */
class GlobalPercentile extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    /**
     * @param {*} property
     */
    constructor(property, percentile) {
        if (!Number.isFinite(percentile)) {
            throw new Error('Percentile must be a fixed literal number');
        }
        super({ _value: Object(_functions__WEBPACK_IMPORTED_MODULE_1__["number"])(0) });
        // TODO improve type check
        this.property = property;
        this.percentile = percentile;
    }
    isFeatureDependent(){
        return false;
    }
    get value() {
        return this._value.expr;
    }

    _compile(metadata) {
        super._compile(metadata);
        this.property._compile(metadata);
        this.type = 'number';
        super.inlineMaker = inline => inline._value;
        const copy = metadata.sample.map(s => s[this.property.name]);
        copy.sort((x, y) => x - y);
        const p = this.percentile / 100;
        this._value.expr = copy[Math.floor(p * copy.length)];
    }
    _getMinimumNeededSchema() {
        return this.property._getMinimumNeededSchema();
    }
    _getColumnName() {
        if (this.property.aggName) {
            // Property has aggregation
            return _schema__WEBPACK_IMPORTED_MODULE_2__["column"].aggColumn(this.property.name, this.property.aggName);
        }
        return this.property.name;
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/aggregation/viewportAggregation.js":
/*!*********************************************************************!*\
  !*** ./src/core/viz/expressions/aggregation/viewportAggregation.js ***!
  \*********************************************************************/
/*! exports provided: ViewportAvg, ViewportMax, ViewportMin, ViewportSum, ViewportCount, ViewportPercentile, ViewportHistogram */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ViewportAvg", function() { return ViewportAvg; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ViewportMax", function() { return ViewportMax; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ViewportMin", function() { return ViewportMin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ViewportSum", function() { return ViewportSum; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ViewportCount", function() { return ViewportCount; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ViewportPercentile", function() { return ViewportPercentile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ViewportHistogram", function() { return ViewportHistogram; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../functions */ "./src/core/viz/functions.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");




/**
 * Return the average value of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {Number} input - numeric expression
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the average of the `amount` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_avg: s.viewportAvg(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the average of the `amount` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_avg: viewportAvg($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportAvg
 * @function
 * @api
 */
const ViewportAvg = genViewportAgg('avg',
    self => {
        self._sum = 0; self._count = 0;
    },
    (self, x) => {
        if (!Number.isNaN(x)) {
            self._count++;
            self._sum += x;
        }
    },
    self => self._sum / self._count
);

/**
 * Return the maximum value of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {Number} input - numeric expression
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the maximum of the `amount` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_max: s.viewportMax(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the maximum of the `amount` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_max: viewportMax($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportMax
 * @function
 * @api
 */
const ViewportMax = genViewportAgg('max',
    self => { self._value = Number.NEGATIVE_INFINITY; },
    (self, y) => {
        if (!Number.isNaN(y)) {
            self._value = Math.max(self._value, y);
        }
    },
    self => self._value
);

/**
 * Return the minimum value of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {Number} input - numeric expression
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the minimum of the `amount` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_min: s.viewportMin(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the minimum of the `amount` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_min: viewportMin($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportMin
 * @function
 * @api
 */
const ViewportMin = genViewportAgg('min',
    self => { self._value = Number.POSITIVE_INFINITY; },
    (self, y) => {
        if (!Number.isNaN(y)) {
            self._value = Math.min(self._value, y);
        }
    },
    self => self._value);

/**
 * Return the sum of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {Number} input - numeric expression
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the sum of the `amount` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_sum: s.viewportSum(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the sum of the `amount` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_sum: viewportSum($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportSum
 * @function
 * @api
 */
const ViewportSum = genViewportAgg('sum',
    self => { self._value = 0; },
    (self, y) => {
        if (!Number.isNaN(y)) {
            self._value = self._value + y;
        }
    },
    self => self._value);

/**
 * Return the feature count of the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {Number} input - numeric expression
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the feature count in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_count: s.viewportCount(s.prop('amount'))
 *   }
 * });
 *
 * @example <caption>Assign the feature count in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_count: viewportCount($amount)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportCount
 * @function
 * @api
 */
const ViewportCount = genViewportAgg('count',
    self => { self._value = 0; },
    self => { self._value++; },
    self => self._value);



function genViewportAgg(metadataPropertyName, zeroFn, accumFn, resolveFn) {
    return class ViewportAggregation extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
        /**
         * @param {*} property
         */
        constructor(property) {
            super({
                property: Object(_utils__WEBPACK_IMPORTED_MODULE_2__["implicitCast"])(metadataPropertyName == 'count' ? Object(_functions__WEBPACK_IMPORTED_MODULE_1__["number"])(0) : property),
                _impostor: Object(_functions__WEBPACK_IMPORTED_MODULE_1__["number"])(0)
            });
            this._isViewport = true;
        }

        isFeatureDependent() {
            return false;
        }

        get value() {
            return resolveFn(this);
        }

        eval() {
            return resolveFn(this);
        }

        _compile(metadata) {
            super._compile(metadata);
            // TODO improve type check
            this.property._compile(metadata);
            this.type = 'number';
            super.inlineMaker = inline => inline._impostor;
        }

        _getMinimumNeededSchema() {
            return this.property._getMinimumNeededSchema();
        }

        _resetViewportAgg() {
            zeroFn(this);
        }

        _accumViewportAgg(feature) {
            accumFn(this, this.property.eval(feature));
        }

        _preDraw(...args) {
            this._impostor.expr = this.eval();
            super._preDraw(...args);
        }
    };
}

/**
 * Return the Nth percentile of an expression for the features showed in the viewport (features outside the viewport and features that don't pass the filter will be excluded).
 *
 * @param {Number} input - Numeric expression
 * @param {Number} percentile - Numeric expression [0, 100]
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the percentile of the `amount` property in the viewport to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_percentile: s.viewportPercentile(s.prop('amount'), 90)
 *   }
 * });
 *
 * @example <caption>Assign the percentile of the `amount` property in the viewport to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_percentile: viewportPercentile($amount, 90)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportPercentile
 * @function
 * @api
 */
class ViewportPercentile extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    /**
     * @param {*} property
     */
    constructor(property, percentile) {
        super({
            property: Object(_utils__WEBPACK_IMPORTED_MODULE_2__["implicitCast"])(property),
            percentile: Object(_utils__WEBPACK_IMPORTED_MODULE_2__["implicitCast"])(percentile),
            impostor: Object(_functions__WEBPACK_IMPORTED_MODULE_1__["number"])(0)
        });
        this._isViewport = true;
    }

    isFeatureDependent() {
        return false;
    }

    get value() {
        return this.eval();
    }

    eval(f) {
        if (this._value == null) {
            this._array.sort((a, b) => a - b);
            const index = Object(_utils__WEBPACK_IMPORTED_MODULE_2__["clamp"])(
                Math.floor(this.percentile.eval(f) / 100 * this._array.length),
                0, this._array.length - 1);
            this._value = this._array[index];
        }
        return this._value;
    }

    _compile(metadata) {
        super._compile(metadata);
        // TODO improve type check
        this.property._compile(metadata);
        this.type = 'number';
        super.inlineMaker = inline => inline.impostor;
    }

    _getMinimumNeededSchema() {
        return this.property._getMinimumNeededSchema();
    }

    _resetViewportAgg() {
        this._value = null;
        this._array = [];
    }

    _accumViewportAgg(feature) {
        const v = this.property.eval(feature);
        this._array.push(v);
    }

    _preDraw(...args) {
        this.impostor.expr = this.eval();
        super._preDraw(...args);
    }
}

/**
 * Generates an histogram.
 *
 * The histogram can be based on a categorical expression, in which case each category will correspond to a histogram bar.
 * The histogram can be based on a numeric expression, in which case the minimum and maximum will be computed automatically and bars will be generated
 * at regular intervals between the minimum and maximum. The number of bars in this case is controllable through the `size` parameter.
 *
 * Histograms are useful to get insights and create widgets outside the scope of CARTO VL, see the following example for more info.
 *
 * @param {Number} input - expression to base the histogram
 * @param {Number} weight - Weight each occurrence differently based on this weight, defaults to `1`, which will generate a simple, non-weighted count.
 * @param {Number} size - Optional (defaults to 1000). Number of bars to use if `x` is a numeric expression
 * @return {Histogram} Histogram
 *
 * @example <caption>Create and use an histogram. (String)</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz(`
 *          \@categoryHistogram: viewportHistogram($type)
 *          \@numericHistogram:  viewportHistogram($amount, 1, 3)
 * `);
 * ...
 * console.log(viz.variables.categoryHistogram.eval());
 * // [{x: 'typeA', y: 10}, {x: 'typeB', y: 20}]
 * // There are 10 features of type A and 20 of type B
 *
 * console.log(viz.variables.numericHistogram.eval());
 * // [{x: [0,10],  y: 20}, {x: [10,20],  y: 7}, {x: [20, 30], y: 3}]
 * // There are 20 features with an amount between 0 and 10, 7 features with an amount between 10 and 20, and 3 features with an amount between 20 and 30
 *
 * @memberof carto.expressions
 * @name viewportPercentile
 * @function
 * @api
 */
class ViewportHistogram extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(x, weight = 1, size = 1000) {
        super({
            x: Object(_utils__WEBPACK_IMPORTED_MODULE_2__["implicitCast"])(x),
            weight: Object(_utils__WEBPACK_IMPORTED_MODULE_2__["implicitCast"])(weight),
        });
        this._size = size;
        this._isViewport = true;
        this.inlineMaker = () => null;
    }

    _resetViewportAgg() {
        this._cached = null;
        this._histogram = new Map();
    }

    _accumViewportAgg(feature) {
        const x = this.x.eval(feature);
        const weight = this.weight.eval(feature);
        const count = this._histogram.get(x) || 0;
        this._histogram.set(x, count + weight);
    }

    get value() {
        if (this._cached == null) {
            if (!this._histogram) {
                return null;
            }
            if (this.x.type == 'number') {
                const array = [...this._histogram];
                let min = Number.POSITIVE_INFINITY;
                let max = Number.NEGATIVE_INFINITY;
                for (let i = 0; i < array.length; i++) {
                    const x = array[i][0];
                    min = Math.min(min, x);
                    max = Math.max(max, x);
                }
                const hist = Array(this._size).fill(0);
                const range = max - min;
                const sizeMinusOne = this._size - 1;
                for (let i = 0; i < array.length; i++) {
                    const x = array[i][0];
                    const y = array[i][1];
                    const index = Math.min(Math.floor(this._size * (x - min) / range), sizeMinusOne);
                    hist[index] += y;
                }
                this._cached = hist.map((count, index) => {
                    return {
                        x: [min + index / this._size * range, min + (index + 1) / this._size * range],
                        y: count,
                    };
                });
            } else {
                this._cached = [...this._histogram].map(([x, y]) => {
                    return { x: this._metatada.categoryIDsToName[x], y };
                });
            }
        }
        return this._cached;
    }

    _compile(metadata) {
        this._metatada = metadata;
        super._compile(metadata);
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/animate.js":
/*!*********************************************!*\
  !*** ./src/core/viz/expressions/animate.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Animate; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");



/**
 * Animate returns a number from zero to one based on the elapsed number of milliseconds since the viz was instantiated.
 * The animation is not cyclic. It will stick to one once the elapsed number of milliseconds reach the animation's duration.
 *
 * @param {number} duration - Animation duration in milliseconds
 * @return {Number}
 *
 * @memberof carto.expressions
 * @name animate
 * @function
 * @api
 */
//TODO refactor to use uniformfloat class
class Animate extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(duration) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkNumber"])('animate', 'duration', 0, duration);
        if (duration < 0) {
            throw new Error(Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStringErrorPreface"])('animate', 'duration', 0) + 'duration must be greater than or equal to 0');
        }
        super({});
        this.aTime = Date.now();
        this.bTime = this.aTime + Number(duration);
        this.type = 'number';
    }
    eval() {
        const time = Date.now();
        this.mix = (time - this.aTime) / (this.bTime - this.aTime);
        return Math.min(this.mix, 1.);
    }
    isAnimated() {
        return !this.mix || this.mix <= 1.;
    }
    _applyToShaderSource() {
        return {
            preface: this._prefaceCode(`uniform float anim${this._uid};\n`),
            inline: `anim${this._uid}`
        };
    }
    _postShaderCompile(program, gl) {
        this._getBinding(program).uniformLocation = gl.getUniformLocation(program, `anim${this._uid}`);
    }
    _preDraw(program, drawMetadata, gl) {
        const time = Date.now();
        this.mix = (time - this.aTime) / (this.bTime - this.aTime);
        if (this.mix > 1.) {
            gl.uniform1f(this._getBinding(program).uniformLocation, 1);
        } else {
            gl.uniform1f(this._getBinding(program).uniformLocation, this.mix);
        }
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/base.js":
/*!******************************************!*\
  !*** ./src/core/viz/expressions/base.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Base; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../functions */ "./src/core/viz/functions.js");
/* harmony import */ var _schema__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../schema */ "./src/core/schema.js");




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
 * @hideconstructor
 * @abstract
 * @IGNOREapi
 */
class Base {
    /**
     * @hideconstructor
     * @param {*} children
     * @param {*} inlineMaker
     * @param {*} preface
     */
    constructor(children) {
        this.childrenNames = Object.keys(children);
        Object.keys(children).map(name => this[name] = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["implicitCast"])(children[name]));
        this._getChildren().map(child => child.parent = this);
        this.preface = '';
        this._shaderBindings = new Map();
    }

    loadSprites() {
        return Promise.all(this._getChildren().map(child => child.loadSprites()));
    }

    _bind(metadata) {
        this._compile(metadata);
        return this;
    }

    _setUID(idGenerator) {
        this._uid = idGenerator.getID(this);
        this._getChildren().map(child => child._setUID(idGenerator));
    }

    isFeatureDependent(){
        return this._getChildren().some(child => child.isFeatureDependent());
    }

    _prefaceCode(glslCode) {
        if (!glslCode) {
            return '';
        }
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
     * @name blendTo
     */
    blendTo(final, duration = 500) {
        //TODO blendFunc = 'linear'
        final = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["implicitCast"])(final);
        const parent = this.parent;
        const blender = Object(_functions__WEBPACK_IMPORTED_MODULE_1__["blend"])(this, final, Object(_functions__WEBPACK_IMPORTED_MODULE_1__["animate"])(duration));
        parent.replaceChild(this, blender);
        blender.notify();
        return final;
    }

    _blendFrom(final, duration = 500, interpolator = null) {
        final = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["implicitCast"])(final);
        const parent = this.parent;
        const blender = Object(_functions__WEBPACK_IMPORTED_MODULE_1__["blend"])(final, this, Object(_functions__WEBPACK_IMPORTED_MODULE_1__["animate"])(duration), interpolator);
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
        return this._getChildren().map(child => child._getMinimumNeededSchema()).reduce(_schema__WEBPACK_IMPORTED_MODULE_2__["union"], _schema__WEBPACK_IMPORTED_MODULE_2__["IDENTITY"]);
    }
    // eslint-disable-next-line no-unused-vars
    eval(feature) {
        throw new Error('Unimplemented');
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/basic/array.js":
/*!*************************************************!*\
  !*** ./src/core/viz/expressions/basic/array.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BaseArray; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");



/**
 * Wrapper around arrays. Explicit usage is unnecessary since CARTO VL will wrap implicitly all arrays using this function.
 *
 * @param {Number[]|Category[]|Color[]|Date[]} elements
 * @returns {Array}
 *
 * @memberof carto.expressions
 * @name array
 * @function
 * @IGNOREapi
 */
class BaseArray extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(elems) {
        elems = elems || [];
        if (!Array.isArray(elems)) {
            elems = [elems];
        }
        elems = elems.map(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"]);
        if (!elems.length) {
            throw new Error('array(): invalid parameters: must receive at least one argument');
        }
        let type = '';
        for (let elem of elems) {
            type = elem.type;
            if (elem.type != undefined) {
                break;
            }
        }
        if (['number', 'category', 'color', 'time', undefined].indexOf(type) == -1) {
            throw new Error(`array(): invalid parameters type: ${type}`);
        }
        elems.map((item, index) => {
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkExpression"])('array', `item[${index}]`, index, item);
            if (item.type != type && item.type != undefined) {
                throw new Error(`array(): invalid ${Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getOrdinalFromIndex"])(index+1)} parameter type, invalid argument type combination`);
            }
        });
        super({});
        this.type = type + '-array';
        this.elems = elems;
        try {
            this.elems.map(c => c.value);
        } catch (error) {
            throw new Error('Arrays must be formed by constant expressions, they cannot depend on feature properties');
        }
    }
    get value() {
        return this.elems.map(c => c.value);
    }
    eval() {
        return this.elems.map(c => c.eval());
    }
    _resolveAliases(aliases) {
        this.elems.map(c => c._resolveAliases(aliases));
    }
    _compile(metadata) {
        super._compile(metadata);
  
        const type = this.elems[0].type;
        if (['number', 'category', 'color', 'time'].indexOf(type) == -1) {
            throw new Error(`array(): invalid parameters type: ${type}`);
        }
        this.elems.map((item, index) => {
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkExpression"])('array', `item[${index}]`, index, item);
            if (item.type != type) {
                throw new Error(`array(): invalid ${Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getOrdinalFromIndex"])(index)} parameter, invalid argument type combination`);
            }
        });
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/basic/category.js":
/*!****************************************************!*\
  !*** ./src/core/viz/expressions/basic/category.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BaseCategory; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");



/**
 * Wrapper around category names. Explicit usage is unnecessary since CARTO VL will wrap implicitly all strings using this function.
 *
 * @param {string} categoryName
 * @returns {Category} category expression with the name provided
 *
 * @memberof carto.expressions
 * @name category
 * @function
 * @IGNOREapi
 */
class BaseCategory extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(categoryName) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkString"])('category', 'categoryName', 0, categoryName);
        super({});
        this.expr = categoryName;
        this.type = 'category';
    }
    get value() {
        // Return the plain string
        return this.expr;
    }
    eval() {
        if (this._metadata) {
            // If it has metadata return the category ID
            return this._metadata.categoryIDs[this.expr];
        }
    }
    isAnimated() {
        return false;
    }
    _compile(metadata) {
        this._metadata = metadata;
    }
    _applyToShaderSource() {
        return {
            preface: this._prefaceCode(`uniform float cat${this._uid};\n`),
            inline: `cat${this._uid}`
        };
    }
    _postShaderCompile(program, gl) {
        this._getBinding(program).uniformLocation = gl.getUniformLocation(program, `cat${this._uid}`);
    }
    _preDraw(program, drawMetadata, gl) {
        const id = this._metadata.categoryIDs[this.expr];
        gl.uniform1f(this._getBinding(program).uniformLocation, id);
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/basic/constant.js":
/*!****************************************************!*\
  !*** ./src/core/viz/expressions/basic/constant.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Constant; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");



/**
 * Wraps a constant number. Implies a GPU optimization vs {@link carto.expressions.number|number expression}.
 *
 * @param {number} x - A number to be warped in a constant numeric expression
 * @return {Number} Numeric expression
 *
 * @example <caption>Creating a constant number expression.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.constant(15)
 * });
 *
 * @example <caption>Creating a constant number expression. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: constant(15)
 * `);
 *
 * @memberof carto.expressions
 * @name constant
 * @function
 * @api
 */
class Constant extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(x) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkNumber"])('constant', 'x', 0, x);
        super({});
        this.expr = x;
        this.type = 'number';
        this.inlineMaker = () => `(${x.toFixed(20)})`;
    }
    get value() {
        return this.eval();
    }
    eval() {
        return this.expr;
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/basic/number.js":
/*!**************************************************!*\
  !*** ./src/core/viz/expressions/basic/number.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BaseNumber; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");



/**
 * Wraps a number. Explicit usage is unnecessary since CARTO VL will wrap implicitly all numbers using this function.
 *
 * @param {number} x - A number to be warped in a numeric expression
 * @return {Number} Numeric expression
 *
 * @example <caption>Creating a number expression.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.number(15)  // Equivalent to `width: 15`
 * });
 *
 * @example <caption>Creating a number expression. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 15  // Equivalent to number(15)
 * `);
 *
 * @memberof carto.expressions
 * @name number
 * @function
 * @IGNOREapi
 */
class BaseNumber extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(x) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkNumber"])('number', 'x', 0, x);
        super({});
        this.expr = x;
        this.type = 'number';
    }
    get value() {
        return this.eval();
    }
    eval() {
        return this.expr;
    }
    isAnimated() {
        return false;
    }
    _applyToShaderSource() {
        return {
            preface: this._prefaceCode(`uniform float number${this._uid};`),
            inline: `number${this._uid}`
        };
    }
    _postShaderCompile(program, gl) {
        this._getBinding(program).uniformLocation = gl.getUniformLocation(program, `number${this._uid}`);
    }
    _preDraw(program, drawMetadata, gl) {
        gl.uniform1f(this._getBinding(program).uniformLocation, this.expr);
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/basic/property.js":
/*!****************************************************!*\
  !*** ./src/core/viz/expressions/basic/property.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Property; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");



/**
 * Evaluates the value of a column for every row in the dataset.
 *
 * For example think about a dataset containing 3 cities: Barcelona, Paris and London.
 * The `prop('name')` will return the name of the current city for every point in the dataset.
 *
 * @param {string} name - The property in the dataset that is going to be evaluated
 * @return {Number|Category|Date}
 *
 * @example <caption>Display only cities with name different from "London".</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  filter: s.neq(s.prop('name'), 'london')
 * });
 *
 * @example <caption>Display only cities with name different from "London". (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: neq(prop('name'), 'london')
 * `);
 *
 * const viz = new carto.Viz(`
 *   filter: $name != 'london'
 * `);
 *
 * @memberof carto.expressions
 * @name prop
 * @function
 * @api
 */
class Property extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(name) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkString"])('property', 'name', 0, name);
        if (name == '') {
            throw new Error('property(): invalid parameter, zero-length string');
        }
        super({});
        this.name = name;
    }
    isFeatureDependent(){
        return true;
    }
    get value() {
        return this.eval();
    }
    eval(feature) {
        if (!feature) {
            throw new Error('A property needs to be evaluated in a feature');
        }
        return feature[this.name];
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
        super._setGenericGLSL((childInlines, getGLSLforProperty) => getGLSLforProperty(this.name));
    }
    _applyToShaderSource(getGLSLforProperty) {
        return {
            preface: '',
            inline: getGLSLforProperty(this.name)
        };
    }
    _getMinimumNeededSchema() {
        return {
            columns: [
                this.name
            ]
        };
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/basic/variable.js":
/*!****************************************************!*\
  !*** ./src/core/viz/expressions/basic/variable.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Variable; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");



/**
 * Alias to a named variable defined in the Viz.
 *
 * @param {string} name - The variable name that is going to be evaluated
 * @return {Number|Category|Color|Date}
 *
 * @example <caption></caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *     sum_price: s.clusterSum(s.prop('price'))
 *   }
 *  filter: s.neq(s.var('sum_price'), 'london'),
 * });
 *
 * @example <caption>(String)</caption>
 * const viz = new carto.Viz(`
 *   @sum_price: clusterSum($price)
 *   filter: @sum_price != 'london'
 * `);
 *
 * @memberof carto.expressions
 * @name var
 * @function
 * @api
 */
class Variable extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(name) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkString"])('variable', 'name', 0, name);
        if (name == '') {
            throw new Error('variable(): invalid parameter, zero-length string');
        }
        super({});
        this.name = name;
    }
    isFeatureDependent(){
        return this.alias? this.alias.isFeatureDependent(): undefined;
    }
    get value() {
        return this.eval();
    }
    eval(feature) {
        if (this.alias) {
            return this.alias.eval(feature);
        }
    }
    _resolveAliases(aliases) {
        if (aliases[this.name]) {
            this.childrenNames.push('alias');
            this.childrenNames = [...(new Set(this.childrenNames))];
            this.alias = aliases[this.name];
        } else {
            throw new Error(`variable() name '${this.name}' doesn't exist`);
        }
    }
    _compile(meta) {
        this.alias._compile(meta);
        this.type = this.alias.type;
    }
    _applyToShaderSource(getGLSLforProperty) {
        return this.alias._applyToShaderSource(getGLSLforProperty);
    }
    _getDependencies() {
        return [this.alias];
    }
    _getMinimumNeededSchema() {
        return this.alias._getMinimumNeededSchema();
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/belongs.js":
/*!*********************************************!*\
  !*** ./src/core/viz/expressions/belongs.js ***!
  \*********************************************/
/*! exports provided: In, Nin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "In", function() { return In; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Nin", function() { return Nin; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");



/**
 * Check if a categorical value belongs to a list of categories.
 *
 * @param {Category} value - Categorical expression to be tested against the whitelist
 * @param {Category[]} list - Multiple expression parameters that will form the whitelist
 * @return {Number} Numeric expression with the result of the check
 *
 * @example <caption>Display only cities where $type is 'metropolis' or 'capital'.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.in(s.prop('type'), ['metropolis', 'capital'])
 * });
 *
 * @example <caption>Display only cities where $type is 'metropolis' or 'capital'. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: in($type, ['metropolis', 'capital'])
 * `);
 *
 * @memberof carto.expressions
 * @name in
 * @function
 * @api
 */
const In = generateBelongsExpression('in', IN_INLINE_MAKER, (value, list) => list.some(item => item == value) ? 1 : 0);

function IN_INLINE_MAKER(list) {
    if (list.length == 0) {
        return () => '0.';
    }
    return inline => `(${list.map((cat, index) => `(${inline.value} == ${inline[`arg${index}`]})`).join(' || ')})? 1.: 0.`;
}

/**
 * Check if value does not belong to the list of elements.
 *
 * @param {Category} value - Categorical expression to be tested against the blacklist
 * @param {Category[]} list - Multiple expression parameters that will form the blacklist
 * @return {Number} Numeric expression with the result of the check
 *
 * @example <caption>Display only cities where $type is not 'metropolis' or 'capital'.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.nin(s.prop('type'), ['metropolis', 'capital'])
 * });
 *
 * @example <caption>Display only cities where $type is not 'metropolis' or 'capital'. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: nin($type, ['metropolis', 'capital'])
 * `);
 *
 * @memberof carto.expressions
 * @name nin
 * @function
 * @api
 */
const Nin = generateBelongsExpression('nin', NIN_INLINE_MAKER, (value, list) => list.some(item => item == value) ? 0 : 1);

function NIN_INLINE_MAKER(list) {
    if (list.length == 0) {
        return () => '1.';
    }
    return inline => `(${list.map((cat, index) => `(${inline.value} != ${inline[`arg${index}`]})`).join(' && ')})? 1.: 0.`;
}

function generateBelongsExpression(name, inlineMaker, jsEval) {
    return class BelongExpression extends _base__WEBPACK_IMPORTED_MODULE_1__["default"] {
        constructor(value, list) {
            value = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["implicitCast"])(value);
            list = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["implicitCast"])(list);

            Object(_utils__WEBPACK_IMPORTED_MODULE_0__["checkExpression"])(name, 'value', 0, value);
            Object(_utils__WEBPACK_IMPORTED_MODULE_0__["checkExpression"])(name, 'list', 1, list);

            Object(_utils__WEBPACK_IMPORTED_MODULE_0__["checkLooseType"])(name, 'value', 0, 'category', value);
            Object(_utils__WEBPACK_IMPORTED_MODULE_0__["checkLooseType"])(name, 'list', 1, 'category-array', list);

            let children = { value };
            list.elems.map((arg, index) => children[`arg${index}`] = arg);
            super(children);
            this.list = list;
            this.inlineMaker = inlineMaker(this.list.elems);
            this.type = 'number';
        }
        eval(feature) {
            return jsEval(this.value.eval(feature), this.list.eval());
        }
        _compile(meta) {
            super._compile(meta);
            Object(_utils__WEBPACK_IMPORTED_MODULE_0__["checkType"])(name, 'value', 0, 'category', this.value);
            Object(_utils__WEBPACK_IMPORTED_MODULE_0__["checkType"])(name, 'list', 1, 'category-array', this.list);
        }
    };
}


/***/ }),

/***/ "./src/core/viz/expressions/between.js":
/*!*********************************************!*\
  !*** ./src/core/viz/expressions/between.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Between; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");



/**
 * Check if a given value is contained within an inclusive range (including the limits).
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {Number} value - Numeric expression that is going to be tested against the [lowerLimit, upperLimit] range
 * @param {Number} lowerLimit - Numeric expression with the lower limit of the range
 * @param {Number} upperLimit -  Numeric expression with the upper limit of the range
 * @return {Number} Numeric expression with the result of the check
 *
 * @example <caption>Display only cities where the population density is within the [50,100] range.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.between(s.prop('dn'), 50, 100);
 * });
 *
 * @example <caption>Display only cities where the population density is within the [50,100] range. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: between($dn, 50, 100)
 * `);
 *
 * @memberof carto.expressions
 * @name between
 * @function
 * @api
 */
class Between extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(value, lowerLimit, upperLimit) {
        value = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(value);
        lowerLimit = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(lowerLimit);
        upperLimit = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(upperLimit);

        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('between', 'value', 0, 'number', value);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('between', 'lowerLimit', 1, 'number', lowerLimit);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('between', 'upperLimit', 2, 'number', upperLimit);

        super({ value, lowerLimit, upperLimit });
        this.type = 'number';
    }
    eval(feature) {
        const value = this.value.eval(feature);
        const lower = this.lowerLimit.eval(feature);
        const upper = this.upperLimit.eval(feature);
        return (value >= lower && value <= upper) ? 1 : 0;
    }
    _compile(meta) {
        super._compile(meta);

        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('between', 'value', 0, 'number', this.value);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('between', 'lowerLimit', 1, 'number', this.lowerLimit);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('between', 'upperLimit', 2, 'number', this.upperLimit);

        this.inlineMaker = inline => `((${inline.value} >= ${inline.lowerLimit} &&  ${inline.value} <= ${inline.upperLimit}) ? 1. : 0.)`;
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/binary.js":
/*!********************************************!*\
  !*** ./src/core/viz/expressions/binary.js ***!
  \********************************************/
/*! exports provided: Mul, Div, Add, Sub, Mod, Pow, GreaterThan, GreaterThanOrEqualTo, LessThan, LessThanOrEqualTo, Equals, NotEquals, Or, And */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Mul", function() { return Mul; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Div", function() { return Div; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Add", function() { return Add; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Sub", function() { return Sub; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Mod", function() { return Mod; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Pow", function() { return Pow; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GreaterThan", function() { return GreaterThan; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GreaterThanOrEqualTo", function() { return GreaterThanOrEqualTo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LessThan", function() { return LessThan; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LessThanOrEqualTo", function() { return LessThanOrEqualTo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Equals", function() { return Equals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NotEquals", function() { return NotEquals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Or", function() { return Or; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "And", function() { return And; });
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../functions */ "./src/core/viz/functions.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");




// Each binary expression can have a set of the following signatures (OR'ed flags)
const UNSUPPORTED_SIGNATURE = 0;
const NUMBERS_TO_NUMBER = 1;
const NUMBER_AND_COLOR_TO_COLOR = 2;
const COLORS_TO_COLOR = 4;
const CATEGORIES_TO_NUMBER = 8;
const SPRITES_TO_SPRITE = 16;

/**
 * Multiply two numeric expressions.
 *
 * @param {Number|Color} x - First value to multiply
 * @param {Number|Color} y - Second value to multiply
 * @return {Number|Color} Result of the multiplication
 *
 * @example <caption>Number multiplication.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.mul(5, 5)  // 25
 * });
 *
 * @example <caption>Number multiplication. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 5 * 5  // Equivalent to mul(5, 5)
 * `);
 *
 * @memberof carto.expressions
 * @name mul
 * @function
 * @api
 */
const Mul = genBinaryOp('mul',
    NUMBERS_TO_NUMBER | NUMBER_AND_COLOR_TO_COLOR | COLORS_TO_COLOR | SPRITES_TO_SPRITE,
    (x, y) => x * y,
    (x, y) => `(${x} * ${y})`
);

/**
 * Divide two numeric expressions.
 *
 * @param {Number|Color} numerator - Numerator of the division
 * @param {Number|Color} denominator - Denominator of the division
 * @return {Number|Color} Result of the division
 *
 * @example <caption>Number division.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.div(10, 2)  // 5
 * });
 *
 * @example <caption>Number division. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 10 / 2  // Equivalent to div(10, 2)
 * `);
 *
 * @memberof carto.expressions
 * @name div
 * @function
 * @api
 */
const Div = genBinaryOp('div',
    NUMBERS_TO_NUMBER | NUMBER_AND_COLOR_TO_COLOR | COLORS_TO_COLOR | SPRITES_TO_SPRITE,
    (x, y) => x / y,
    (x, y) => `(${x} / ${y})`
);

/**
 * Add two numeric expressions.
 *
 * @param {Number|Color} x - First value to add
 * @param {Number|Color} y - Second value to add
 * @return {Number|Color} Result of the addition
 *
 * @example <caption>Number addition.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.add(10, 2)  // 12
 * });
 *
 * @example <caption>Number addition. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 10 + 2  // Equivalent to add(10, 2)
 * `);
 *
 * @memberof carto.expressions
 * @name add
 * @function
 * @api
 */
const Add = genBinaryOp('add',
    NUMBERS_TO_NUMBER | COLORS_TO_COLOR | SPRITES_TO_SPRITE,
    (x, y) => x + y,
    (x, y) => `(${x} + ${y})`
);

/**
 * Substract two numeric expressions.
 *
 * @param {Number|Color} minuend - The minuend of the subtraction
 * @param {Number|Color} subtrahend - The subtrahend of the subtraction
 * @return {Number|Color} Result of the substraction
 *
 * @example <caption>Number subtraction.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.sub(10, 2)  // 8
 * });
 *
 * @example <caption>Number subtraction. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 10 - 2  // Equivalent to sub(10, 2)
 * `);
 *
 * @memberof carto.expressions
 * @name sub
 * @function
 * @api
 */
const Sub = genBinaryOp('sub',
    NUMBERS_TO_NUMBER | COLORS_TO_COLOR | SPRITES_TO_SPRITE,
    (x, y) => x - y,
    (x, y) => `(${x} - ${y})`
);

/**
 * Modulus of two numeric expressions, mod returns a numeric expression with the value of x modulo y. This is computed as x - y * floor(x/y).
 *
 * @param {Number} x - First value of the modulus
 * @param {Number} y - Second value of the modulus
 * @return {Number} Result of the modulus
 *
 * @example <caption>Number modulus.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.mod(10, 6)  // 4
 * });
 *
 * @example <caption>Number modulus. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 10 % 6  // Equivalent to mod(10, 6)
 * `);
 *
 * @memberof carto.expressions
 * @name mod
 * @function
 * @api
 */
const Mod = genBinaryOp('mod',
    NUMBERS_TO_NUMBER,
    (x, y) => x % y,
    (x, y) => `mod(${x}, ${y})`
);

/**
 * Compute the base to the exponent power, return a numeric expression with the value of the first parameter raised to the power of the second.
 * The result is undefined if x<0 or if x=0 and y≤0.
 *
 * @param {Number} base - Base of the power
 * @param {Number} exponent - Exponent of the power
 * @return {Number} Result of the power
 *
 * @example <caption>Number power.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.pow(2, 3)  // 8
 * });
 *
 * @example <caption>Number power. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 2 ^ 3  // Equivalent to pow(2, 3)
 * `);
 *
 * @memberof carto.expressions
 * @name pow
 * @function
 * @api
 */
const Pow = genBinaryOp('pow',
    NUMBERS_TO_NUMBER,
    (x, y) => Math.pow(x, y),
    (x, y) => `pow(${x}, ${y})`
);

/**
 * Compare if x is greater than y.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {Number} x - Firt value of the comparison
 * @param {Number} y - Firt value of the comparison
 * @return {Number} Result of the comparison: 0 or 1
 *
 * @example <caption>Compare two numbers to show only elements with price greater than 30.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.gt(s.prop('price'), 30)
 * });
 *
 * @example <caption>Compare two numbers to show only elements with price greater than 30. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: $price > 30  // Equivalent to gt($price, 30)
 * `);
 *
 * @memberof carto.expressions
 * @name gt
 * @function
 * @api
 */
const GreaterThan = genBinaryOp('greaterThan',
    NUMBERS_TO_NUMBER,
    (x, y) => x > y ? 1 : 0,
    (x, y) => `(${x}>${y}? 1.:0.)`
);

/**
 * Compare if x is greater than or equal to y.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {Number} x - Firt value of the comparison
 * @param {Number} y - Second value of the comparison
 * @return {Number} Result of the comparison: 0 or 1
 *
 * @example <caption>Compare two numbers to show only elements with price greater than or equal to 30.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.gte(s.prop('price'), 30)
 * });
 *
 * @example <caption>Compare two numbers to show only elements with price greater than or equal to 30. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: $price >= 30  // Equivalent to gte($price, 30)
 * `);
 *
 * @memberof carto.expressions
 * @name gte
 * @function
 * @api
 */
const GreaterThanOrEqualTo = genBinaryOp('greaterThanOrEqualTo',
    NUMBERS_TO_NUMBER,
    (x, y) => x >= y ? 1 : 0,
    (x, y) => `(${x}>=${y}? 1.:0.)`
);

/**
 * Compare if x is lower than y.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {Number} x - Firt value of the comparison
 * @param {Number} y - Second value of the comparison
 * @return {Number} Result of the comparison: 0 or 1
 *
 * @example <caption>Compare two numbers to show only elements with price less than 30.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.lt(s.prop('price'), 30)
 * });
 *
 * @example <caption>Compare two numbers to show only elements with price less than 30. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: $price < 30  // Equivalent to lt($price, 30)
 * `);
 *
 * @memberof carto.expressions
 * @name lt
 * @function
 * @api
 */
const LessThan = genBinaryOp('lessThan',
    NUMBERS_TO_NUMBER,
    (x, y) => x < y ? 1 : 0,
    (x, y) => `(${x}<${y}? 1.:0.)`
);

/**
 * Compare if x is lower than or equal to y.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {Number} x - Firt value of the comparison
 * @param {Number} y - Second value of the comparison
 * @return {Number} Result of the comparison: 0 or 1
 *
 * @example <caption>Compare two numbers to show only elements with price less than or equal to 30.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.lte(s.prop('price'), 30)
 * });
 *
 * @example <caption>Compare two numbers to show only elements with price less than or equal to 30. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: $price <= 30  // Equivalent to lte($price, 30)
 * `);
 *
 * @memberof carto.expressions
 * @name lte
 * @function
 * @api
 */
const LessThanOrEqualTo = genBinaryOp('lessThanOrEqualTo',
    NUMBERS_TO_NUMBER,
    (x, y) => x <= y ? 1 : 0,
    (x, y) => `(${x}<=${y}? 1.:0.)`
);

/**
 * Compare if x is equal to a y.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {Number|Category} x - Firt value of the comparison
 * @param {Number|Category} y - Second value of the comparison
 * @return {Number} Result of the comparison: 0 or 1
 *
 * @example <caption>Compare two numbers to show only elements with price equal to 30.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.eq(s.prop('price'), 30)
 * });
 *
 * @example <caption>Compare two numbers to show only elements with price equal to 30. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: $price == 30  // Equivalent to eq($price, 30)
 * `);
 *
 * @memberof carto.expressions
 * @name eq
 * @function
 * @api
 */
const Equals = genBinaryOp('equals',
    NUMBERS_TO_NUMBER | CATEGORIES_TO_NUMBER,
    (x, y) => x == y ? 1 : 0,
    (x, y) => `(${x}==${y}? 1.:0.)`
);

/**
 * Compare if x is different than y.
 *
 * This returns a number expression where 0 means `false` and 1 means `true`.
 *
 * @param {Number|Category} x - Firt value of the comparison
 * @param {Number|Category} y - Second value of the comparison
 * @return {Number} Result of the comparison: 0 or 1
 *
 * @example <caption>Compare two numbers to show only elements with price not equal to 30.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.neq(s.prop('price'), 30);
 * });
 *
 * @example <caption>Compare two numbers to show only elements with price not equal to 30. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: $price != 30  // Equivalent to neq($price, 30)
 * `);
 *
 * @memberof carto.expressions
 * @name neq
 * @function
 * @api
 */
const NotEquals = genBinaryOp('notEquals',
    NUMBERS_TO_NUMBER | CATEGORIES_TO_NUMBER,
    (x, y) => x != y ? 1 : 0,
    (x, y) => `(${x}!=${y}? 1.:0.)`
);

/**
 * Perform a binary OR between two numeric expressions.
 * If the numbers are different from 0 or 1 this performs a [fuzzy or operation](https://en.wikipedia.org/wiki/Fuzzy_logic#Fuzzification).
 * This fuzzy behavior will allow transitions to work in a continuos, non-discrete, fashion.
 *
 * This returns a number expression where 0 means `false` and 1 means `true`.
 *
 * @param {Number} x - First value of the expression
 * @param {Number} y - Second value of the expression
 * @return {Number} Result of the expression
 *
 * @example <caption>Show only elements with price < 30 OR price > 1000.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.or(
 *     s.lt(s.prop('price'), 30),
 *     s.gt(s.prop('price'), 1000)
 *   )
 * });
 *
 * @example <caption>Show only elements with price < 30 OR price > 1000. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: $price < 30 or $price > 1000  // Equivalent to or(lt($price, 30), gt($price, 1000))
 * `);
 *
 * @memberof carto.expressions
 * @name or
 * @function
 * @api
 */
const Or = genBinaryOp('or',
    NUMBERS_TO_NUMBER,
    (x, y) => Math.min(x + y, 1),
    (x, y) => `min(${x} + ${y}, 1.)`
);

/**
 * Perform a binary AND between two numeric expressions.
 * If the numbers are different from 0 or 1 this performs a [fuzzy and operation](https://en.wikipedia.org/wiki/Fuzzy_logic#Fuzzification).
 * This fuzzy behavior will allow transitions to work in a continuos, non-discrete, fashion.
 *
 * This returns a number expression where 0 means `false` and 1 means `true`.
 *
 * @param {Number} x - First value of the expression
 * @param {Number} y - Second value of the expression
 * @return {Number} Result of the expression
 *
 * @example <caption>Show only elements with price < 30 AND category == 'fruit'.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.and(
 *     s.lt(s.prop('price'), 30),
 *     s.eq(s.prop('category'), 'fruit')
 *   )
 * });
 *
 * @example <caption>Show only elements with price < 30 AND category == 'fruit'. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: $price < 30 and $category == 'fruit'  // Equivalent to and(lt($price, 30), eq($category, 'fruit'))
 * `);
 *
 * @memberof carto.expressions
 * @name and
 * @function
 * @api
 */
const And = genBinaryOp('and',
    NUMBERS_TO_NUMBER,
    (x, y) => Math.min(x * y, 1),
    (x, y) => `min(${x} * ${y}, 1.)`
);

function genBinaryOp(name, allowedSignature, jsFn, glsl) {
    return class BinaryOperation extends _base__WEBPACK_IMPORTED_MODULE_2__["default"] {
        constructor(a, b) {
            if (Number.isFinite(a) && Number.isFinite(b)) {
                return Object(_functions__WEBPACK_IMPORTED_MODULE_0__["number"])(jsFn(a, b));
            }
            a = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(a);
            b = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(b);

            const signature = getSignatureLoose(a, b);
            if (signature !== undefined) {
                if (signature == UNSUPPORTED_SIGNATURE || !(signature & allowedSignature)) {
                    throw new Error(`${name}(): invalid parameter types\n'x' type was ${a.type}, 'y' type was ${b.type}`);
                }
            }

            super({ a, b });
            this.type = getReturnTypeFromSignature(signature);
        }
        get value() {
            return this.eval();
        }
        eval(feature) {
            return jsFn(this.a.eval(feature), this.b.eval(feature));
        }
        _compile(meta) {
            super._compile(meta);
            const [a, b] = [this.a, this.b];

            const signature = getSignature(a, b);
            if (signature == UNSUPPORTED_SIGNATURE || !(signature & allowedSignature)) {
                throw new Error(`${name}(): invalid parameter types\n'x' type was ${a.type}, 'y' type was ${b.type}`);
            }
            this.type = getReturnTypeFromSignature(signature);

            this.inlineMaker = inline => glsl(inline.a, inline.b);
        }
    };
}

function getSignatureLoose(a, b) {
    if (!a.type || !b.type) {
        if (!a.type && !b.type) {
            return undefined;
        }
        const knownType = a.type || b.type;
        if (knownType == 'color') {
            return NUMBER_AND_COLOR_TO_COLOR;
        }
    } else if (a.type == 'number' && b.type == 'number') {
        return NUMBERS_TO_NUMBER;
    } else if (a.type == 'number' && b.type == 'color') {
        return NUMBER_AND_COLOR_TO_COLOR;
    } else if (a.type == 'color' && b.type == 'number') {
        return NUMBER_AND_COLOR_TO_COLOR;
    } else if (a.type == 'color' && b.type == 'color') {
        return COLORS_TO_COLOR;
    } else if (a.type == 'category' && b.type == 'category') {
        return CATEGORIES_TO_NUMBER;
    } else if ((a.type == 'sprite' && b.type == 'color') ||
        (a.type == 'sprite' && b.type == 'color') ||
        (a.type == 'sprite' && b.type == 'sprite') ||
        (a.type == 'color' && b.type == 'sprite')) {
        return SPRITES_TO_SPRITE;
    } else {
        return UNSUPPORTED_SIGNATURE;
    }
}

function getSignature(a, b) {
    if (!a.type || !b.type) {
        return undefined;
    } else if (a.type == 'number' && b.type == 'number') {
        return NUMBERS_TO_NUMBER;
    } else if (a.type == 'number' && b.type == 'color') {
        return NUMBER_AND_COLOR_TO_COLOR;
    } else if (a.type == 'color' && b.type == 'number') {
        return NUMBER_AND_COLOR_TO_COLOR;
    } else if (a.type == 'color' && b.type == 'color') {
        return COLORS_TO_COLOR;
    } else if (a.type == 'category' && b.type == 'category') {
        return CATEGORIES_TO_NUMBER;
    } else if ((a.type == 'sprite' && b.type == 'color') ||
        (a.type == 'sprite' && b.type == 'color') ||
        (a.type == 'sprite' && b.type == 'sprite') ||
        (a.type == 'color' && b.type == 'sprite')) {
        return SPRITES_TO_SPRITE;
    } else {
        return UNSUPPORTED_SIGNATURE;
    }
}

function getReturnTypeFromSignature(signature) {
    switch (signature) {
        case NUMBERS_TO_NUMBER:
            return 'number';
        case NUMBER_AND_COLOR_TO_COLOR:
            return 'color';
        case COLORS_TO_COLOR:
            return 'color';
        case CATEGORIES_TO_NUMBER:
            return 'number';
        case SPRITES_TO_SPRITE:
            return 'sprite';
        default:
            return undefined;
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/blend.js":
/*!*******************************************!*\
  !*** ./src/core/viz/expressions/blend.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Blend; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");
/* harmony import */ var _animate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./animate */ "./src/core/viz/expressions/animate.js");
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");




/**
 * Linearly interpolate from `a` to `b` based on `mix`.
 *
 * @param {Number|Color} a - Numeric or color expression, `a` type must match `b` type
 * @param {Number|Color} b - Numeric or color expression, `b` type must match `a` type
 * @param {Number} mix - Numeric expression with the interpolation parameter in the [0,1] range
 * @returns {Number|Color} Numeric or color expression with the same type as `a` and `b`
 *
 * @example <caption>Blend based on the zoom level to display a bubble map at high zoom levels and display fixed-sized points at low zoom levels.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.blend(3,
 *                  s.prop('dn'),
 *                  s.linear(s.zoom(), s.pow(2, 10), s.pow(2, 14))
 *           );
 * });
 *
 * @example <caption>Blend based on the zoom level to display a bubble map at high zoom levels and display fixed-sized points at low zoom levels. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: blend(3,
 *                $dn,
 *                linear(zoom(), 2^10, 2^14)
 *          )
 * `);
 * 
 * @memberof carto.expressions
 * @name blend
 * @function
 * @api
 */
class Blend extends _base__WEBPACK_IMPORTED_MODULE_2__["default"] {
    constructor(a, b, mix, interpolator) {
        a = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["implicitCast"])(a);
        b = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["implicitCast"])(b);
        mix = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["implicitCast"])(mix);

        Object(_utils__WEBPACK_IMPORTED_MODULE_0__["checkExpression"])('blend', 'a', 0, a);
        Object(_utils__WEBPACK_IMPORTED_MODULE_0__["checkExpression"])('blend', 'b', 1, b);
        Object(_utils__WEBPACK_IMPORTED_MODULE_0__["checkExpression"])('blend', 'mix', 2, mix);
        if (a.type && b.type) {
            abTypeCheck(a, b);
        }
        Object(_utils__WEBPACK_IMPORTED_MODULE_0__["checkLooseType"])('blend', 'mix', 2, 'number', mix);

        // TODO check interpolator type
        const originalMix = mix;
        if (interpolator) {
            mix = interpolator(mix);
        }
        super({ a, b, mix });
        this.originalMix = originalMix;

        if (a.type && b.type) {
            this.type = a.type;
        }
    }
    eval(feature) {
        const a = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["clamp"])(this.mix.eval(feature), 0, 1);
        const x = this.a.eval(feature);
        const y = this.b.eval(feature);
        return Object(_utils__WEBPACK_IMPORTED_MODULE_0__["mix"])(x, y, a);
    }
    replaceChild(toReplace, replacer) {
        if (toReplace == this.mix) {
            this.originalMix = replacer;
        }
        super.replaceChild(toReplace, replacer);
    }
    _compile(meta) {
        super._compile(meta);

        abTypeCheck(this.a, this.b);
        Object(_utils__WEBPACK_IMPORTED_MODULE_0__["checkType"])('blend', 'mix', 1, 'number', this.mix);

        this.type = this.a.type;

        this.inlineMaker = inline => `mix(${inline.a}, ${inline.b}, clamp(${inline.mix}, 0., 1.))`;
    }
    _preDraw(...args) {
        super._preDraw(...args);
        if (this.originalMix instanceof _animate__WEBPACK_IMPORTED_MODULE_1__["default"] && !this.originalMix.isAnimated()) {
            this.parent.replaceChild(this, this.b);
            this.notify();
        }
    }
}

function abTypeCheck(a, b) {
    if (!((a.type == 'number' && b.type == 'number') || (a.type == 'color' && b.type == 'color'))) {
        throw new Error(`blend(): invalid parameter types\n\t'a' type was '${a.type}'\n\t'b' type was ${b.type}'`);
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/buckets.js":
/*!*********************************************!*\
  !*** ./src/core/viz/expressions/buckets.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Buckets; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");



/**
 * Given a property create "sub-groups" based on the given breakpoints.
 *
 * Imagine a traffic dataset with a speed property. We want to divide the roads in
 * 3 buckets (slow, medium, fast) based on the speed using a different color each bucket.
 *
 * We´ll need:
 *  - A {@link carto.expressions.ramp|ramp} to add a color for every bucket.
 *  - A {@link carto.expressions.palettes|colorPalette} to define de color scheme.
 *
 * ```javascript
 *  const s = carto.expressions;
 *  const $speed = s.prop('speed');
 *  const viz = new carto.Viz({
 *    color: s.ramp(
 *      s.buckets($speed, [30, 80, 120]),
 *      s.palettes.PRISM
 *    )
 * });
 * ```
 *
 * ```javascript
 *  const viz = new carto.Viz(`
 *    color: ramp(buckets($speed, [30, 80, 120]), PRISM)
 * `);
 * ```
 *
 * Using the buckets `expression` we divide the dataset in 3 buckets according to the speed:
 *  - From 0 to 29
 *  - From 30 to 79
 *  - From 80 to 120
 *
 * Values lower than 0 will be in the first bucket and values higher than 120 will be in the third one.
 *
 * This expression can be used for categorical properties, imagine the previous example with the data already
 * procesed in a new categorical `procesedSpeed` column:
 *
 * ```javascript
 *  const s = carto.expressions;
 *  const $procesedSpeed = s.prop('procesedSpeed');
 *  const viz = new carto.Viz({
 *    color: s.ramp(
 *      s.buckets($procesedSpeed, ['slow', 'medium', 'high']),
 *      s.palettes.PRISM)
 *    )
 * });
 * ```
 *
 * ```javascript
 *  const viz = new carto.Viz(`
 *    color: ramp(buckets($procesedSpeed, ['slow', 'medium', 'high']), PRISM)
 * `);
 * ```
 *
 * @param {Number|Category} property - The property to be evaluated and interpolated
 * @param {Number[]|Category[]} breakpoints - Numeric expression containing the different breakpoints.
 * @return {Number|Category}
 *
 * @memberof carto.expressions
 * @name buckets
 * @function
 * @api
 */
class Buckets extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(input, list) {
        input = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(input);
        list = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(list);

        let looseType = undefined;
        if (input.type) {
            if (input.type != 'number' && input.type != 'category') {
                throw new Error(`buckets(): invalid first parameter type\n\t'input' type was ${input.type}`);
            }
            looseType = input.type;
        }
        list.elems.map((item, index) => {
            if (item.type) {
                if (looseType && looseType != item.type) {
                    throw new Error(`buckets(): invalid ${Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getOrdinalFromIndex"])(index+1)} parameter type` +
                        `\n\texpected type was ${looseType}\n\tactual type was ${item.type}`);
                } else if (item.type != 'number' && item.type != 'category') {
                    throw new Error(`buckets(): invalid ${Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getOrdinalFromIndex"])(index+1)} parameter type\n\ttype was ${item.type}`);
                }
            }
        });

        let children = {
            input
        };
        list.elems.map((item, index) => children[`arg${index}`] = item);
        super(children);
        this.numCategories = list.elems.length + 1;
        this.list = list;
        this.type = 'category';
    }
    eval(feature) {
        const v = this.input.eval(feature);
        let i;
        for (i = 0; i < this.list.elems.length; i++) {
            if (this.input.type == 'category' && v == this.list.elems[i].eval(feature)) {
                return i;
            } else if (this.input.type == 'number' && v < this.list.elems[i].eval(feature)) {
                return i;
            }
        }
        return i;
    }
    _compile(metadata) {
        super._compile(metadata);
        this.othersBucket = this.input.type == 'category';

        const input = this.input;
        if (input.type != 'number' && input.type != 'category') {
            throw new Error(`buckets(): invalid first parameter type\n\t'input' type was ${input.type}`);
        }
        this.list.elems.map((item, index) => {
            if (input.type != item.type) {
                throw new Error(`buckets(): invalid ${Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getOrdinalFromIndex"])(index+1)} parameter type` +
                    `\n\texpected type was ${input.type}\n\tactual type was ${item.type}`);
            } else if (item.type != 'number' && item.type != 'category') {
                throw new Error(`buckets(): invalid ${Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getOrdinalFromIndex"])(index+1)} parameter type\n\ttype was ${item.type}`);
            }
        });
    }
    _applyToShaderSource(getGLSLforProperty) {
        const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(getGLSLforProperty));
        let childInlines = {};
        childSources.map((source, index) => childInlines[this.childrenNames[index]] = source.inline);
        const funcName = `buckets${this._uid}`;
        const cmp = this.input.type == 'category' ? '==' : '<';
        const elif = (_, index) =>
            `${index > 0 ? 'else' : ''} if (x${cmp}(${childInlines[`arg${index}`]})){
                return ${index}.;
            }`;
        const funcBody = this.list.elems.map(elif).join('');
        const preface = `float ${funcName}(float x){
            ${funcBody}
            return ${this.numCategories - 1}.;
        }`;

        return {
            preface: this._prefaceCode(childSources.map(s => s.preface).reduce((a, b) => a + b, '') + preface),
            inline: `${funcName}(${childInlines.input})`
        };
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/classifier.js":
/*!************************************************!*\
  !*** ./src/core/viz/expressions/classifier.js ***!
  \************************************************/
/*! exports provided: ViewportQuantiles, GlobalQuantiles, GlobalEqIntervals, ViewportEqIntervals */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ViewportQuantiles", function() { return ViewportQuantiles; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GlobalQuantiles", function() { return GlobalQuantiles; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GlobalEqIntervals", function() { return GlobalEqIntervals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ViewportEqIntervals", function() { return ViewportEqIntervals; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../functions */ "./src/core/viz/functions.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");
/* harmony import */ var _basic_property__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./basic/property */ "./src/core/viz/expressions/basic/property.js");
/* harmony import */ var _schema__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../schema */ "./src/core/schema.js");






let classifierUID = 0;


class Classifier extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(children, buckets) {
        let breakpoints = [];
        for (let i = 0; i < buckets - 1; i++) {
            children[`arg${i}`] = Object(_functions__WEBPACK_IMPORTED_MODULE_1__["number"])(0);
            breakpoints.push(children[`arg${i}`]);
        }
        super(children);
        this.classifierUID = classifierUID++;
        this.numCategories = buckets;
        this.buckets = buckets;
        this.breakpoints = breakpoints;
        this.type = 'category';
    }
    eval(feature) {
        const input = this.input.eval(feature);
        const q = this.breakpoints.findIndex(br => input <= br);
        return q;
    }
    _genBreakpoints() {
    }
    getBreakpointList() {
        this._genBreakpoints();
        return this.breakpoints.map(br => br.expr);
    }
    _applyToShaderSource(getGLSLforProperty) {
        const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(getGLSLforProperty));
        let childInlines = {};
        childSources.map((source, index) => childInlines[this.childrenNames[index]] = source.inline);
        const funcName = `classifier${this.classifierUID}`;
        const elif = (_, index) =>
            `${index > 0 ? 'else' : ''} if (x<(${childInlines[`arg${index}`]})){
        return ${index.toFixed(2)};
    }`;
        const funcBody = this.breakpoints.map(elif).join('');
        const preface = `float ${funcName}(float x){
    ${funcBody}
    return ${this.breakpoints.length.toFixed(1)};
}`;
        return {
            preface: this._prefaceCode(childSources.map(s => s.preface).reduce((a, b) => a + b, '') + preface),
            inline: `${funcName}(${childInlines.input})`
        };
    }
    _preDraw(program, drawMetadata, gl) {
        this._genBreakpoints();
        // TODO
        super._preDraw(program, drawMetadata, gl);
    }
    _getColumnName() {
        if (this.input.aggName) {
            // Property has aggregation
            return _schema__WEBPACK_IMPORTED_MODULE_4__["column"].aggColumn(this.input.name, this.input.aggName);
        }
        return this.input.name;
    }
}


/**
 * Classify `input` by using the quantiles method with `n` buckets.
 *
 * It will classify the input based on the filtered dataset, filtering by viewport and by `filter`.
 *
 * @param {Number} input - The input expression used in the quantiles
 * @param {number} n - Number of buckets to be returned
 * @return {Category}
 *
 * @example <caption>Use viewportQuantiles to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.viewportQuantiles(s.prop('density'), 5), s.palettes.PRISM)
 * });
 *
 * @example <caption>Use viewportQuantiles to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(viewportQuantiles($density, 5), PRISM)
 * `);
 *
 * @memberof carto.expressions
 * @name quantiles
 * @function
 * @api
 */
class ViewportQuantiles extends Classifier {
    constructor(input, buckets) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkInstance"])('viewportQuantiles', 'input', 0, _basic_property__WEBPACK_IMPORTED_MODULE_3__["default"], input && (input.property || input));
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkNumber"])('viewportQuantiles', 'buckets', 1, buckets);

        let children = {
            input
        };
        children._histogram = Object(_functions__WEBPACK_IMPORTED_MODULE_1__["viewportHistogram"])(input);
        super(children, buckets);
    }
    _compile(metadata) {
        super._compile(metadata);
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkType"])('viewportQuantiles', 'input', 0, 'number', this.input);
    }
    _genBreakpoints() {
        const hist = this._histogram.value;

        const histogramBuckets = hist.length;
        const min = hist[0].x[0];
        const max = hist[histogramBuckets - 1].x[1];

        let prev = 0;
        const accumHistogram = hist.map(({ y }) => {
            prev += y;
            return prev;
        });

        let i = 0;
        const total = accumHistogram[histogramBuckets - 1];
        let brs = [];
        // TODO OPT: this could be faster with binary search
        this.breakpoints.map((breakpoint, index) => {
            for (i; i < histogramBuckets; i++) {
                if (accumHistogram[i] > (index + 1) / this.buckets * total) {
                    break;
                }
            }
            const percentileValue = i / histogramBuckets * (max - min) + min;
            brs.push(percentileValue);
            breakpoint.expr = percentileValue;
        });
    }
}

/**
 * Classify `input` by using the quantiles method with `n` buckets.
 *
 * It will classify the input based on the entire dataset without filtering by viewport or by `filter`.
 *
 * @param {Number} input - The input expression used in the quantiles
 * @param {number} n - Number of buckets to be returned
 * @return {Category}
 *
 * @example <caption>Use global quantiles to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.globalQuantiles(s.prop('density'), 5), s.palettes.PRISM)
 * });
 *
 * @example <caption>Use global quantiles to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(globalQuantiles($density, 5), PRISM)
 * `);
 *
 * @memberof carto.expressions
 * @name globalQuantiles
 * @function
 * @api
 */
class GlobalQuantiles extends Classifier {
    constructor(input, buckets) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkInstance"])('globalQuantiles', 'input', 0, _basic_property__WEBPACK_IMPORTED_MODULE_3__["default"], input && (input.property || input));
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkNumber"])('globalQuantiles', 'buckets', 1, buckets);
        super({ input }, buckets);
    }
    _compile(metadata) {
        super._compile(metadata);
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkType"])('globalQuantiles', 'input', 0, 'number', this.input);
        const copy = metadata.sample.map(s => s[this.input.name]);
        copy.sort((x, y) => x - y);
        this.breakpoints.map((breakpoint, index) => {
            const p = (index + 1) / this.buckets;
            breakpoint.expr = copy[Math.floor(p * copy.length)];
        });
    }
}

/**
 * Classify `input` by using the equal intervals method with `n` buckets.
 *
 * It will classify the input based on the entire dataset without filtering by viewport or by `filter`.
 *
 * @param {Number} input - The input expression to classify
 * @param {number} n - Number of buckets
 * @return {Category}
 *
 * @example <caption>Use global equal intervals to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.globalEqIntervals(s.prop('density'), 5), s.palettes.PRISM)
 * });
 *
 * @example <caption>Use global equal intervals to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(globalEqIntervals($density, 5), PRISM)
 * `);
 *
 * @memberof carto.expressions
 * @name globalEqIntervals
 * @function
 * @api
 */
class GlobalEqIntervals extends Classifier {
    constructor(input, buckets) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkInstance"])('globalEqIntervals', 'input', 0, _basic_property__WEBPACK_IMPORTED_MODULE_3__["default"], input && (input.property || input));
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkNumber"])('globalEqIntervals', 'buckets', 1, buckets);
        super({ input }, buckets);
    }
    _compile(metadata) {
        super._compile(metadata);
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkType"])('globalEqIntervals', 'input', 0, 'number', this.input);
        const { min, max } = metadata.columns.find(c => c.name == this.input.name);

        this.breakpoints.map((breakpoint, index) => {
            const p = (index + 1) / this.buckets;
            breakpoint.expr = min + (max - min) * p;
        });
    }
}

/**
 * Classify `input` by using the equal intervals method with `n` buckets.
 *
 * It will classify the input based on the filtered dataset, filtering by viewport and by `filter`.
 *
 * @param {Number} input - The input expression to classify
 * @param {number} n - Number of buckets
 * @return {Category}
 *
 * @example <caption>Use viewport equal intervals to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.viewportEqIntervals(s.prop('density'), 5), s.palettes.PRISM)
 * });
 *
 * @example <caption>Use viewport equal intervals to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(viewportEqIntervals($density, 5), PRISM)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportEqIntervals
 * @function
 * @api
 */
class ViewportEqIntervals extends Classifier {
    constructor(input, buckets) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkInstance"])('viewportEqIntervals', 'input', 0, _basic_property__WEBPACK_IMPORTED_MODULE_3__["default"], input && (input.property || input));
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkNumber"])('viewportEqIntervals', 'buckets', 1, buckets);
        let children = {
            input
        };
        children._min = Object(_functions__WEBPACK_IMPORTED_MODULE_1__["viewportMin"])(input);
        children._max = Object(_functions__WEBPACK_IMPORTED_MODULE_1__["viewportMax"])(input);
        super(children, buckets);
    }
    _compile(metadata) {
        super._compile(metadata);
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkType"])('viewportEqIntervals', 'input', 0, 'number', this.input);
    }
    _genBreakpoints() {
        const min = this._min.eval();
        const max = this._max.eval();

        this.breakpoints.map((breakpoint, index) => {
            const p = (index + 1) / this.buckets;
            breakpoint.expr = min + (max - min) * p;
        });
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/color/CIELab.js":
/*!**************************************************!*\
  !*** ./src/core/viz/expressions/color/CIELab.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return CIELab; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");



/**
 * Evaluates to a CIELab color.
 *
 * @param {Number} l - The lightness of the color
 * @param {Number} a - The green–red color component
 * @param {Number} b - The blue–yellow color component
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.cielab(32.3, 79.2, -107.86)
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: cielab(32.3, 79.2, -107.86)
 * `);
 *
 * @memberof carto.expressions
 * @name cielab
 * @function
 * @api
 */
class CIELab extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(l, a, b) {
        l = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(l);
        a = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(a);
        b = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(b);

        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkExpression"])('cielab', 'l', 0, l);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkExpression"])('cielab', 'a', 1, a);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkExpression"])('cielab', 'b', 2, b);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('cielab', 'l', 0, 'number', l);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('cielab', 'a', 1, 'number', a);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('cielab', 'b', 2, 'number', b);

        super({ l, a, b });
        this.type = 'color';
    }
    // TODO EVAL
    _compile(meta) {
        super._compile(meta);

        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('cielab', 'l', 0, 'number', this.l);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('cielab', 'a', 1, 'number', this.a);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('cielab', 'b', 2, 'number', this.b);

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


/***/ }),

/***/ "./src/core/viz/expressions/color/hex.js":
/*!***********************************************!*\
  !*** ./src/core/viz/expressions/color/hex.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Hex; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");



/**
 * Create a color from its hexadecimal description.
 *
 * @param {string} hexadecimalColor - Color in the #RGB, #RGBA, #RRGGBB or #RRGGBBAA format
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.hex('#00F');  // Equivalent to `color: '#00F'`
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: #00F  // Equivalent to hex('#00F')
 * `);
 *
 * @memberof carto.expressions
 * @name hex
 * @function
 * @api
 */
class Hex extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(hexadecimalColor) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkString"])('hex', 'hexadecimalColor', 0, hexadecimalColor);
        super({});
        this.type = 'color';
        try {
            this.color = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["hexToRgb"])(hexadecimalColor);
        } catch (error) {
            throw new Error(Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStringErrorPreface"])('hex', 'hexadecimalColor', 0) + '\nInvalid hexadecimal color string');
        }
    }
    get value() {
        return this.eval();
    }
    eval() {
        return this.color;
    }
    _compile(meta) {
        super._compile(meta);
        this.inlineMaker = () => `vec4(${(this.color.r / 255).toFixed(4)}, ${(this.color.g / 255).toFixed(4)}, ${(this.color.b / 255).toFixed(4)}, ${(this.color.a).toFixed(4)})`;
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/color/hsl.js":
/*!***********************************************!*\
  !*** ./src/core/viz/expressions/color/hsl.js ***!
  \***********************************************/
/*! exports provided: HSL, HSLA */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HSL", function() { return HSL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HSLA", function() { return HSLA; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");



/**
 * Evaluates to a hsl color.
 *
 * @param {Number} h - hue of the color in the [0, 1] range
 * @param {Number} s - saturation of the color in the [0, 1] range
 * @param {Number} l - lightness of the color in the [0, 1] range
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.hsl(0.67, 1.0, 0.5)
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: hsl(0.67, 1.0, 0.5)
 * `);
 *
 * @memberof carto.expressions
 * @name hsl
 * @function
 * @api
 */
const HSL = genHSL('hsl', false);

/**
 * Evaluates to a hsla color.
 *
 * @param {Number} h - hue of the color in the [0, 1] range
 * @param {Number} s - saturation of the color in the [0, 1] range
 * @param {Number} l - lightness of the color in the [0, 1] range
 * @param {Number} a - alpha value of the color in the [0, 1] range
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.hsla(0.67, 1.0, 0.5, 1.0)
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: hsla(0.67, 1.0, 0.5, 1.0)
 * `);
 *
 * @memberof carto.expressions
 * @function
 * @name hsla
 * @api
 */
const HSLA = genHSL('hsla', true);

function genHSL(name, alpha) {
    return class HSLA extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
        constructor(h, s, l, a) {
            [h, s, l, a] = [h, s, l, a].map(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"]);

            const children = { h, s, l };
            if (alpha) {
                Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])(name, 'a', 3, 'number', a);
                children.a = a;
            }

            hslCheckType('h', 0, h);
            hslCheckType('s', 1, s);
            hslCheckType('l', 2, l);

            super(children);
            this.type = 'color';
        }
        get value() {
            return this.eval();
        }
        eval(f) {
            const normalize = (value, hue = false) => {
                if (value.type == 'category') {
                    return value.eval(f) / (hue ? value.numCategories + 1 : value.numCategories);
                }
                return value.eval(f);
            };
            const h = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(normalize(this.h, true), 0, 1);
            const s = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(normalize(this.s), 0, 1);
            const l = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(normalize(this.l), 0, 1);

            const hslToRgb = (h, s, l) => {
                const c = {
                    r: Math.abs(h * 6 - 3) - 1,
                    g: 2 - Math.abs(h * 6 - 2),
                    b: 2 - Math.abs(h * 6 - 4),
                    a: alpha ? this.a.eval(f) : 1,
                };

                const C = (1 - Math.abs(2 * l - 1)) * s;

                c.r = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(c.r, 0, 1);
                c.g = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(c.g, 0, 1);
                c.b = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(c.b, 0, 1);

                c.r = ((c.r - 0.5) * C + l) * 255;
                c.g = ((c.g - 0.5) * C + l) * 255;
                c.b = ((c.b - 0.5) * C + l) * 255;

                return c;
            };

            return hslToRgb(h, s, l);
        }
        _compile(meta) {
            super._compile(meta);
            hslCheckType('h', 0, this.h);
            hslCheckType('s', 1, this.s);
            hslCheckType('l', 2, this.l);
            if (alpha) {
                Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('hsla', 'a', 3, 'number', this.a);
            }
            const normalize = (value, hue = false) => {
                if (value.type == 'category') {
                    return `/${hue ? value.numCategories + 1 : value.numCategories}.`;
                }
                return '';
            };
            super._setGenericGLSL(inline =>
                `vec4(HSLtoRGB(vec3(
                    ${inline.h}${normalize(this.h, true)},
                    clamp(${inline.s}${normalize(this.s)}, 0., 1.),
                    clamp(${inline.l}${normalize(this.l)}, 0., 1.)
                )), ${alpha ? `clamp(${inline.a}, 0., 1.)` : '1.'})`
                , `
    #ifndef HSL2RGB
    #define HSL2RGB
    vec3 HSLtoRGB(vec3 HSL) {
      float R = abs(HSL.x * 6. - 3.) - 1.;
      float G = 2. - abs(HSL.x * 6. - 2.);
      float B = 2. - abs(HSL.x * 6. - 4.);
      float C = (1. - abs(2. * HSL.z - 1.)) * HSL.y;
      vec3 RGB = clamp(vec3(R,G,B), 0., 1.);
      return (RGB - 0.5) * C + HSL.z;
    }
    #endif
    `);
        }
    };

    function hslCheckType(parameterName, parameterIndex, parameter) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkExpression"])(name, parameterName, parameterIndex, parameter);
        if (parameter.type != 'number' && parameter.type != 'category' && parameter.type !== undefined) {
            throw new Error(`${name}(): invalid parameter\n\t${parameterName} type was: '${parameter.type}'`);
        }
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/color/hsv.js":
/*!***********************************************!*\
  !*** ./src/core/viz/expressions/color/hsv.js ***!
  \***********************************************/
/*! exports provided: HSV, HSVA */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HSV", function() { return HSV; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HSVA", function() { return HSVA; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");



/**
 * Evaluates to a hsv color.
 *
 * @param {Number} h - hue of the color in the [0, 1] range
 * @param {Number} s - saturation of the color in the [0, 1] range
 * @param {Number} v - value (brightness) of the color in the [0, 1] range
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.hsv(0.67, 1.0, 1.0)
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: hsv(0.67, 1.0, 1.0)
 * `);
 *
 * @memberof carto.expressions
 * @name hsv
 * @function
 * @api
 */
const HSV = genHSV('hsv', false);

/**
 * Evaluates to a hsva color.
 *
 * @param {Number} h - hue of the color in the [0, 1] range
 * @param {Number} s - saturation of the color in the [0, 1] range
 * @param {Number} v - value (brightness) of the color in the [0, 1] range
 * @param {Number} a - alpha value of the color in the [0, 1] range
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.hsva(0.67, 1.0, 1.0, 1.0)
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: hsva(0.67, 1.0, 1.0, 1.0)
 * `);
 *
 * @memberof carto.expressions
 * @function
 * @name hsva
 * @api
 */
const HSVA = genHSV('hsva', true);

function genHSV(name, alpha) {
    return class extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
        constructor(h, s, v, a) {
            h = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(h);
            s = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(s);
            v = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(v);
            const children = { h, s, v };
            if (alpha) {
                a = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(a);
                Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])(name, 'a', 3, 'number', a);
                children.a = a;
            }

            hsvCheckType('h', 0, h);
            hsvCheckType('s', 1, s);
            hsvCheckType('v', 2, v);

            super(children);
            this.type = 'color';
        }
        get value() {
            return this.eval();
        }
        eval(f) {
            const normalize = (value, hue = false) => {
                if (value.type == 'category') {
                    return value.eval(f) / (hue ? value.numCategories + 1 : value.numCategories);
                }
                return value.eval(f);
            };
            const h = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(normalize(this.h, true), 0, 1);
            const s = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(normalize(this.s), 0, 1);
            const v = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(normalize(this.v), 0, 1);

            const hsvToRgb = (h, s, v) => {
                const c = {
                    r: Math.abs(h * 6 - 3) - 1,
                    g: 2 - Math.abs(h * 6 - 2),
                    b: 2 - Math.abs(h * 6 - 4),
                    a: alpha ? Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(this.a.eval(f), 0,1) : 1,
                };

                c.r = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(c.r, 0, 1);
                c.g = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(c.g, 0, 1);
                c.b = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(c.b, 0, 1);

                c.r = ((c.r - 1) * s + 1) * v * 255;
                c.g = ((c.g - 1) * s + 1) * v * 255;
                c.b = ((c.b - 1) * s + 1) * v * 255;

                return c;
            };

            return hsvToRgb(h, s, v);
        }
        _compile(metadata) {
            super._compile(metadata);
            hsvCheckType('h', 0, this.h);
            hsvCheckType('s', 1, this.s);
            hsvCheckType('v', 2, this.v);
            if (alpha) {
                Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('hsva', 'a', 3, 'number', this.a);
            }
            const normalize = (value, hue = false) => {
                if (value.type == 'category') {
                    return `/${hue ? value.numCategories + 1 : value.numCategories}.`;
                }
                return '';
            };
            super._setGenericGLSL(inline =>
                `vec4(HSVtoRGB(vec3(
                    ${inline.h}${normalize(this.h, true)},
                    clamp(${inline.s}${normalize(this.s)}, 0.,1.),
                    clamp(${inline.v}${normalize(this.v)}, 0.,1.)
                )), ${alpha ? `clamp(${inline.a}, 0.,1.)` : '1.'})`
                , `
    #ifndef HSV2RGB
    #define HSV2RGB
    vec3 HSVtoRGB(vec3 HSV) {
      float R = abs(HSV.x * 6. - 3.) - 1.;
      float G = 2. - abs(HSV.x * 6. - 2.);
      float B = 2. - abs(HSV.x * 6. - 4.);
      vec3 RGB = clamp(vec3(R,G,B), 0., 1.);
      return ((RGB - 1.) * HSV.y + 1.) * HSV.z;
    }
    #endif
    `);
        }
    };

    function hsvCheckType(parameterName, parameterIndex, parameter) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkExpression"])(name, parameterName, parameterIndex, parameter);
        if (parameter.type != 'number' && parameter.type != 'category' && parameter.type !== undefined) {
            throw new Error(`${name}(): invalid parameter\n\t${parameterName} type was: '${parameter.type}'`);
        }
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/color/named-color.js":
/*!*******************************************************!*\
  !*** ./src/core/viz/expressions/color/named-color.js ***!
  \*******************************************************/
/*! exports provided: CSS_COLOR_NAMES, NamedColor */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CSS_COLOR_NAMES", function() { return CSS_COLOR_NAMES; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NamedColor", function() { return NamedColor; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");



const CSS_COLOR_NAMES = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgrey', 'darkgreen', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'grey', 'green', 'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgrey', 'lightgreen', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'];

/**
 * Create a color from its name.
 *
 * @param {string} name - The name of the color
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.namedColor('blue')  // Equivalent to `color: 'blue'`
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz({
 *   color: blue  // Equivalent to namedColor('blue')
 * });
 *
 * @memberof carto.expressions
 * @name namedColor
 * @function
 * @api
 */
class NamedColor extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(colorName) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkString"])('namedColor', 'colorName', 0, colorName);
        if (!CSS_COLOR_NAMES.includes(colorName.toLowerCase())) {
            throw new Error(Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStringErrorPreface"])('namedColor', 'colorName', 0) + `\nInvalid color name:  "${colorName}"`);
        }
        super({});
        this.type = 'color';
        this.name = colorName;
        this.color = this._nameToRGB(this.name);
    }
    get value() {
        return this.eval();
    }
    eval() {
        return this.color;
    }
    _compile(meta) {
        super._compile(meta);
        this.inlineMaker = () => `vec4(${(this.color.r / 255).toFixed(4)}, ${(this.color.g / 255).toFixed(4)}, ${(this.color.b / 255).toFixed(4)}, ${(1).toFixed(4)})`;
    }
    _nameToRGB(name) {
        const colorRegex = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
        const fakeDiv = document.createElement('div');
        fakeDiv.style.color = name;
        document.body.appendChild(fakeDiv);
        const rgbSring = getComputedStyle(fakeDiv).color;
        document.body.removeChild(fakeDiv);

        const match = colorRegex.exec(rgbSring);
        return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: 1 };

    }
}


/***/ }),

/***/ "./src/core/viz/expressions/color/opacity.js":
/*!***************************************************!*\
  !*** ./src/core/viz/expressions/color/opacity.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Opacity; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../functions */ "./src/core/viz/functions.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");




/**
 * Override the input color opacity.
 *
 * @param {Color} color - Color expression to apply the opacity
 * @param {Number} alpha - Number expression with the alpha (transparency) value
 * @return {Color}
 *
 * @example <caption>Display blue points with 50% opacity.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.opacity(s.rgb(0,0,255), 0.5)  // Equivalent to `s.rgba(0,0,255,0.5)`
 * });
 *
 * @example <caption>Display blue points with 50% opacity. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: opacity(rgb(0,0,255), 0.5) // Equivalent to `rgba(0,0,255,0.5)`
 * `);
 *
 * @memberof carto.expressions
 * @name opacity
 * @function
 * @api
 */
class Opacity extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    /**
     * @description Override the input color opacity
     * @param {*} color input color
     * @param {*} alpha new opacity
     */
    constructor(color, alpha) {
        if (Number.isFinite(alpha)) {
            alpha = Object(_functions__WEBPACK_IMPORTED_MODULE_1__["number"])(alpha);
        }
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkLooseType"])('opacity', 'color', 0, 'color', color);
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkLooseType"])('opacity', 'alpha', 1, 'number', alpha);
        super({ color, alpha });
        this.type = 'color';
    }
    get value() {
        return this.eval();
    }
    eval(f) {
        const color = this.color.eval(f);
        const alpha = this.alpha.eval(f);
        color.a = alpha;
        return color;
    }
    _compile(meta) {
        super._compile(meta);
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkType"])('opacity', 'color', 0, 'color', this.color);
        Object(_utils__WEBPACK_IMPORTED_MODULE_2__["checkType"])('opacity', 'alpha', 1, 'number', this.alpha);
        this.inlineMaker = inline => `vec4((${inline.color}).rgb, ${inline.alpha})`;
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/color/palettes.js":
/*!****************************************************!*\
  !*** ./src/core/viz/expressions/color/palettes.js ***!
  \****************************************************/
/*! exports provided: palettes, Reverse */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "palettes", function() { return palettes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Reverse", function() { return Reverse; });
/* harmony import */ var cartocolor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cartocolor */ "./node_modules/cartocolor/index.js");
/* harmony import */ var cartocolor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(cartocolor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");





/**
 * Color palettes.
 *
 * Palettes are constants that allow to use {@link https://carto.com/carto-colors/|CARTOColors} and {@link https://github.com/axismaps/colorbrewer/|ColorBrewer} palettes easily.
 * Use them with a {@link carto.expressions.ramp|ramp}
 *
 * The following palettes are available in the namespace {@link carto.expressions.palettes|carto.expressions.palettes}.
 *
 *  ```
 *  BURG, BURGYL, REDOR, ORYEL, PEACH, PINKYL, MINT, BLUGRN, DARKMINT, EMRLD, AG_GRNYL, BLUYL, TEAL, TEALGRN,
 *  PURP, PURPOR, SUNSET, MAGENTA, SUNSETDARK, AG_SUNSET, BRWNYL, ARMYROSE, FALL, GEYSER, TEMPS, TEALROSE, TROPIC,
 *  EARTH, ANTIQUE, BOLD, PASTEL, PRISM, SAFE, VIVID, CB_YLGN, CB_YLGNBU, CB_GNBU, CB_BUGN, CB_PUBUGN, CB_PUBU,
 *  CB_BUPU, CB_RDPU, CB_PURD, CB_ORRD, CB_YLORRD, CB_YLORBR, CB_PURPLES, CB_BLUES, CB_GREENS, CB_ORANGES, CB_REDS,
 *  CB_GREYS, CB_PUOR, CB_BRBG, CB_PRGN, CB_PIYG, CB_RDBU, CB_RDGY, CB_RDYLBU, CB_SPECTRAL, CB_RDYLGN, CB_ACCENT,
 *  CB_DARK2, CB_PAIRED, CB_PASTEL1, CB_PASTEL2, CB_SET1, CB_SET2, CB_SET3
 *  ```
 *
 * @example <caption>Using a color scheme.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.prop('type'), s.palettes.PRISM);
 * });
 *
 * @example <caption>Using a color scheme. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp($type, PRISM)
 * `);
 *
 * @name carto.expressions.palettes
 * @memberof carto.expressions
 * @api
 */
const palettes = {};

class PaletteGenerator extends _base__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(name, subPalettes) {
        super({});
        this.type = 'palette';
        this.name = name;
        this.subPalettes = new Proxy(subPalettes, {
            get: (target, name) => {
                if (Number.isFinite(Number(name)) && Array.isArray(target[name])) {
                    return target[name].map(_utils__WEBPACK_IMPORTED_MODULE_2__["hexToRgb"]);
                }
            }
        });
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

Object.keys(cartocolor__WEBPACK_IMPORTED_MODULE_0__).map(name => {
    palettes[`${name.toUpperCase()}`] = new PaletteGenerator(name, cartocolor__WEBPACK_IMPORTED_MODULE_0__[name]);
});

/**
 * Reverse the provided Palette.
 *
 * @param {Palette} palette - Numeric expression to compute the natural logarithm
 * @return {Palette}
 *
 * @example <caption>Invert a Palette.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.ramp(s.prop('type'), s.reverse(s.palettes.PRISM));
 * });
 *
 * @example <caption>Invert a Palette. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp($type, reverse(PRISM))
 * `);
 *
 * @memberof carto.expressions
 * @name reverse
 * @function
 * @api
 */
class Reverse extends _base__WEBPACK_IMPORTED_MODULE_1__["default"]{
    constructor(palette) {
        super({});
        this.type = 'palette';
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

/***/ "./src/core/viz/expressions/color/rgb.js":
/*!***********************************************!*\
  !*** ./src/core/viz/expressions/color/rgb.js ***!
  \***********************************************/
/*! exports provided: RGB, RGBA */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RGB", function() { return RGB; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RGBA", function() { return RGBA; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/core/viz/expressions/utils.js");



/**
 * Evaluates to a rgb color.
 *
 * @param {Number} r - The amount of red in the color in the [0, 255] range. Numeric expression.
 * @param {Number} g - The amount of green in the color in the [0, 255] range. Numeric expression.
 * @param {Number} b - The amount of blue in the color in the [0, 255] range. Numeric expression.
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.rgb(0, 0, 255)
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: rgb(0, 0, 255)
 * `);
 *
 * @memberof carto.expressions
 * @name rgb
 * @function
 * @api
 */
const RGB = genRGB('rgb', false);

/**
 * Evaluates to a rgba color.
 *
 * @param {Number} r - The amount of red in the color in the [0, 255] range. Numeric expression.
 * @param {Number} g - The amount of green in the color in the [0, 255] range. Numeric expression.
 * @param {Number} b - The amount of blue in the color in the [0, 255] range. Numeric expression.
 * @param {Number} a - The alpha value of the color in the [0, 1] range. Numeric expression.
 * @return {Color}
 *
 * @example <caption>Display blue points.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.rgba(0, 0, 255, 1)
 * });
 *
 * @example <caption>Display blue points. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: rgba(0, 0, 255, 1)
 * `);
 *
 * @memberof carto.expressions
 * @name rgba
 * @function
 * @api
 */
const RGBA = genRGB('rgba', true);

//TODO refactor to uniformcolor, write color (plain, literal)

function genRGB(name, alpha) {
    return class RGBA extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
        constructor(r, g, b, a) {
            [r, g, b, a] = [r, g, b, a].map(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"]);
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])(name, 'r', 0, 'number', r);
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])(name, 'g', 1, 'number', g);
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])(name, 'b', 2, 'number', b);

            const children = { r, g, b };
            if (alpha) {
                Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])(name, 'a', 3, 'number', a);
                children.a = a;
            }
            super(children);
            this.type = 'color';
        }
        get value() {
            return this.eval();
        }
        eval(f) {
            return {
                r: this.r.eval(f),
                g: this.g.eval(f),
                b: this.b.eval(f),
                a: alpha ? this.a.eval(f) : 1,
            };
        }
        _compile(meta) {
            super._compile(meta);
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])(name, 'r', 0, 'number', this.r);
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])(name, 'g', 1, 'number', this.g);
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])(name, 'b', 2, 'number', this.b);
            if (alpha) {
                Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('rgba', 'a', 3, 'number', this.a);
            }
            this.inlineMaker = inline => `vec4(${inline.r}/255., ${inline.g}/255., ${inline.b}/255., ${alpha ? inline.a : '1.'})`;
        }
    };
}


/***/ }),

/***/ "./src/core/viz/expressions/interpolators.js":
/*!***************************************************!*\
  !*** ./src/core/viz/expressions/interpolators.js ***!
  \***************************************************/
/*! exports provided: ILinear, Cubic, BounceEaseIn */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ILinear", function() { return ILinear; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Cubic", function() { return Cubic; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BounceEaseIn", function() { return BounceEaseIn; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");



// TODO type checking

class ILinear extends genInterpolator(inner => inner, undefined, inner => inner) { }

class Cubic extends genInterpolator(
    inner => `cubicEaseInOut(${inner})`,
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
`,
    inner => inner // TODO FIXME
) { }

class BounceEaseIn extends genInterpolator(
    inner => `BounceEaseIn(${inner})`,
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

`,
    inner => inner // TODO FIXME
) { }

// Interpolators
function genInterpolator(inlineMaker, preface, jsEval) {
    const fn = class Interpolator extends _base__WEBPACK_IMPORTED_MODULE_1__["default"] {
        constructor(m) {
            m = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["implicitCast"])(m);
            super({ m });
        }
        eval(feature) {
            return jsEval(this.m.eval(feature));
        }
        _compile(meta) {
            super._compile(meta);
            if (this.m.type != 'number') {
                throw new Error(`Blending cannot be performed by '${this.m.type}'`);
            }
            this.type = 'number';
            this._setGenericGLSL(inline => inlineMaker(inline.m), preface);
        }
    };
    fn.type = 'interpolator';
    return fn;
}


/***/ }),

/***/ "./src/core/viz/expressions/linear.js":
/*!********************************************!*\
  !*** ./src/core/viz/expressions/linear.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Linear; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../functions */ "./src/core/viz/functions.js");




/**
* Linearly interpolates the value of a given input between a minimum and a maximum. If `min` and `max` are not defined they will
* default to `globalMin(input)` and `globalMax(input)`.
*
* @param {Number|Date} input - The input to be evaluated and interpolated, can be a numeric property or a date property
* @param {Number|Date} [min=globalMin(input)] - Numeric or date expression pointing to the lower limit
* @param {Number|Date} [max=globalMax(input)] - Numeric or date expression pointing to the higher limit
* @return {Number|Date}
*
* @example <caption> Color by $speed using the CARTOColor Prism by assigning the first color in Prism to features with speeds of 10 or less, the last color in Prism to features with speeds of 100 or more and a interpolated value for the speeds in between.</caption>
* const s = carto.expressions;
* const viz = new carto.Viz({
*   color: s.ramp(s.linear(s.prop('speed'), 10, 100), s.palettes.PRISM)
* });
*
* @example <caption> Color by $speed using the CARTOColor Prism by assigning the first color in Prism to features with speeds of 10 or less, the last color in Prism to features with speeds of 100 or more and a interpolated value for the speeds in between. (String)</caption>
* const viz = new carto.Viz(`
*   color: ramp(linear($speed, 10, 100), PRISM)
* `);
*
* @memberof carto.expressions
* @name linear
* @function
* @api
*/
class Linear extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(input, min, max) {
        input = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(input);

        if (min == undefined && max == undefined) {
            min = Object(_functions__WEBPACK_IMPORTED_MODULE_2__["globalMin"])(input);
            max = Object(_functions__WEBPACK_IMPORTED_MODULE_2__["globalMax"])(input);
        }

        min = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(min);
        max = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(max);

        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkExpression"])('linear', 'input', 0, input);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkExpression"])('linear', 'min', 1, min);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkExpression"])('linear', 'max', 2, max);

        super({ input, min, max });

        if (this.min.type != 'time') {
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('linear', 'input', 0, 'number', this.input);
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('linear', 'min', 1, 'number', this.min);
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('linear', 'max', 2, 'number', this.max);
        }
        this.type = 'number';
    }
    eval(feature) {
        if (this.input.type == 'date') {
            const input = this.input.eval(feature);

            const min = this.min.eval().getTime();
            const max = this.max.eval().getTime();

            const metadata = this._metadata;
            const inputMin = metadata.columns.find(c => c.name == this.input.name).min.getTime();
            const inputMax = metadata.columns.find(c => c.name == this.input.name).max.getTime();
            const inputDiff = inputMax - inputMin;

            const smin = (min - inputMin) / inputDiff;
            const smax = (max - inputMin) / inputDiff;
            return (input-smin)/(smax-smin);

        }
        const v = this.input.eval(feature);
        const min = this.min.eval(feature);
        const max = this.max.eval(feature);
        return (v - min) / (max - min);
    }
    _compile(metadata) {
        super._compile(metadata);

        if (this.input.type == 'date') {
            const min = this.min.eval().getTime();
            const max = this.max.eval().getTime();

            this._metadata = metadata;
            const inputMin = metadata.columns.find(c => c.name == this.input.name).min.getTime();
            const inputMax = metadata.columns.find(c => c.name == this.input.name).max.getTime();
            const inputDiff = inputMax - inputMin;

            const smin = (min - inputMin) / inputDiff;
            const smax = (max - inputMin) / inputDiff;
            this.inlineMaker = (inline) => `((${inline.input}-(${smin.toFixed(20)}))/(${(smax - smin).toFixed(20)}))`;

        } else {
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('linear', 'input', 0, 'number', this.input);
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('linear', 'min', 1, 'number', this.min);
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('linear', 'max', 2, 'number', this.max);

            this.inlineMaker = (inline) => `((${inline.input}-${inline.min})/(${inline.max}-${inline.min}))`;
        }
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/near.js":
/*!******************************************!*\
  !*** ./src/core/viz/expressions/near.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Near; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");



/**
 * Near returns zero for inputs that are far away from center.
 * This can be useful for filtering out features by setting their size to zero.
 *       _____
 * _____/     \_____
 *
 * @param {Number} input
 * @param {Number} center
 * @param {Number} threshold - Size of the allowed distance between input and center that is filtered in (returning one)
 * @param {Number} falloff - Size of the distance to be used as a falloff to linearly interpolate between zero and one
 * @return {Number}
 *
 * @example <caption></caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.near(s.prop('day'), s.mod(s.mul(25, s.now()), 1000), 0, 10)
 * });
 *
 * @example <caption>(String)</caption>
 * const viz = new carto.Viz(`
 *   width: near($day, (25 * now()) % 10000, 0, 10)
 * `);
 *
 * @memberof carto.expressions
 * @name near
 * @function
 */
// TODO type checking
class Near extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(input, center, threshold, falloff) {
        input = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(input);
        center = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(center);
        threshold = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(threshold);
        falloff = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(falloff);

        super({ input, center, threshold, falloff });
    }
    eval(feature) {
        const input = this.input.eval(feature);
        const center = this.center.eval(feature);
        const threshold = this.threshold.eval(feature);
        const falloff = this.falloff.eval(feature);
        return 1. - Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])((Math.abs(input - center) - threshold) / falloff, 0, 1);
    }
    _compile(meta) {
        super._compile(meta);
        if (this.input.type != 'number' || this.center.type != 'number' || this.threshold.type != 'number' || this.falloff.type != 'number') {
            throw new Error('Near(): invalid parameter type');
        }
        this.type = 'number';
        this.inlineMaker = (inline) =>
            `(1.-clamp((abs(${inline.input}-${inline.center})-${inline.threshold})/${inline.falloff},0., 1.))`;
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/now.js":
/*!*****************************************!*\
  !*** ./src/core/viz/expressions/now.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Now; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../functions */ "./src/core/viz/functions.js");



/**
 * Get the current timestamp. This is an advanced form of animation, `torque` is preferred.
 *
 * @return {Number}
 *
 * @example <caption>Update width during the time.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.mod(s.now(), 10)
 * });
 *
 * @example <caption>Update width during the time. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: now() % 10
 * `);
 *
 * @memberof carto.expressions
 * @name now
 * @function
 * @api
 */
class Now extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor() {
        super({ now: Object(_functions__WEBPACK_IMPORTED_MODULE_1__["number"])(0) });
    }
    eval() {
        return this.now.expr;
    }
    isAnimated() {
        return true;
    }
    _compile(metadata) {
        super._compile(metadata);
        this.type = 'number';
        super.inlineMaker = inline => inline.now;
    }
    _preDraw(...args) {
        this.now._preDraw(...args);
    }
    _setTimestamp(timestamp){
        this.now.expr = timestamp;
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/ordering.js":
/*!**********************************************!*\
  !*** ./src/core/viz/expressions/ordering.js ***!
  \**********************************************/
/*! exports provided: Asc, Desc, NoOrder, Width */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Asc", function() { return Asc; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Desc", function() { return Desc; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NoOrder", function() { return NoOrder; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Width", function() { return Width; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");



/**
 * Order ascending by a provided expression. NOTE: only works with `width()`.
 *
 * @param {carto.expressions.Width} by - must be `width()`
 * @return {Order}
 *
 * @example <caption>Ascending order based on width.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   order: s.asc(s.width())
 * });
 *
 * @example <caption>Ascending order based on width. (String)</caption>
 * const viz = new carto.Viz(`
 *   order: asc(width())
 * `);
 *
 * @memberof carto.expressions
 * @name asc
 * @function
 * @IGNOREapi
 */
class Asc extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(by) {
        super({});
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkInstance"])('asc', 'by', 0, Width, by);
        this.type = 'orderer';
    }
}

/**
 * Order descending by a provided expression. NOTE: only works with `width()`.
 *
 * @param {carto.expressions.Width} by - must be `width()`
 * @return {Order}
 *
 * @example <caption>Descending order based on width.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   order: s.desc(s.width())
 * });
 *
 * @example <caption>Descending order based on width. (String)</caption>
 * const viz = new carto.Viz(`
 *   order: desc(width())
 * `);
 *
 * @memberof carto.expressions
 * @name desc
 * @function
 * @IGNOREapi
 */
class Desc extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(by) {
        super({});
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkInstance"])('desc', 'by', 0, Width, by);
        this.type = 'orderer';
    }
}

/**
 * No order expression.
 *
 * @return {Order}
 *
 * @example <caption>No order.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   order: s.noOrder()
 * });
 *
 * @example <caption>No order. (String)</caption>
 * const viz = new carto.Viz(`
 *   order: noOrder()
 * `);
 *
 * @memberof carto.expressions
 * @name noOrder
 * @function
 * @IGNOREapi
 */
class NoOrder extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor() {
        super({});
        this.type = 'orderer';
    }
}

/**
 * Return the expression assigned in the `width` property. ONLY usable in an `order:` property.
 *
 * @return {carto.expressions.Width}
 *
 * @example <caption>Ascending order based on width.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   order: s.asc(s.width())
 * });
 *
 * @example <caption>Ascending order based on width. (String)</caption>
 * const viz = new carto.Viz(`
 *   order: asc(width())
 * `);
 *
 * @memberof carto.expressions
 * @name width
 * @function
 * @IGNOREapi
 */
class Width extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor() {
        super({});
        this.type = 'propertyReference';
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/placement.js":
/*!***********************************************!*\
  !*** ./src/core/viz/expressions/placement.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Placement; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");



/**
 * Placement. Define a sprite offset relative to its size. Where:
 * - `symbolPlacement: placement(1,1)` means to align the bottom left corner of the sprite with the point center.
 * - `symbolPlacement: placement(0,0)` means to align the center of the sprite with the point center.
 * - `symbolPlacement: placement(-1,-1)` means to align the top right corner of the sprite with the point center.
 *
 *           |1
 *           |
 *           |
 * -1 -------+------- 1
 *           |
 *           |
 *         -1|
 *
 * You can also use `align_center` and `align_bottom` to set the simbol placement as follows:
 * - `symbolPlacement: align_bottom` is equivalent to `symbolPlacement: placement(0, 1)`
 * - `symbolPlacement: align_center` is equivalent to `symbolPlacement: placement(0, 0)`
 *
 * @param {number} x - first numeric expression that indicates the sprite offset in the X direction.
 * @param {number} y - second numeric expression that indicates the sprite offset in the Y direction.
 * @return {Placement} Numeric expression
 *
 * @example <caption>Setting the aligment to the top corner of the sprite.</caption>
 *   symbol: sprite('./marker.svg')
 *   symbolPlacement: placement(1, 0)
 *
 * @memberof carto.expressions
 * @name placement
 * @function
 * @api
 */


class Placement extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(x, y) {
        x = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(x);
        y = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(y);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('placement', 'x', 0, 'number', x);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('placement', 'y', 1, 'number', y);
        super({ x, y });
        this.inlineMaker = inline => `vec2(${inline.x}, ${inline.y})`;
        this.type = 'placement';
    }
    eval(v) {
        return [this.x.eval(v), this.y.eval(v)];
    }
    _compile(meta) {
        super._compile(meta);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('placement', 'x', 0, 'number', this.x);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('placement', 'y', 1, 'number', this.y);
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/ramp.js":
/*!******************************************!*\
  !*** ./src/core/viz/expressions/ramp.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Ramp; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");
/* harmony import */ var _colorspaces__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../colorspaces */ "./src/core/viz/colorspaces.js");
/* harmony import */ var _sprites__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./sprites */ "./src/core/viz/expressions/sprites.js");





/**
* Create a ramp: a mapping between an input (a numeric or categorical expression) and an output (a color palette or a numeric palette, to create bubble maps)
*
* Categories to colors
* Categorical expressions can be used as the input for `ramp` in combination with color palettes. If the number of categories exceeds the number of available colors in the palette new colors will be generated by
* using CieLAB interpolation.
*
* Categories to numeric
* Categorical expression can be used as the input for `ramp` in combination with numeric palettes. If the number of input categories doesn't match the number of numbers in the numeric palette, linear interpolation will be used.
*
* Numeric expressions to colors
* Numeric expressions can be used as the input for `ramp` in combination with color palettes. Colors will be generated by using CieLAB interpolation.
*
* Numeric expressions to numeric
* Numeric expressions can be used as the input for `ramp` in combination with numeric palettes. Linear interpolation will be used to generate intermediate output values.
*
* @param {Number|Category} input - The input expression to give a color
* @param {Palette|Color[]|Number[]} palette - The color palette that is going to be used
* @return {Number|Color}
*
* @example <caption>Mapping categories to colors and numbers</caption>
* const s = carto.expressions;
* const viz = new carto.Viz({
*   width: s.ramp(s.buckets(s.prop('dn'), [20, 50, 120]), [1, 4, 8])
*   color: s.ramp(s.buckets(s.prop('dn'), [20, 50, 120]), s.palettes.PRISM)
* });
*
* @example <caption>Mapping categories to colors and numbers (String)</caption>
* const viz = new carto.Viz(`
*   width: ramp(buckets($dn, [20, 50, 120]), [1, 10,4])
*   color: ramp(buckets($dn, [20, 50, 120]), prism)
* `);
*
*
* @example <caption>Mapping numeric expressions to colors and numbers</caption>
* const s = carto.expressions;
* const viz = new carto.Viz({
*   width: s.ramp(s.linear(s.prop('dn'), 40, 100), [1, 8])
*   color: s.ramp(s.linear(s.prop('dn'), 40, 100), s.palettes.PRISM)
* });
*
* @example <caption>Mapping numeric expressions to colors and numbers (String)</caption>
* const viz = new carto.Viz(`
*   width: ramp(linear($dn, 40, 100), [1, 10,4])
*   color: ramp(linear($dn, 40, 100), prism)
* `);
*
* @memberof carto.expressions
* @name ramp
* @function
* @api
*/
class Ramp extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(input, palette) {
        input = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(input);
        palette = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(palette);

        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkExpression"])('ramp', 'input', 0, input);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('ramp', 'input', 0, ['number', 'category'], input);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('ramp', 'palette', 1, ['palette', 'color-array', 'number-array', 'sprite'], palette);
        if (palette.type == 'sprite') {
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkInstance"])('ramp', 'palette', 1, _sprites__WEBPACK_IMPORTED_MODULE_3__["default"], palette);
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('ramp', 'input', 0, 'category', input);
        }

        super({ input: input });
        this.minKey = 0;
        this.maxKey = 1;
        this.palette = palette;
        if (palette.type == 'number-array') {
            this.type = 'number';
        } else {
            this.type = 'color';
        }
        try {
            if (palette.type == 'number-array') {
                this.palette.floats = this.palette.eval();
            } else if (palette.type == 'color-array') {
                this.palette.colors = this.palette.eval();
            }
        } catch (error) {
            throw new Error('Palettes must be formed by constant expressions, they cannot depend on feature properties');
        }
    }

    loadSprites() {
        return Promise.all([this.input.loadSprites(), this.palette.loadSprites()]);
    }

    _setUID(idGenerator) {
        super._setUID(idGenerator);
        this.palette._setUID(idGenerator);
    }

    eval(o) {
        if (this.palette.type != 'number-array') {
            super.eval(o);
        }
        this._computeTextureIfNeeded();
        const input = this.input.eval(o);
        const m = (input - this.minKey) / (this.maxKey - this.minKey);
        const len = this.pixel.length - 1;
        const lowIndex = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(Math.floor(len * m), 0, len);
        const highIndex = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(Math.ceil(len * m), 0, len);
        const low = this.pixel[lowIndex];
        const high = this.pixel[highIndex];
        const fract = len * m - Math.floor(len * m);
        return fract * high + (1 - fract) * low;
    }
    _compile(meta) {
        super._compile(meta);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('ramp', 'input', 0, ['number', 'category'], this.input);
        if (this.palette.type == 'sprite') {
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('ramp', 'input', 0, 'category', this.input);
            Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkInstance"])('ramp', 'palette', 1, _sprites__WEBPACK_IMPORTED_MODULE_3__["default"], this.palette);
        }
        this._texCategories = null;
        this._GLtexCategories = null;
    }

    _free(gl) {
        if (this.texture) {
            gl.deleteTexture(this.texture);
        }
    }

    _applyToShaderSource(getGLSLforProperty) {
        const input = this.input._applyToShaderSource(getGLSLforProperty);
        if (this.palette.type == 'sprite') {
            const sprites = this.palette._applyToShaderSource(getGLSLforProperty);
            return {
                preface: input.preface + sprites.preface,
                inline: `${sprites.inline}(spriteUV, ${input.inline})`
            };
        }
        return {
            preface: this._prefaceCode(input.preface + `
        uniform sampler2D texRamp${this._uid};
        uniform float keyMin${this._uid};
        uniform float keyWidth${this._uid};
        `),
            inline: this.palette.type == 'number-array' ?
                `(texture2D(texRamp${this._uid}, vec2((${input.inline}-keyMin${this._uid})/keyWidth${this._uid}, 0.5)).a)`
                : `texture2D(texRamp${this._uid}, vec2((${input.inline}-keyMin${this._uid})/keyWidth${this._uid}, 0.5)).rgba`
        };
    }
    _getColorsFromPalette(input, palette) {
        if (palette.type == 'palette') {
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
            return palette.colors;
        }
    }
    _postShaderCompile(program, gl) {
        if (this.palette.type == 'sprite') {
            this.palette._postShaderCompile(program, gl);
            super._postShaderCompile(program, gl);
            return;
        }
        this.input._postShaderCompile(program, gl);
        this._getBinding(program).texLoc = gl.getUniformLocation(program, `texRamp${this._uid}`);
        this._getBinding(program).keyMinLoc = gl.getUniformLocation(program, `keyMin${this._uid}`);
        this._getBinding(program).keyWidthLoc = gl.getUniformLocation(program, `keyWidth${this._uid}`);
    }
    _computeTextureIfNeeded() {
        if (this._texCategories !== this.input.numCategories) {
            this._texCategories = this.input.numCategories;

            if (this.input.type == 'category') {
                this.maxKey = this.input.numCategories - 1;
            }
            const width = 256;
            if (this.type == 'color') {
                const pixel = new Uint8Array(4 * width);
                const colors = this._getColorsFromPalette(this.input, this.palette);
                for (let i = 0; i < width; i++) {
                    const vlowRaw = colors[Math.floor(i / (width - 1) * (colors.length - 1))];
                    const vhighRaw = colors[Math.ceil(i / (width - 1) * (colors.length - 1))];
                    const vlow = [vlowRaw.r / 255, vlowRaw.g / 255, vlowRaw.b / 255, vlowRaw.a];
                    const vhigh = [vhighRaw.r / 255, vhighRaw.g / 255, vhighRaw.b / 255, vhighRaw.a];
                    const m = i / (width - 1) * (colors.length - 1) - Math.floor(i / (width - 1) * (colors.length - 1));
                    const v = interpolate({ r: vlow[0], g: vlow[1], b: vlow[2], a: vlow[3] }, { r: vhigh[0], g: vhigh[1], b: vhigh[2], a: vhigh[3] }, m);
                    pixel[4 * i + 0] = v.r * 255;
                    pixel[4 * i + 1] = v.g * 255;
                    pixel[4 * i + 2] = v.b * 255;
                    pixel[4 * i + 3] = v.a * 255;
                }
                this.pixel = pixel;
            } else {
                const pixel = new Float32Array(width);
                const floats = this.palette.floats;
                for (let i = 0; i < width; i++) {
                    const vlowRaw = floats[Math.floor(i / (width - 1) * (floats.length - 1))];
                    const vhighRaw = floats[Math.ceil(i / (width - 1) * (floats.length - 1))];
                    const m = i / (width - 1) * (floats.length - 1) - Math.floor(i / (width - 1) * (floats.length - 1));
                    pixel[i] = ((1. - m) * vlowRaw + m * vhighRaw);
                }
                this.pixel = pixel;
            }
        }
    }
    _computeGLTextureIfNeeded(gl) {
        this._computeTextureIfNeeded();
        if (this._GLtexCategories !== this.input.numCategories) {
            this._GLtexCategories = this.input.numCategories;

            const width = 256;
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            const pixel = this.pixel;
            if (this.type == 'color') {
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                    width, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                    pixel);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            } else {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA,
                    width, 1, 0, gl.ALPHA, gl.FLOAT,
                    pixel);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
    }
    _preDraw(program, drawMetadata, gl) {
        this.input._preDraw(program, drawMetadata, gl);
        if (this.palette.type == 'sprite') {
            this.palette._preDraw(program, drawMetadata, gl);
            return;
        }
        gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
        this._computeGLTextureIfNeeded(gl);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this._getBinding(program).texLoc, drawMetadata.freeTexUnit);
        gl.uniform1f(this._getBinding(program).keyMinLoc, (this.minKey));
        gl.uniform1f(this._getBinding(program).keyWidthLoc, (this.maxKey) - (this.minKey));
        drawMetadata.freeTexUnit++;
    }
}

function interpolate(low, high, m) {
    const cielabLow = Object(_colorspaces__WEBPACK_IMPORTED_MODULE_2__["sRGBToCielab"])({
        r: low.r,
        g: low.g,
        b: low.b,
        a: low.a,
    });
    const cielabHigh = Object(_colorspaces__WEBPACK_IMPORTED_MODULE_2__["sRGBToCielab"])({
        r: high.r,
        g: high.g,
        b: high.b,
        a: high.a,
    });

    const cielabInterpolated = {
        l: (1 - m) * cielabLow.l + m * cielabHigh.l,
        a: (1 - m) * cielabLow.a + m * cielabHigh.a,
        b: (1 - m) * cielabLow.b + m * cielabHigh.b,
        alpha: (1 - m) * cielabLow.alpha + m * cielabHigh.alpha,
    };

    return Object(_colorspaces__WEBPACK_IMPORTED_MODULE_2__["cielabToSRGB"])(cielabInterpolated);
}


/***/ }),

/***/ "./src/core/viz/expressions/sprite.js":
/*!********************************************!*\
  !*** ./src/core/viz/expressions/sprite.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Sprite; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");



/**
 * Sprite. Load an image and use it as a symbol.
 *
 * Note: sprite RGB color will be overridden if the viz `color` property is set.
 *
 * Limitation: images have to be square.
 *
 * @param {string} url - Image path
 *
 * @example <caption>Load a svg image.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   symbol: s.sprite('./marker.svg')
 * });
 *
 * @example <caption>Load a svg image. (String)</caption>
 * const viz = new carto.Viz(`
 *    symbol: sprite('./marker.svg')
 * `);
 * @memberof carto.expressions
 * @name sprite
 * @function
 * @api
*/

class Sprite extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(url) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkString"])('sprite', 'url', 0, url);
        super({});
        this.type = 'sprite';
        this.canvas = null;
        this._url = url;
        this._promise = new Promise((resolve, reject) => {
            this.image = new Image();
            this.image.onload = () => {
                this.canvas = getCanvasFromImage(this.image);
                this.image = null;
                resolve();
            };
            this.image.onerror = reject;
            this.image.src = this._url;
            this.image.crossOrigin = 'anonymous';
        });
    }

    loadSprites() {
        this.count = this.count + 1 || 1;
        return this._promise;
    }

    _compile(meta) {
        super._compile(meta);
    }

    _free(gl) {
        if (this.texture) {
            gl.deleteTexture(this.texture);
        }
    }

    _applyToShaderSource() {
        return {
            preface: this._prefaceCode(`
        uniform sampler2D texSprite${this._uid};
        `),
            inline:
                `texture2D(texSprite${this._uid}, spriteUV).rgba`
        };
    }

    _postShaderCompile(program, gl) {
        this._getBinding(program)._texLoc = gl.getUniformLocation(program, `texSprite${this._uid}`);
    }

    _preDraw(program, drawMetadata, gl) {
        if (!this.init && this.canvas) {
            this.init = true;
            gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
            this.texture = gl.createTexture();
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.generateMipmap(gl.TEXTURE_2D);
            this.canvas = null;
        }

        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this._getBinding(program)._texLoc, drawMetadata.freeTexUnit);
            drawMetadata.freeTexUnit++;
        }
    }
    // TODO eval
}

function getCanvasFromImage(img) {
    const canvasSize = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const ctx = canvas.getContext('2d');

    const max = Math.min(Math.max(img.width, img.height), canvasSize);
    const width = img.width / max * canvasSize;
    const height = img.height / max * canvasSize;
    ctx.drawImage(img, (canvasSize - width) / 2, (canvasSize - height) / 2, width, height);

    return canvas;
}


/***/ }),

/***/ "./src/core/viz/expressions/sprites.js":
/*!*********************************************!*\
  !*** ./src/core/viz/expressions/sprites.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Sprites; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");



/**
 * Sprites. Load an array of images and use them as a symbols.
 *
 * Note: sprites RGB color will be overridden if the viz `color` property is set.
 *
 * @param {Sprite[]} sprites - Array of sprites
 *
 * @example <caption>Match different sprites to the different categories generated by buckets.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   symbol: s.ramp(s.buckets(s.prop('pop_max'), [10]), s.sprites([s.sprite('./marker.svg'), s.sprite('./marker2.svg')]))
 * });
 *
 * @example <caption>Match different sprites to the different categories generated by buckets. (String)</caption>
 * const viz = new carto.Viz(`
 *    symbol: ramp(buckets($pop_max, [10]), sprites([sprite('./marker.svg'), sprite('./marker2.svg')]))
 * `);
 *
 * @memberof carto.expressions
 * @name sprites
 * @function
 * @api
*/

class Sprites extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(sprites) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkArray"])('sprites', 'sprites', 0, sprites);
        sprites.forEach((sprite, i) => Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('sprites', `sprites[${i}]`, 0, 'sprite', sprite));
        const children = {};
        sprites.forEach((sprite, i) => children[`sprite${i}`] = sprite);
        super(children);
        this.numSprites = sprites.length;
        this.type = 'sprite';
    }
    _applyToShaderSource() {
        return {
            preface: this._prefaceCode(`
        uniform sampler2D atlas${this._uid};

        vec4 atlas${this._uid}Fn(vec2 spriteUV, float cat){
            return texture2D(atlas${this._uid}, spriteUV/16. + vec2(mod(cat, 16.), floor(cat/16.))/16. ).rgba;
        }
        `),
            inline: `atlas${this._uid}Fn`
        };
    }
    _postShaderCompile(program, gl) {
        this._getBinding(program).texLoc = gl.getUniformLocation(program, `atlas${this._uid}`);
    }
    _preDraw(program, drawMetadata, gl) {
        this.init = true;
        for (let i = 0; i < this.numSprites; i++) {
            const sprite = this[`sprite${i}`];
            this.init = this.init && sprite.canvas;
        }

        if (this.init && !this.texture) {
            const textureAtlasSize = 4096;
            const spriteSize = 256;

            gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
            this.texture = gl.createTexture();
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureAtlasSize, textureAtlasSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            let offsetX = 0;
            let offsetY = 0;
            for (let i = 0; i < this.numSprites; i++) {
                const sprite = this[`sprite${i}`];
                // get image, push image to texture atlas
                gl.texSubImage2D(gl.TEXTURE_2D, 0, offsetX, offsetY, gl.RGBA, gl.UNSIGNED_BYTE, sprite.canvas);
                offsetX += spriteSize;

                if (offsetX + spriteSize > textureAtlasSize) {
                    offsetX = 0;
                    offsetY += spriteSize;
                }

                sprite.canvas = null;
            }

            gl.generateMipmap(gl.TEXTURE_2D);
        }

        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this._getBinding(program).texLoc, drawMetadata.freeTexUnit);
            drawMetadata.freeTexUnit++;
        }
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/time.js":
/*!******************************************!*\
  !*** ./src/core/viz/expressions/time.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Time; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _api_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../api/util */ "./src/api/util.js");



/**
 * Time contant expression
 *
 * @param {Date|string} date - The date from a JavaScript Date() object or encoded as a string
 * @return {Date}
 *
 * @example <caption>Filter by a date between dates.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.between(s.prop('date'), s.time('2022-03-09T00:00:00Z'), s.time('2033-08-12T00:00:00Z')
 * });
 *
 * @example <caption>Filter by a date between dates. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: time('2022-03-09T00:00:00Z') < $date < time('2033-08-12T00:00:00Z')
 * `);
 *
 * @memberof carto.expressions
 * @name time
 * @function
 * @api
 */
class Time extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(date) {
        super({});
        // TODO improve type check
        this.type = 'time';
        this.date = _api_util__WEBPACK_IMPORTED_MODULE_1__["castDate"](date);
        this.inlineMaker = () => undefined;
    }
    get value() {
        return this.eval();
    }
    eval() {
        return this.date;
    }
    isAnimated() {
        return false;
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/top.js":
/*!*****************************************!*\
  !*** ./src/core/viz/expressions/top.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Top; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");
/* harmony import */ var _basic_property__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./basic/property */ "./src/core/viz/expressions/basic/property.js");




/**
 * Get the top `n` properties, aggregating the rest into an "others" bucket category.
 *
 * @param {Category} property - Column of the table
 * @param {number} n - Number of top properties to be returned
 * @return {Category}
 *
 * @example <caption>Use top 3 categories to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.top(s.prop('category'), 3), s.palettes.VIVID)
 * });
 *
 * @example <caption>Use top 3 categories to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(top($category, 3), VIVID)
 * `);
 *
 * @memberof carto.expressions
 * @name top
 * @function
 * @api
 */
class Top extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(property, buckets) {
        buckets = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(buckets);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkInstance"])('top', 'property', 0, _basic_property__WEBPACK_IMPORTED_MODULE_2__["default"], property);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('top', 'buckets', 1, 'number', buckets);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkFeatureIndependent"])('top', 'buckets', 1, buckets);
        super({ property, buckets });
        this.type = 'category';
    }
    eval(feature) {
        const p = this.property.eval(feature);
        const buckets = Math.round(this.buckets.eval());
        const metaColumn = this._meta.columns.find(c => c.name == this.property.name);
        let ret;
        metaColumn.categoryNames.map((name, i) => {
            if (i == p) {
                ret = i < buckets ? i + 1 : 0;
            }
        });
        return ret;
    }
    _compile(metadata) {
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkFeatureIndependent"])('top', 'buckets', 1, this.buckets);
        super._compile(metadata);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('top', 'property', 0, 'category', this.property);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('top', 'buckets', 1, 'number', this.buckets);
        this.othersBucket = true;
        this._meta = metadata;
        this._textureBuckets = null;
    }
    get numCategories() {
        return Math.round(this.buckets.eval()) + 1;
    }
    _applyToShaderSource(getGLSLforProperty) {
        const property = this.property._applyToShaderSource(getGLSLforProperty);
        return {
            preface: this._prefaceCode(property.preface + `uniform sampler2D topMap${this._uid};\n`),
            inline: `(255.*texture2D(topMap${this._uid}, vec2(${property.inline}/1024., 0.5)).a)`
        };
    }
    _postShaderCompile(program, gl) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        this.property._postShaderCompile(program);
        this._getBinding(program)._texLoc = gl.getUniformLocation(program, `topMap${this._uid}`);
    }
    _preDraw(program, drawMetadata, gl) {
        this.property._preDraw(program, drawMetadata);
        gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
        let buckets = Math.round(this.buckets.eval());
        if (buckets > this.property.numCategories) {
            buckets = this.property.numCategories;
        }
        if (this._textureBuckets !== buckets) {
            this._textureBuckets = buckets;
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            const width = 1024;
            let pixels = new Uint8Array(4 * width);
            const metaColumn = this._meta.columns.find(c => c.name == this.property.name);
            metaColumn.categoryNames.map((name, i) => {
                if (i < buckets) {
                    pixels[4 * this._meta.categoryIDs[name] + 3] = (i + 1);
                }
            });
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                width, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                pixels);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this._getBinding(program)._texLoc, drawMetadata.freeTexUnit);
        drawMetadata.freeTexUnit++;
    }
    //TODO _free
}


/***/ }),

/***/ "./src/core/viz/expressions/torque.js":
/*!********************************************!*\
  !*** ./src/core/viz/expressions/torque.js ***!
  \********************************************/
/*! exports provided: Fade, Torque */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Fade", function() { return Fade; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Torque", function() { return Torque; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../functions */ "./src/core/viz/functions.js");
/* harmony import */ var _basic_property__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./basic/property */ "./src/core/viz/expressions/basic/property.js");
/* harmony import */ var _basic_variable__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./basic/variable */ "./src/core/viz/expressions/basic/variable.js");
/* harmony import */ var _api_util__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../api/util */ "./src/api/util.js");







const DEFAULT_FADE = 0.15;

/**
 * Create a FadeIn/FadeOut configuration. See `torque` for more details.
 *
 * @param {Number} param1 - Expression of type number or Number
 * @param {Number} param2 - Expression of type number or Number
 * @return {Fade}
 *
 * @example <caption>Fade in of 0.1 seconds, fade out of 0.3 seconds.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.torque(s.prop('day'), 40, s.fade(0.1, 0.3))
 * });
 *
 * @example <caption>Fade in of 0.1 seconds, fade out of 0.3 seconds. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: torque($day, 40, fade(0.1, 0.3))
 * `);
 *
 * @example<caption>Fade in and fade out of 0.5 seconds.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.torque(s.prop('day'), 40, s.fade(0.5))
 * });
 *
 * @example<caption>Fade in and fade out of 0.5 seconds. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: torque($day, 40, fade(0.5))
 * `);
 * 
 * @example<caption>Fade in of 0.3 seconds without fading out.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.torque(s.prop('day'), 40, s.fade(0.1, s.HOLD))
 * });
 * 
 * @example<caption>Fade in of 0.3 seconds without fading out. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: torque($day, 40, fade(0.3, HOLD))
 * `);
 *
 * @memberof carto.expressions
 * @name fade
 * @function
 * @api
*/
class Fade extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(param1 = _utils__WEBPACK_IMPORTED_MODULE_1__["DEFAULT"], param2 = _utils__WEBPACK_IMPORTED_MODULE_1__["DEFAULT"]) {
        let fadeIn = param1;
        let fadeOut = param2;
        if (param1 == _utils__WEBPACK_IMPORTED_MODULE_1__["DEFAULT"]) {
            fadeIn = DEFAULT_FADE;
        }
        if (param2 == _utils__WEBPACK_IMPORTED_MODULE_1__["DEFAULT"]) {
            fadeOut = fadeIn;
        }
        fadeIn = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(fadeIn);
        fadeOut = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(fadeOut);
        // TODO improve type check
        super({ fadeIn, fadeOut });
        this.type = 'fade';
        this.inlineMaker = (inline) => ({
            in: inline.fadeIn,
            out: inline.fadeOut,
        });
    }
}

/**
 * Create an animated temporal filter (torque).
 *
 * @param {Number} input input to base the temporal filter,
 * if input is a property, the beginning and end of the animation will be determined by the minimum and maximum timestamps of the property on the dataset,
 * this can be problematic if outliers are present. Otherwise input must be a number expression in which 0 means beginning of the animation and 1 means end.
 * If `input` is NULL or NaN the filter won't be passed at any moment of the animation.
 *
 * It can be combined with linear and time expressions.
 * @param {Number} duration duration of the animation in seconds, optional, defaults to 10 seconds
 * @param {Fade} fade fadeIn/fadeOut configuration, optional, defaults to 0.15 seconds of fadeIn and 0.15 seconds of fadeOut
 * @return {Number}
 *
 * @example <caption>Temporal map by $day (of numeric type), with a duration of 40 seconds, fadeIn of 0.1 seconds and fadeOut of 0.3 seconds. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 2
 *   color: ramp(linear(clusterAvg($temp), 0,30), tealrose)
 *   filter: torque($day, 40, fade(0.1, 0.3))
 * `);
 *
 * @example <caption>Temporal map by $date (of date type), with a duration of 40 seconds, fadeIn of 0.1 seconds and fadeOut of 0.3 seconds. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: 2
 *   color: ramp(linear(clusterAvg($temp), 0,30), tealrose)
 *   filter: torque(linear($date, time('2022-03-09T00:00:00Z'), time('2033-08-12T00:00:00Z')), 40, fade(0.1, 0.3))
 * `);
 *
 * @example <caption>Using the `getSimTime` method to get the simulated time.</caption>
 * const s = carto.expressions;
 * let torqueExpr = s.torque(s.linear(s.prop('saledate'), 1991, 2017), 20, s.fade(0.7, 0.4));
 * const torqueStyle = {
 *   color: s.ramp(s.linear(s.prop('priceperunit'), 2000, 1010000), [s.rgb(0, 255, 0), s.rgb(255, 0, 0)]),
 *   width: s.mul(s.sqrt(s.prop('priceperunit')), 0.05),
 *   filter: torqueExpr
 * };
 * layer.on('updated', () => {
 *   let currTime = Math.floor(torqueExpr.getSimTime());
 *   document.getElementById('timestamp').innerHTML = currTime;
 * });
 *
 * @memberof carto.expressions
 * @name torque
 * @function
 * @api
*/
/**
 * Torque class
 *
 * This class is instanced automatically by using the `torque` function. It is documented for its methods.
 *
 * @memberof carto.expressions
 * @name Torque
 * @abstract
 * @hideconstructor
 * @class
 * @api
 */
class Torque extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(input, duration = 10, fade = new Fade()) {
        duration = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(duration);
        let originalInput = input;

        if (input instanceof _basic_property__WEBPACK_IMPORTED_MODULE_3__["default"]) {
            input = Object(_functions__WEBPACK_IMPORTED_MODULE_2__["linear"])(input, Object(_functions__WEBPACK_IMPORTED_MODULE_2__["globalMin"])(input), Object(_functions__WEBPACK_IMPORTED_MODULE_2__["globalMax"])(input));
        } else {
            input = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(input);
            originalInput = input;
        }

        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('torque', 'input', 0, 'number', input);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('torque', 'duration', 1, 'number', duration);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkFeatureIndependent"])('torque', 'duration', 1, duration);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkLooseType"])('torque', 'fade', 2, 'fade', fade);

        const progress = Object(_functions__WEBPACK_IMPORTED_MODULE_2__["number"])(0);

        super({ _input: input, progress, fade, duration });
        // TODO improve type check
        this.type = 'number';
        this._originalInput = originalInput;
        this._paused = false;
    }

    isAnimated() {
        return !this.paused;
    }

    _setTimestamp(timestamp) {
        let deltaTime = 0;
        const speed = 1 / this.duration.value;

        if (this._lastTime !== undefined) {
            deltaTime = timestamp - this._lastTime;
        }

        this._lastTime = timestamp;

        if (this._paused) {
            return;
        }

        this.progress.expr = (this.progress.expr + speed * deltaTime) % 1;

        super._setTimestamp(timestamp);
    }

    eval(feature) {
        const input = this.input.eval(feature);

        if (Number.isNaN(input)) {
            return 0;
        }

        const progress = this.progress.value;
        const duration = this.duration.value;
        const fadeIn = this.fade.fadeIn.eval(feature);
        const fadeOut = this.fade.fadeOut.eval(feature);

        const output = 1 - Object(_utils__WEBPACK_IMPORTED_MODULE_1__["clamp"])(Math.abs(input - progress) * duration / (input > progress ? fadeIn : fadeOut), 0, 1);
        return output;
    }

    /**
     * Get the current time stamp of the simulation
     *
     * @api
     * @returns {Number|Date} Current time stamp of the simulation, if the simulation is based on a numeric expression this will output a number, if it is based on a date expression it will output a date
     * @memberof carto.expressions.Torque
     * @instance
     * @name getSimTime
     */
    getSimTime() {
        const progress = this.progress.eval(); //from 0 to 1
        const min = this.input.min.eval();
        const max = this.input.max.eval();

        if (!(min instanceof Date)) {
            return progress * (max - min) + min;
        }

        const tmin = min.getTime();
        const tmax = max.getTime();
        const tmix = (1 - progress) * tmin + tmax * progress;

        return new Date(tmix);
    }

    /**
     * Set the time stamp of the simulation
     * @api
     * @memberof carto.expressions.Torque
     * @instance
     * @name setSimTime
     * @param {Date|number} simulationTime - A javascript Date object with the new simulation time
     */
    setSimTime(simulationTime) {
        simulationTime = Object(_api_util__WEBPACK_IMPORTED_MODULE_5__["castDate"])(simulationTime);
        
        const tmin = this._input.min.eval();
        const tmax = this._input.max.eval();

        if (simulationTime.getTime() < tmin) {
            throw new RangeError('torque.setSimTime requires the date parameter to be higher than the lower limit');
        }
        if (simulationTime.getTime() > tmax) {
            throw new RangeError('torque.setSimTime requires the date parameter to be lower than the higher limit');
        }
        this.progress.expr = (simulationTime.getTime() - tmin) / (tmax - tmin);
    }

    /**
     * Get the simulation progress.
     * 
     * @returns {Number} A number representing the progress. 0 when the animation just started and 1 at the end of the cycle.
     * @api
     * @instance
     * @memberof carto.expressions.Torque
     * @name getSimProgress
     */
    getSimProgress() {
        return this.progress.value;
    }

    /**
     * Set the simulation progress from 0 to 1.
     * @param {number} progress - A number in the [0-1] range setting the animation progress.
     * @api
     * @instance
     * @memberof carto.expressions.Torque
     * @name setSimProgress
     */
    setSimProgress(progress) {
        progress = Number.parseFloat(progress);
        if (progress < 0 || progress > 1) {
            throw new TypeError(`torque.setSimProgress requires a number between 0 and 1 as parameter but got: ${progress}`);
        }
        this.progress.expr = progress;
    }

    /**
     * Pause the simulation
     *
     * @api
     * @memberof carto.expressions.Torque
     * @instance
     * @name pause
     */
    pause() {
        this._paused = true;
    }

    /**
     * Play/resume the simulation
     *
     * @api
     * @memberof carto.expressions.Torque
     * @instance
     * @name play
     */
    play() {
        this._paused = false;
    }

    /**
     * Stops the simulation
     *
     * @api
     * @memberof carto.expressions.Torque
     * @instance
     * @name stop
     */
    stop() {
        this.progress.expr = 0;
        this._paused = true;
    }

    get input() {
        return this._input instanceof _basic_variable__WEBPACK_IMPORTED_MODULE_4__["default"] ? this._input.alias : this._input;
    }

    _compile(meta) {
        this._originalInput._compile(meta);
        this.duration._compile(meta);

        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('torque', 'input', 0, ['number', 'date'], this._originalInput);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('torque', 'duration', 1, 'number', this.duration);
        super._compile(meta);

        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('torque', 'input', 0, 'number', this.input);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkType"])('torque', 'fade', 2, 'fade', this.fade);
        Object(_utils__WEBPACK_IMPORTED_MODULE_1__["checkFeatureIndependent"])('torque', 'duration', 1, this.duration);

        this.preface = `
            #ifndef TORQUE
            #define TORQUE
            
            float torque(float _input, float progress, float duration, float fadeIn, float fadeOut){
                float x = 0.;
                
                // Check for NaN
                if (_input <= 0.0 || 0.0 <= _input){
                    x = 1. - clamp(abs(_input - progress) * duration / (_input > progress ? fadeIn: fadeOut), 0., 1.);
                }

                return x;
            }

            #endif
        `;

        this.inlineMaker = inline =>
            `torque(${inline._input}, ${inline.progress}, ${inline.duration}, ${inline.fade.in}, ${inline.fade.out})`;
    }
}


/***/ }),

/***/ "./src/core/viz/expressions/unary.js":
/*!*******************************************!*\
  !*** ./src/core/viz/expressions/unary.js ***!
  \*******************************************/
/*! exports provided: Log, Sqrt, Sin, Cos, Tan, Sign, Abs, IsNaN, Not, Floor, Ceil */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Log", function() { return Log; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Sqrt", function() { return Sqrt; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Sin", function() { return Sin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Cos", function() { return Cos; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Tan", function() { return Tan; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Sign", function() { return Sign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Abs", function() { return Abs; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IsNaN", function() { return IsNaN; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Not", function() { return Not; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Floor", function() { return Floor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Ceil", function() { return Ceil; });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");



/**
 * Compute the natural logarithm (base e) of a number x.
 *
 * @param {Number} x - Numeric expression to compute the natural logarithm
 * @return {Number}
 *
 * @example <caption>Natural Logarithm.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.log(10)  // 2.302585092994046
 * });
 *
 * @example <caption>Natural Logarithm. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: log(10)
 * `);
 *
 * @memberof carto.expressions
 * @name log
 * @function
 * @api
 */
const Log = genUnaryOp('log', x => Math.log(x), x => `log(${x})`);

/**
 * Compute the square root of a number x.
 *
 * @param {Number} x - Numeric expression to compute the square root
 * @return {Number}
 *
 * @example <caption>Square root.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.sqrt(4)  // 2
 * });
 *
 * @example <caption>Square root. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: sqrt(4)
 * `);
 *
 * @memberof carto.expressions
 * @name sqrt
 * @function
 * @api
 */
const Sqrt = genUnaryOp('sqrt', x => Math.sqrt(x), x => `sqrt(${x})`);

/**
 * Compute the sine of a number x.
 *
 * @param {Number} x - Numeric expression to compute the sine in radians
 * @return {Number}
 *
 * @example <caption>Sin.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.sin(Math.PI/2)  // 1
 * });
 *
 * @example <caption>Sin. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: sin(PI/2)
 * `);
 *
 * @memberof carto.expressions
 * @name sin
 * @function
 * @api
 */
const Sin = genUnaryOp('sin', x => Math.sin(x), x => `sin(${x})`);

/**
 * Compute the cosine of a number x.
 *
 * @param {Number} x - Numeric expression to compute the cosine in radians
 * @return {Number}
 *
 * @example <caption>Cos.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.cos(0)  // 1
 * });
 *
 * @example <caption>Cos. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: cos(0)
 * `);
 *
 * @memberof carto.expressions
 * @name cos
 * @function
 * @api
 */
const Cos = genUnaryOp('cos', x => Math.cos(x), x => `cos(${x})`);

/**
 * Compute the tangent of a number x.
 *
 * @param {Number} x - Numeric expression to compute the tangent in radians
 * @return {Number}
 *
 * @example <caption>Tan</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.tan(0)  // 0
 * });
 *
 * @example <caption>Tan. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: tan(0)
 * `);
 *
 * @memberof carto.expressions
 * @name tan
 * @function
 * @api
 */
const Tan = genUnaryOp('tan', x => Math.tan(x), x => `tan(${x})`);

/**
 * Compute the sign of a number x, indicating whether the number is positive, negative or zero
 * This means this function will return 1 if the number is positive, -1 if the number is negative
 * 0 if the number is 0 and -0 if the number is -0.
 *
 * @param {Number} x - Numeric expression to compute the sign
 * @return {Number}
 *
 * @example <caption>Sign.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.sign(100)  // 1
 * });
 *
 * @example <caption>Sign. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: sign(100)
 * `);
 *
 * @memberof carto.expressions
 * @name sign
 * @function
 * @api
 */
const Sign = genUnaryOp('sign', x => Math.sign(x), x => `sign(${x})`);

/**
 * Compute the absolute value of a number x.
 *
 * @param {Number} x - Numeric expression to compute the absolute value
 * @return {Number}
 *
 * @example <caption>Abs.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.abs(-100)  // 100
 * });
 *
 * @example <caption>Abs. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: abs(-100) // 100
 * `);
 *
 * @memberof carto.expressions
 * @name abs
 * @function
 * @api
 */
const Abs = genUnaryOp('abs', x => Math.abs(x), x => `abs(${x})`);

/**
 * Check if a numeric expression is NaN.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {Number} x - Numeric expression to check
 * @return {Number}
 *
 * @memberof carto.expressions
 * @name isNaN
 * @function
 * @api
 */
const IsNaN = genUnaryOp('isNaN', x => Number.isNaN(x) ? 1 : 0, x => `(isnan(${x})? 1.: 0.)`);

/**
 * Compute the logical negation of the given expression.
 * This is internally computed as 1 - x preserving boolean behavior and allowing fuzzy logic.
 *
 *  - When x is equal to 1 not(x) will be evaluated to 0
 *  - When x is equal to 0 not(x) will be evaluated to 1
 *
 * @param {Number} x - Number to compute the not value
 * @return {Number}
 *
 * @example <caption>Not.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.not(0)  // 1
 * });
 *
 * @example <caption>Not. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: not(0)
 * `);
 *
 * @memberof carto.expressions
 * @name not
 * @function
 * @api
 */
const Not = genUnaryOp('not', x => 1 - x, x => `(1.0 - ${x})`);

/**
 * Compute the floor of the given expression.
 * Find the nearest integer less than or equal to the expression value.
 *
 *  - When x is equal to 0.8 floor(x) will be evaluated to 0
 *  - When x is equal to 1.3 floor(x) will be evaluated to 1
 *
 * @param {Number} x - Number to compute the floor value
 * @return {Number}
 *
 * @example <caption>Floor.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.floor(5.9)  // 5
 * });
 *
 * @example <caption>Floor. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: floor(5.9)
 * `);
 *
 * @memberof carto.expressions
 * @name floor
 * @function
 * @api
 */
const Floor = genUnaryOp('floor', x => Math.floor(x), x => `floor(${x})`);

/**
 * Compute the ceil of the given expression.
 * Find the nearest integer that is greater than or equal to the expression value.
 *
 *  - When x is equal to 0.8 ceil(x) will be evaluated to 1
 *  - When x is equal to 1.3 ceil(x) will be evaluated to 2
 *
 * @param {Number} x - Number to compute the ceil value
 * @return {Number}
 *
 * @example <caption>Ceil.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.ceil(5.1);  // 6
 * });
 *
 * @example <caption>Ceil. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: ceil(5.1)
 * `);
 *
 * @memberof carto.expressions
 * @name ceil
 * @function
 * @api
 */
const Ceil = genUnaryOp('ceil', x => Math.ceil(x), x => `ceil(${x})`);

function genUnaryOp(name, jsFn, glsl) {
    return class UnaryOperation extends _base__WEBPACK_IMPORTED_MODULE_1__["default"] {
        constructor(a) {
            a = Object(_utils__WEBPACK_IMPORTED_MODULE_0__["implicitCast"])(a);
            Object(_utils__WEBPACK_IMPORTED_MODULE_0__["checkLooseType"])(name, 'x', 0, 'number', a);
            super({ a });
            this.type = 'number';
        }
        get value() {
            return this.eval();
        }
        eval(feature) {
            return jsFn(this.a.eval(feature));
        }
        _compile(meta) {
            super._compile(meta);
            Object(_utils__WEBPACK_IMPORTED_MODULE_0__["checkType"])(name, 'x', 0, 'number', this.a);
            if (this.a.type != 'number') {
                throw new Error(`Unary operation cannot be performed to '${this.a.type}'`);
            }
            this.inlineMaker = inlines => glsl(inlines.a);
        }
    };
}


/***/ }),

/***/ "./src/core/viz/expressions/utils.js":
/*!*******************************************!*\
  !*** ./src/core/viz/expressions/utils.js ***!
  \*******************************************/
/*! exports provided: DEFAULT, implicitCast, hexToRgb, getOrdinalFromIndex, getStringErrorPreface, throwInvalidType, throwInvalidInstance, throwInvalidNumber, throwInvalidArray, throwInvalidString, checkLooseType, isArgConstructorTimeTyped, checkExpression, checkType, checkInstance, checkNumber, checkString, checkArray, checkFeatureIndependent, clamp, mix */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DEFAULT", function() { return DEFAULT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "implicitCast", function() { return implicitCast; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hexToRgb", function() { return hexToRgb; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getOrdinalFromIndex", function() { return getOrdinalFromIndex; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getStringErrorPreface", function() { return getStringErrorPreface; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "throwInvalidType", function() { return throwInvalidType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "throwInvalidInstance", function() { return throwInvalidInstance; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "throwInvalidNumber", function() { return throwInvalidNumber; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "throwInvalidArray", function() { return throwInvalidArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "throwInvalidString", function() { return throwInvalidString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkLooseType", function() { return checkLooseType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isArgConstructorTimeTyped", function() { return isArgConstructorTimeTyped; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkExpression", function() { return checkExpression; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkType", function() { return checkType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkInstance", function() { return checkInstance; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkNumber", function() { return checkNumber; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkString", function() { return checkString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkArray", function() { return checkArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "checkFeatureIndependent", function() { return checkFeatureIndependent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clamp", function() { return clamp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mix", function() { return mix; });
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../functions */ "./src/core/viz/functions.js");
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");



const DEFAULT = undefined;

// To support literals (string and numeric) out of the box we need to cast them implicitly on constructors
function implicitCast(value) {
    if (_isNumber(value)) {
        return Object(_functions__WEBPACK_IMPORTED_MODULE_0__["number"])(value);
    }
    if (typeof value == 'string') {
        return Object(_functions__WEBPACK_IMPORTED_MODULE_0__["category"])(value);
    }
    if (Array.isArray(value)) {
        return Object(_functions__WEBPACK_IMPORTED_MODULE_0__["array"])(value);
    }
    return value;
}

function hexToRgb(hex) {
    // Evaluate #ABC
    let result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);
    if (result) {
        return {
            r: parseInt(result[1] + result[1], 16),
            g: parseInt(result[2] + result[2], 16),
            b: parseInt(result[3] + result[3], 16),
            a: 1
        };
    }

    // Evaluate #ABCD
    result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);
    if (result) {
        return {
            r: parseInt(result[1] + result[1], 16),
            g: parseInt(result[2] + result[2], 16),
            b: parseInt(result[3] + result[3], 16),
            a: parseInt(result[4] + result[4], 16) / 255,
        };
    }


    // Evaluate #ABCDEF
    result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: 1
        };
    }

    // Evaluate #ABCDEFAF
    result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: parseInt(result[4], 16) / 255,
        };
    }

    throw new Error('Invalid hexadecimal color');
}

function getOrdinalFromIndex(index) {
    const indexToOrdinal = {
        1: 'first',
        2: 'second',
        3: 'third',
        4: 'fourth'
    };
    return indexToOrdinal[index] || String(index);
}

function getStringErrorPreface(expressionName, parameterName, parameterIndex) {
    return `${expressionName}(): invalid ${getOrdinalFromIndex(parameterIndex + 1)} parameter '${parameterName}'`;
}
function throwInvalidType(expressionName, parameterName, parameterIndex, expectedType, actualType) {
    throw new Error(`${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
expected type was '${expectedType}', actual type was '${actualType}'`);
}

function throwInvalidInstance(expressionName, parameterName, parameterIndex, expectedClass, actualInstance) {
    throw new Error(`${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
    '${actualInstance}' is not an instance of '${expectedClass.name}'`);
}

function throwInvalidNumber(expressionName, parameterName, parameterIndex, number) {
    throw new Error(`${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
    '${number}' is not a number`);
}

function throwInvalidArray(expressionName, parameterName, parameterIndex, array) {
    throw new Error(`${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
    '${array}' is not an array`);
}

function throwInvalidString(expressionName, parameterName, parameterIndex, str) {
    throw new Error(`${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
    '${str}' is not a string`);
}

// Try to check the type, but accept undefined types without throwing, unless the expected type had to be known at constructor time
// This condition happens with types like color or fade, see isArgConstructorTimeTyped for details
//
// This is useful to make constructor-time checks, at constructor-time some types can be already known and errors can be throw.
// Constructor-time is the best time to throw, but metadata is not provided yet, therefore, the checks cannot be complete,
// they must be loose, the unknown of variables aliases types makes, also, a point to reduce the strictness of the check
function checkLooseType(expressionName, parameterName, parameterIndex, expectedType, parameter) {
    checkExpression(expressionName, parameterName, parameterIndex, parameter);
    const constructorTimeTyped = Array.isArray(expectedType) ? expectedType.every(isArgConstructorTimeTyped) : isArgConstructorTimeTyped(expectedType);
    if (parameter.type !== undefined || constructorTimeTyped) {
        checkType(expressionName, parameterName, parameterIndex, expectedType, parameter);
    }
}

// Returns true if the argument is of a type that cannot be strictly checked at constructor time
function isArgConstructorTimeTyped(arg) {
    switch (arg) {
        case 'number':
        case 'number-array':
        case 'number-property':
        case 'category':
        case 'category-array':
        case 'category-property':
            return false;
        default:
            return true;
    }
}

function checkExpression(expressionName, parameterName, parameterIndex, parameter) {
    if (!(parameter instanceof _base__WEBPACK_IMPORTED_MODULE_1__["default"])) {
        throw new Error(`${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
        '${parameter}' is not of type carto.expressions.Base`);
    }
}

function checkType(expressionName, parameterName, parameterIndex, expectedType, parameter) {
    checkExpression(expressionName, parameterName, parameterIndex, parameter);
    if (Array.isArray(expectedType)) {
        const ok = expectedType.some(type =>
            parameter.type == type
        );
        if (!ok) {
            throw new Error(`${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
            expected type was one of ${expectedType.join()}, actual type was '${parameter.type}'`);
        }
    } else if (parameter.type != expectedType) {
        throwInvalidType(expressionName, parameterName, parameterIndex, expectedType, parameter.type);
    }
}

function checkInstance(expressionName, parameterName, parameterIndex, expectedClass, parameter) {
    checkExpression(expressionName, parameterName, parameterIndex, parameter);
    if (!(parameter instanceof expectedClass)) {
        throwInvalidInstance(expressionName, parameterName, parameterIndex, expectedClass, parameter.type);
    }
}

function checkNumber(expressionName, parameterName, parameterIndex, number) {
    if (!_isNumber(number)) {
        throwInvalidNumber(expressionName, parameterName, parameterIndex, number);
    }
}

function checkString(expressionName, parameterName, parameterIndex, str) {
    if (typeof str !== 'string') {
        throwInvalidString(expressionName, parameterName, parameterIndex, str);
    }
}

function checkArray(expressionName, parameterName, parameterIndex, array) {
    if (!Array.isArray(array)) {
        throwInvalidArray(expressionName, parameterName, parameterIndex, array);
    }
}

function checkFeatureIndependent(expressionName, parameterName, parameterIndex, parameter) {
    if (parameter.isFeatureDependent()) {
        throw new Error(`${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
        parameter cannot be feature dependent`);
    }
}

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

function mix(x, y, a) {
    return x * (1 - a) + y * a;
}

function _isNumber(value) {
    return Number.isFinite(value) || value == Infinity || value == -Infinity || Number.isNaN(value);
}


/***/ }),

/***/ "./src/core/viz/expressions/xyz.js":
/*!*****************************************!*\
  !*** ./src/core/viz/expressions/xyz.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return XYZ; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/core/viz/expressions/utils.js");



// TODO should this expression be removed?
class XYZ extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(x, y, z) {
        x = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(x);
        y = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(y);
        z = Object(_utils__WEBPACK_IMPORTED_MODULE_1__["implicitCast"])(z);
        super({ x: x, y: y, z: z });
        // TODO improve type check
    }
    _compile(meta) {
        super._compile(meta);
        if (this.x.type != 'number' || this.y.type != 'number' || this.z.type != 'number') {
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


/***/ }),

/***/ "./src/core/viz/expressions/zoom.js":
/*!******************************************!*\
  !*** ./src/core/viz/expressions/zoom.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Zoom; });
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base */ "./src/core/viz/expressions/base.js");
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../functions */ "./src/core/viz/functions.js");



/**
 * Get the current zoom level. Multiplying by zoom() makes features constant in real-world space respect their size at zoom level 0.
 *
 * @return {Number}
 *
 * @example <caption>Show constant width in zoom.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.div(s.zoom(), 1000)
 * });
 *
 * @example <caption>Show constant width in zoom. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: zoom() / 1000
 * `);
 *
 * @memberof carto.expressions
 * @name zoom
 * @function
 * @api
 */
class Zoom extends _base__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor() {
        super({ zoom: Object(_functions__WEBPACK_IMPORTED_MODULE_1__["number"])(0) });
        this.type = 'number';
    }
    eval() {
        return this.zoom.expr;
    }
    _compile(metadata) {
        super._compile(metadata);
        super.inlineMaker = inline => inline.zoom;
    }
    _preDraw(program, drawMetadata, gl) {
        this.zoom.expr = drawMetadata.zoom;
        this.zoom._preDraw(program, drawMetadata, gl);
    }
}


/***/ }),

/***/ "./src/core/viz/functions.js":
/*!***********************************!*\
  !*** ./src/core/viz/functions.js ***!
  \***********************************/
/*! exports provided: animate, array, nin, in, between, mul, div, add, sub, pow, mod, greaterThan, greaterThanOrEqualTo, lessThan, lessThanOrEqualTo, equals, notEquals, and, or, gt, gte, lt, lte, eq, neq, blend, buckets, cielab, clusterAvg, clusterMax, clusterMin, clusterMode, clusterSum, constant, sprite, hex, hsl, hsla, hsv, hsva, cubic, ilinear, linear, namedColor, near, now, number, opacity, asc, desc, noOrder, width, reverse, property, prop, viewportQuantiles, globalQuantiles, globalEqIntervals, viewportEqIntervals, ramp, rgb, rgba, category, time, date, top, fade, torque, log, sqrt, sin, cos, tan, sign, abs, isNaN, not, floor, ceil, sprites, variable, var, viewportAvg, viewportMax, viewportMin, viewportSum, viewportCount, viewportPercentile, viewportHistogram, globalAvg, globalMax, globalMin, globalSum, globalCount, globalPercentile, xyz, zoom, placement, HOLD, TRUE, FALSE, PI, E, ALIGN_CENTER, ALIGN_BOTTOM, palettes, Asc, Desc */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "animate", function() { return animate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "array", function() { return array; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "nin", function() { return nin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "in", function() { return in_; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "between", function() { return between; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mul", function() { return mul; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "div", function() { return div; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add", function() { return add; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sub", function() { return sub; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pow", function() { return pow; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mod", function() { return mod; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "greaterThan", function() { return greaterThan; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "greaterThanOrEqualTo", function() { return greaterThanOrEqualTo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lessThan", function() { return lessThan; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lessThanOrEqualTo", function() { return lessThanOrEqualTo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "equals", function() { return equals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "notEquals", function() { return notEquals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "and", function() { return and; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "or", function() { return or; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "gt", function() { return gt; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "gte", function() { return gte; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lt", function() { return lt; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lte", function() { return lte; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "eq", function() { return eq; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "neq", function() { return neq; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blend", function() { return blend; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "buckets", function() { return buckets; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cielab", function() { return cielab; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clusterAvg", function() { return clusterAvg; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clusterMax", function() { return clusterMax; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clusterMin", function() { return clusterMin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clusterMode", function() { return clusterMode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clusterSum", function() { return clusterSum; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "constant", function() { return constant; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sprite", function() { return sprite; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hex", function() { return hex; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hsl", function() { return hsl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hsla", function() { return hsla; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hsv", function() { return hsv; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hsva", function() { return hsva; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cubic", function() { return cubic; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ilinear", function() { return ilinear; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "linear", function() { return linear; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "namedColor", function() { return namedColor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "near", function() { return near; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "now", function() { return now; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "number", function() { return number; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "opacity", function() { return opacity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "asc", function() { return asc; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "desc", function() { return desc; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noOrder", function() { return noOrder; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "width", function() { return width; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reverse", function() { return reverse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "property", function() { return property; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "prop", function() { return property; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "viewportQuantiles", function() { return viewportQuantiles; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "globalQuantiles", function() { return globalQuantiles; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "globalEqIntervals", function() { return globalEqIntervals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "viewportEqIntervals", function() { return viewportEqIntervals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ramp", function() { return ramp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rgb", function() { return rgb; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rgba", function() { return rgba; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "category", function() { return category; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "time", function() { return time; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "date", function() { return time; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "top", function() { return top; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fade", function() { return fade; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "torque", function() { return torque; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "log", function() { return log; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sqrt", function() { return sqrt; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sin", function() { return sin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cos", function() { return cos; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tan", function() { return tan; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sign", function() { return sign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "abs", function() { return abs; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNaN", function() { return isNaN; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "not", function() { return not; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "floor", function() { return floor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ceil", function() { return ceil; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sprites", function() { return sprites; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "variable", function() { return variable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "var", function() { return variable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "viewportAvg", function() { return viewportAvg; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "viewportMax", function() { return viewportMax; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "viewportMin", function() { return viewportMin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "viewportSum", function() { return viewportSum; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "viewportCount", function() { return viewportCount; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "viewportPercentile", function() { return viewportPercentile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "viewportHistogram", function() { return viewportHistogram; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "globalAvg", function() { return globalAvg; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "globalMax", function() { return globalMax; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "globalMin", function() { return globalMin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "globalSum", function() { return globalSum; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "globalCount", function() { return globalCount; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "globalPercentile", function() { return globalPercentile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "xyz", function() { return xyz; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "zoom", function() { return zoom; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "placement", function() { return placement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HOLD", function() { return HOLD; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TRUE", function() { return TRUE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FALSE", function() { return FALSE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PI", function() { return PI; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "E", function() { return E; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ALIGN_CENTER", function() { return ALIGN_CENTER; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ALIGN_BOTTOM", function() { return ALIGN_BOTTOM; });
/* harmony import */ var _expressions_animate__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./expressions/animate */ "./src/core/viz/expressions/animate.js");
/* harmony import */ var _expressions_basic_array__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./expressions/basic/array */ "./src/core/viz/expressions/basic/array.js");
/* harmony import */ var _expressions_belongs_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./expressions/belongs.js */ "./src/core/viz/expressions/belongs.js");
/* harmony import */ var _expressions_between__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./expressions/between */ "./src/core/viz/expressions/between.js");
/* harmony import */ var _expressions_binary__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./expressions/binary */ "./src/core/viz/expressions/binary.js");
/* harmony import */ var _expressions_blend__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./expressions/blend */ "./src/core/viz/expressions/blend.js");
/* harmony import */ var _expressions_buckets__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./expressions/buckets */ "./src/core/viz/expressions/buckets.js");
/* harmony import */ var _expressions_basic_category__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./expressions/basic/category */ "./src/core/viz/expressions/basic/category.js");
/* harmony import */ var _expressions_color_CIELab__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./expressions/color/CIELab */ "./src/core/viz/expressions/color/CIELab.js");
/* harmony import */ var _expressions_aggregation_clusterAggregation__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./expressions/aggregation/clusterAggregation */ "./src/core/viz/expressions/aggregation/clusterAggregation.js");
/* harmony import */ var _expressions_basic_constant__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./expressions/basic/constant */ "./src/core/viz/expressions/basic/constant.js");
/* harmony import */ var _expressions_color_hex__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./expressions/color/hex */ "./src/core/viz/expressions/color/hex.js");
/* harmony import */ var _expressions_color_hsl__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./expressions/color/hsl */ "./src/core/viz/expressions/color/hsl.js");
/* harmony import */ var _expressions_color_hsv__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./expressions/color/hsv */ "./src/core/viz/expressions/color/hsv.js");
/* harmony import */ var _expressions_interpolators__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./expressions/interpolators */ "./src/core/viz/expressions/interpolators.js");
/* harmony import */ var _expressions_linear__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./expressions/linear */ "./src/core/viz/expressions/linear.js");
/* harmony import */ var _expressions_color_named_color__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./expressions/color/named-color */ "./src/core/viz/expressions/color/named-color.js");
/* harmony import */ var _expressions_near__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./expressions/near */ "./src/core/viz/expressions/near.js");
/* harmony import */ var _expressions_now__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./expressions/now */ "./src/core/viz/expressions/now.js");
/* harmony import */ var _expressions_basic_number__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./expressions/basic/number */ "./src/core/viz/expressions/basic/number.js");
/* harmony import */ var _expressions_color_opacity__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./expressions/color/opacity */ "./src/core/viz/expressions/color/opacity.js");
/* harmony import */ var _expressions_ordering__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./expressions/ordering */ "./src/core/viz/expressions/ordering.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Asc", function() { return _expressions_ordering__WEBPACK_IMPORTED_MODULE_21__["Asc"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Desc", function() { return _expressions_ordering__WEBPACK_IMPORTED_MODULE_21__["Desc"]; });

/* harmony import */ var _expressions_color_palettes__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./expressions/color/palettes */ "./src/core/viz/expressions/color/palettes.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "palettes", function() { return _expressions_color_palettes__WEBPACK_IMPORTED_MODULE_22__["palettes"]; });

/* harmony import */ var _expressions_basic_property__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./expressions/basic/property */ "./src/core/viz/expressions/basic/property.js");
/* harmony import */ var _expressions_classifier__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./expressions/classifier */ "./src/core/viz/expressions/classifier.js");
/* harmony import */ var _expressions_ramp__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./expressions/ramp */ "./src/core/viz/expressions/ramp.js");
/* harmony import */ var _expressions_color_rgb__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./expressions/color/rgb */ "./src/core/viz/expressions/color/rgb.js");
/* harmony import */ var _expressions_time__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./expressions/time */ "./src/core/viz/expressions/time.js");
/* harmony import */ var _expressions_top__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./expressions/top */ "./src/core/viz/expressions/top.js");
/* harmony import */ var _expressions_torque__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./expressions/torque */ "./src/core/viz/expressions/torque.js");
/* harmony import */ var _expressions_unary__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./expressions/unary */ "./src/core/viz/expressions/unary.js");
/* harmony import */ var _expressions_basic_variable__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./expressions/basic/variable */ "./src/core/viz/expressions/basic/variable.js");
/* harmony import */ var _expressions_aggregation_viewportAggregation__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./expressions/aggregation/viewportAggregation */ "./src/core/viz/expressions/aggregation/viewportAggregation.js");
/* harmony import */ var _expressions_aggregation_globalAggregation__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./expressions/aggregation/globalAggregation */ "./src/core/viz/expressions/aggregation/globalAggregation.js");
/* harmony import */ var _expressions_xyz__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./expressions/xyz */ "./src/core/viz/expressions/xyz.js");
/* harmony import */ var _expressions_zoom__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./expressions/zoom */ "./src/core/viz/expressions/zoom.js");
/* harmony import */ var _expressions_sprite__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./expressions/sprite */ "./src/core/viz/expressions/sprite.js");
/* harmony import */ var _expressions_placement__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./expressions/placement */ "./src/core/viz/expressions/placement.js");
/* harmony import */ var _expressions_sprites__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./expressions/sprites */ "./src/core/viz/expressions/sprites.js");
/**
 *  Expressions are used to define visualizations, a visualization (viz) is a set named properties and variables and its corresponding values: expressions.
 *  A viz has the following properties:
 *
 *  - **color**: fill color of points and polygons and color of lines
 *  - **strokeColor**: stroke/border color of points and polygons, not applicable to lines
 *  - **width**: fill diameter of points, thickness of lines, not applicable to polygons
 *  - **strokeWidth**: stroke width of points and polygons, not applicable to lines
 *  - **filter**: filter features by removing from rendering and interactivity all the features that don't pass the test
 *  - **symbol** - show a sprite instead in the place of points
 *  - **symbolPlacement** - when using `symbol`, offset to apply to the sprite
 *  - **resolution**: resolution of the property-aggregation functions, a value of 4 means to produce aggregation on grid cells of 4x4 pixels, only applicable to points
 *
 * For example the point diameter could be using the `add` expression:
 *
 * ```javascript
 * const viz = new carto.Viz({
 *   width: carto.expressions.add(5, 5)  // Equivalent to `width: 10`
 * });
 * ```
 *
 * You can use dataset properties inside expressions. Imagine we are representing cities in a map,
 * we can make the point width proportional to the population using the `property`/`prop` expression.
 *
 * ```javascript
 * const viz = new carto.Viz({
 *   width: carto.expressions.prop('population')
 * });
 * ```
 *
 * Multiple expressions can be combined to form more powerful ones,
 * for example lets divide the population between a number using the `div` expression to make points smaller:
 *
 * ```javascript
 * const s = carto.expressions; // We use this alias along documentation.
 * const viz = new carto.Viz({
 *   width: s.div(
 *     s.prop('population'),
 *     10000
 *  )
 * });
 * ```
 *
 * All these expressions can be used also in a String API form. This API is a more compact way to create and use expressions.
 * It has shortcut notation to access your feature properties using the `$` symbol. It also allows inline comments using the JavaScript syntax.
 *
 * ```javascript
 * const viz = new carto.Viz(`
 *   width: $population / 10000  // Size proportional to the population for each feature
 * `);
 * ```
 *
 * Although the combination of expressions is very powerful, you must be aware of the different types to produce valid combinations.
 * For example, the previous example is valid since we assumed that 'population' is a numeric property, it won't be valid if
 * it was a categorical property. Each expression defines some restrictions regarding their parameters, particularly, the
 * type of their parameters.
 *
 * The most important types are:
 *  - **Number** expression. Expressions that contains numbers, both integers and floating point numbers. Boolean types are emulated by this type, being 0 false, and 1 true.
 *  - **Category** expression. Expressions that contains categories. Categories can have a limited set of values, like the country or the region of a feature.
 *  - **Color** expression. Expressions that contains colors. An alpha or transparency channel is included in this type.
 *
 * @namespace carto.expressions
 * @api
 */


/**
 * Type of Numeric Expressions.
 *
 * Associated to expressions that return is an integer or float. When these expressions are evaluated it should return a JavaScript number.
 *
 * JavaScript numbers are automatically converted to Numeric Expressions.
 *
 * @typedef {} Number
 * @api
 */

/**
 * Type of Category Expressions.
 *
 * Associated to expressions that return is a category string. When these expressions are evaluated it should return a JavaScript string.
 *
 * JavaScript strings are automatically converted to Category Expressions.
 *
 * @typedef {} Category
 * @api
 */

/**
 * Type of Color Expressions.
 *
 * Associated to expressions that return a color. When these expressions are evaluated it should return a RGBA object like:
 *
 * ```
 * { r: 255, g: 255, b: 255, a: 1.0 }
 * ```
 *
 * @typedef {} Color
 * @api
 */

/**
 * Type of Date Expressions.
 *
 * @typedef {} Date
 * @api
 */

/**
 * Type of Fade Expressions.
 *
 * @typedef {} Fade
 * @api
 */

/**
 * Type of Palette Expressions.
 *
 * More information in {@link carto.expressions.palettes|carto.expressions.palettes}.
 *
 * @typedef {} Palette
 * @api
 */
















































































































/* Expose classes as constructor functions */

const animate = (...args) => new _expressions_animate__WEBPACK_IMPORTED_MODULE_0__["default"](...args);

const array = (...args) => new _expressions_basic_array__WEBPACK_IMPORTED_MODULE_1__["default"](...args);

const in_ = (...args) => new _expressions_belongs_js__WEBPACK_IMPORTED_MODULE_2__["In"](...args);
const nin = (...args) => new _expressions_belongs_js__WEBPACK_IMPORTED_MODULE_2__["Nin"](...args);


const between = (...args) => new _expressions_between__WEBPACK_IMPORTED_MODULE_3__["default"](...args);

const mul = (...args) => new _expressions_binary__WEBPACK_IMPORTED_MODULE_4__["Mul"](...args);
const div = (...args) => new _expressions_binary__WEBPACK_IMPORTED_MODULE_4__["Div"](...args);
const add = (...args) => new _expressions_binary__WEBPACK_IMPORTED_MODULE_4__["Add"](...args);
const sub = (...args) => new _expressions_binary__WEBPACK_IMPORTED_MODULE_4__["Sub"](...args);
const pow = (...args) => new _expressions_binary__WEBPACK_IMPORTED_MODULE_4__["Pow"](...args);
const mod = (...args) => new _expressions_binary__WEBPACK_IMPORTED_MODULE_4__["Mod"](...args);
const greaterThan = (...args) => new _expressions_binary__WEBPACK_IMPORTED_MODULE_4__["GreaterThan"](...args);
const greaterThanOrEqualTo = (...args) => new _expressions_binary__WEBPACK_IMPORTED_MODULE_4__["GreaterThanOrEqualTo"](...args);
const lessThan = (...args) => new _expressions_binary__WEBPACK_IMPORTED_MODULE_4__["LessThan"](...args);
const lessThanOrEqualTo = (...args) => new _expressions_binary__WEBPACK_IMPORTED_MODULE_4__["LessThanOrEqualTo"](...args);
const equals = (...args) => new _expressions_binary__WEBPACK_IMPORTED_MODULE_4__["Equals"](...args);
const notEquals = (...args) => new _expressions_binary__WEBPACK_IMPORTED_MODULE_4__["NotEquals"](...args);
const and = (...args) => new _expressions_binary__WEBPACK_IMPORTED_MODULE_4__["And"](...args);
const or = (...args) => new _expressions_binary__WEBPACK_IMPORTED_MODULE_4__["Or"](...args);
const gt = greaterThan;
const gte = greaterThanOrEqualTo;
const lt = lessThan;
const lte = lessThanOrEqualTo;
const eq = equals;
const neq = notEquals;

const blend = (...args) => new _expressions_blend__WEBPACK_IMPORTED_MODULE_5__["default"](...args);

const buckets = (...args) => new _expressions_buckets__WEBPACK_IMPORTED_MODULE_6__["default"](...args);

const cielab = (...args) => new _expressions_color_CIELab__WEBPACK_IMPORTED_MODULE_8__["default"](...args);

const clusterAvg = (...args) => new _expressions_aggregation_clusterAggregation__WEBPACK_IMPORTED_MODULE_9__["ClusterAvg"](...args);
const clusterMax = (...args) => new _expressions_aggregation_clusterAggregation__WEBPACK_IMPORTED_MODULE_9__["ClusterMax"](...args);
const clusterMin = (...args) => new _expressions_aggregation_clusterAggregation__WEBPACK_IMPORTED_MODULE_9__["ClusterMin"](...args);
const clusterMode = (...args) => new _expressions_aggregation_clusterAggregation__WEBPACK_IMPORTED_MODULE_9__["ClusterMode"](...args);
const clusterSum = (...args) => new _expressions_aggregation_clusterAggregation__WEBPACK_IMPORTED_MODULE_9__["ClusterSum"](...args);

const constant = (...args) => new _expressions_basic_constant__WEBPACK_IMPORTED_MODULE_10__["default"](...args);
const sprite = (...args) => new _expressions_sprite__WEBPACK_IMPORTED_MODULE_36__["default"](...args);

const hex = (...args) => new _expressions_color_hex__WEBPACK_IMPORTED_MODULE_11__["default"](...args);

const hsl = (...args) => new _expressions_color_hsl__WEBPACK_IMPORTED_MODULE_12__["HSL"](...args);
const hsla = (...args) => new _expressions_color_hsl__WEBPACK_IMPORTED_MODULE_12__["HSLA"](...args);

const hsv = (...args) => new _expressions_color_hsv__WEBPACK_IMPORTED_MODULE_13__["HSV"](...args);
const hsva = (...args) => new _expressions_color_hsv__WEBPACK_IMPORTED_MODULE_13__["HSVA"](...args);

const cubic = (...args) => new _expressions_interpolators__WEBPACK_IMPORTED_MODULE_14__["Cubic"](...args);
const ilinear = (...args) => new _expressions_interpolators__WEBPACK_IMPORTED_MODULE_14__["ILinear"](...args);

const linear = (...args) => new _expressions_linear__WEBPACK_IMPORTED_MODULE_15__["default"](...args);

const namedColor = (...args) => new _expressions_color_named_color__WEBPACK_IMPORTED_MODULE_16__["NamedColor"](...args);

const near = (...args) => new _expressions_near__WEBPACK_IMPORTED_MODULE_17__["default"](...args);

const now = (...args) => new _expressions_now__WEBPACK_IMPORTED_MODULE_18__["default"](...args);

const number = (...args) => new _expressions_basic_number__WEBPACK_IMPORTED_MODULE_19__["default"](...args);

const opacity = (...args) => new _expressions_color_opacity__WEBPACK_IMPORTED_MODULE_20__["default"](...args);

const asc = (...args) => new _expressions_ordering__WEBPACK_IMPORTED_MODULE_21__["Asc"](...args);
const desc = (...args) => new _expressions_ordering__WEBPACK_IMPORTED_MODULE_21__["Desc"](...args);
const noOrder = (...args) => new _expressions_ordering__WEBPACK_IMPORTED_MODULE_21__["NoOrder"](...args);
const width = (...args) => new _expressions_ordering__WEBPACK_IMPORTED_MODULE_21__["Width"](...args);

const reverse = (...args) => new _expressions_color_palettes__WEBPACK_IMPORTED_MODULE_22__["Reverse"](...args);

const property = (...args) => new _expressions_basic_property__WEBPACK_IMPORTED_MODULE_23__["default"](...args);


const viewportQuantiles = (...args) => new _expressions_classifier__WEBPACK_IMPORTED_MODULE_24__["ViewportQuantiles"](...args);
const globalQuantiles = (...args) => new _expressions_classifier__WEBPACK_IMPORTED_MODULE_24__["GlobalQuantiles"](...args);
const globalEqIntervals = (...args) => new _expressions_classifier__WEBPACK_IMPORTED_MODULE_24__["GlobalEqIntervals"](...args);
const viewportEqIntervals = (...args) => new _expressions_classifier__WEBPACK_IMPORTED_MODULE_24__["ViewportEqIntervals"](...args);

const ramp = (...args) => new _expressions_ramp__WEBPACK_IMPORTED_MODULE_25__["default"](...args);

const rgb = (...args) => new _expressions_color_rgb__WEBPACK_IMPORTED_MODULE_26__["RGB"](...args);
const rgba = (...args) => new _expressions_color_rgb__WEBPACK_IMPORTED_MODULE_26__["RGBA"](...args);

const category = (...args) => new _expressions_basic_category__WEBPACK_IMPORTED_MODULE_7__["default"](...args);

const time = (...args) => new _expressions_time__WEBPACK_IMPORTED_MODULE_27__["default"](...args);


const top = (...args) => new _expressions_top__WEBPACK_IMPORTED_MODULE_28__["default"](...args);

const fade = (...args) => new _expressions_torque__WEBPACK_IMPORTED_MODULE_29__["Fade"](...args);
const torque = (...args) => new _expressions_torque__WEBPACK_IMPORTED_MODULE_29__["Torque"](...args);

const log = (...args) => new _expressions_unary__WEBPACK_IMPORTED_MODULE_30__["Log"](...args);
const sqrt = (...args) => new _expressions_unary__WEBPACK_IMPORTED_MODULE_30__["Sqrt"](...args);
const sin = (...args) => new _expressions_unary__WEBPACK_IMPORTED_MODULE_30__["Sin"](...args);
const cos = (...args) => new _expressions_unary__WEBPACK_IMPORTED_MODULE_30__["Cos"](...args);
const tan = (...args) => new _expressions_unary__WEBPACK_IMPORTED_MODULE_30__["Tan"](...args);
const sign = (...args) => new _expressions_unary__WEBPACK_IMPORTED_MODULE_30__["Sign"](...args);
const abs = (...args) => new _expressions_unary__WEBPACK_IMPORTED_MODULE_30__["Abs"](...args);
const isNaN = (...args) => new _expressions_unary__WEBPACK_IMPORTED_MODULE_30__["IsNaN"](...args);
const not = (...args) => new _expressions_unary__WEBPACK_IMPORTED_MODULE_30__["Not"](...args);
const floor = (...args) => new _expressions_unary__WEBPACK_IMPORTED_MODULE_30__["Floor"](...args);
const ceil = (...args) => new _expressions_unary__WEBPACK_IMPORTED_MODULE_30__["Ceil"](...args);
const sprites = (...args) => new _expressions_sprites__WEBPACK_IMPORTED_MODULE_38__["default"](...args);

const variable = (...args) => new _expressions_basic_variable__WEBPACK_IMPORTED_MODULE_31__["default"](...args);


const viewportAvg = (...args) => new _expressions_aggregation_viewportAggregation__WEBPACK_IMPORTED_MODULE_32__["ViewportAvg"](...args);
const viewportMax = (...args) => new _expressions_aggregation_viewportAggregation__WEBPACK_IMPORTED_MODULE_32__["ViewportMax"](...args);
const viewportMin = (...args) => new _expressions_aggregation_viewportAggregation__WEBPACK_IMPORTED_MODULE_32__["ViewportMin"](...args);
const viewportSum = (...args) => new _expressions_aggregation_viewportAggregation__WEBPACK_IMPORTED_MODULE_32__["ViewportSum"](...args);
const viewportCount = (...args) => new _expressions_aggregation_viewportAggregation__WEBPACK_IMPORTED_MODULE_32__["ViewportCount"](...args);
const viewportPercentile = (...args) => new _expressions_aggregation_viewportAggregation__WEBPACK_IMPORTED_MODULE_32__["ViewportPercentile"](...args);
const viewportHistogram = (...args) => new _expressions_aggregation_viewportAggregation__WEBPACK_IMPORTED_MODULE_32__["ViewportHistogram"](...args);
const globalAvg = (...args) => new _expressions_aggregation_globalAggregation__WEBPACK_IMPORTED_MODULE_33__["GlobalAvg"](...args);
const globalMax = (...args) => new _expressions_aggregation_globalAggregation__WEBPACK_IMPORTED_MODULE_33__["GlobalMax"](...args);
const globalMin = (...args) => new _expressions_aggregation_globalAggregation__WEBPACK_IMPORTED_MODULE_33__["GlobalMin"](...args);
const globalSum = (...args) => new _expressions_aggregation_globalAggregation__WEBPACK_IMPORTED_MODULE_33__["GlobalSum"](...args);
const globalCount = (...args) => new _expressions_aggregation_globalAggregation__WEBPACK_IMPORTED_MODULE_33__["GlobalCount"](...args);
const globalPercentile = (...args) => new _expressions_aggregation_globalAggregation__WEBPACK_IMPORTED_MODULE_33__["GlobalPercentile"](...args);

const xyz = (...args) => new _expressions_xyz__WEBPACK_IMPORTED_MODULE_34__["default"](...args);

const zoom = (...args) => new _expressions_zoom__WEBPACK_IMPORTED_MODULE_35__["default"](...args);
const placement = (...args) => new _expressions_placement__WEBPACK_IMPORTED_MODULE_37__["default"](...args);

const HOLD = new _expressions_basic_constant__WEBPACK_IMPORTED_MODULE_10__["default"](Number.MAX_SAFE_INTEGER);
const TRUE = new _expressions_basic_constant__WEBPACK_IMPORTED_MODULE_10__["default"](1);
const FALSE = new _expressions_basic_constant__WEBPACK_IMPORTED_MODULE_10__["default"](0);
const PI = new _expressions_basic_constant__WEBPACK_IMPORTED_MODULE_10__["default"](Math.PI);
const E = new _expressions_basic_constant__WEBPACK_IMPORTED_MODULE_10__["default"](Math.E);

const ALIGN_CENTER = new _expressions_placement__WEBPACK_IMPORTED_MODULE_37__["default"](constant(0), constant(0));
const ALIGN_BOTTOM = new _expressions_placement__WEBPACK_IMPORTED_MODULE_37__["default"](constant(0), constant(1));




/***/ }),

/***/ "./src/core/viz/parser.js":
/*!********************************!*\
  !*** ./src/core/viz/parser.js ***!
  \********************************/
/*! exports provided: parseVizExpression, parseVizDefinition, cleanComments */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseVizExpression", function() { return parseVizExpression; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseVizDefinition", function() { return parseVizDefinition; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cleanComments", function() { return cleanComments; });
/* harmony import */ var jsep__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jsep */ "./node_modules/jsep/build/jsep.js");
/* harmony import */ var jsep__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jsep__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./functions */ "./src/core/viz/functions.js");
/* harmony import */ var _expressions_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./expressions/utils */ "./src/core/viz/expressions/utils.js");
/* harmony import */ var _expressions_color_named_color__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./expressions/color/named-color */ "./src/core/viz/expressions/color/named-color.js");
/* harmony import */ var _expressions_color_hex__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./expressions/color/hex */ "./src/core/viz/expressions/color/hex.js");







// TODO use Schema classes

const aggFns = [];

const lowerCaseFunctions = {};
Object.keys(_functions__WEBPACK_IMPORTED_MODULE_1__)
    .filter(name => name[0] == name[0].toLowerCase()) // Only get functions starting with lowercase
    .map(name => { lowerCaseFunctions[name.toLocaleLowerCase()] = _functions__WEBPACK_IMPORTED_MODULE_1__[name]; });
lowerCaseFunctions.true = _functions__WEBPACK_IMPORTED_MODULE_1__["TRUE"];
lowerCaseFunctions.false = _functions__WEBPACK_IMPORTED_MODULE_1__["FALSE"];
lowerCaseFunctions.align_center = _functions__WEBPACK_IMPORTED_MODULE_1__["ALIGN_CENTER"];
lowerCaseFunctions.align_bottom = _functions__WEBPACK_IMPORTED_MODULE_1__["ALIGN_BOTTOM"];
lowerCaseFunctions.pi = _functions__WEBPACK_IMPORTED_MODULE_1__["PI"];
lowerCaseFunctions.e = _functions__WEBPACK_IMPORTED_MODULE_1__["E"];
lowerCaseFunctions.hold = _functions__WEBPACK_IMPORTED_MODULE_1__["HOLD"];

function parseVizExpression(str) {
    prepareJsep();
    const r = Object(_expressions_utils__WEBPACK_IMPORTED_MODULE_2__["implicitCast"])(parseNode(jsep__WEBPACK_IMPORTED_MODULE_0___default()(str)));
    cleanJsep();
    return r;
}

function parseVizDefinition(str) {
    prepareJsep();
    const ast = jsep__WEBPACK_IMPORTED_MODULE_0___default()(cleanComments(str));
    let vizSpec = { variables: {} };
    if (ast.type == 'Compound') {
        ast.body.map(node => parseVizNamedExpr(vizSpec, node));
    } else {
        parseVizNamedExpr(vizSpec, ast);
    }
    cleanJsep();
    return vizSpec;
}

function parseVizNamedExpr(vizSpec, node) {
    if (node.operator != ':') {
        throw new Error('Invalid syntax');
    }
    if (node.left.name.length && node.left.name[0] == '@') {
        node.left.name = '__cartovl_variable_' + node.left.name.substr(1);
    }
    const name = node.left.name;
    if (!name) {
        throw new Error('Invalid syntax');
    }
    if (name.startsWith('__cartovl_variable_')) {
        vizSpec.variables[node.left.name.substr('__cartovl_variable_'.length)] = Object(_expressions_utils__WEBPACK_IMPORTED_MODULE_2__["implicitCast"])(parseNode(node.right));
    } else if (name == 'resolution') {
        const value = parseNode(node.right);
        vizSpec[name] = value;
    } else {
        const value = parseNode(node.right);
        vizSpec[name] = Object(_expressions_utils__WEBPACK_IMPORTED_MODULE_2__["implicitCast"])(value);
    }

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
            return _functions__WEBPACK_IMPORTED_MODULE_1__["mul"](left, right);
        case '/':
            return _functions__WEBPACK_IMPORTED_MODULE_1__["div"](left, right);
        case '+':
            return _functions__WEBPACK_IMPORTED_MODULE_1__["add"](left, right);
        case '-':
            return _functions__WEBPACK_IMPORTED_MODULE_1__["sub"](left, right);
        case '%':
            return _functions__WEBPACK_IMPORTED_MODULE_1__["mod"](left, right);
        case '^':
            return _functions__WEBPACK_IMPORTED_MODULE_1__["pow"](left, right);
        case '>':
            return _functions__WEBPACK_IMPORTED_MODULE_1__["greaterThan"](left, right);
        case '>=':
            return _functions__WEBPACK_IMPORTED_MODULE_1__["greaterThanOrEqualTo"](left, right);
        case '<':
            return _functions__WEBPACK_IMPORTED_MODULE_1__["lessThan"](left, right);
        case '<=':
            return _functions__WEBPACK_IMPORTED_MODULE_1__["lessThanOrEqualTo"](left, right);
        case '==':
            return _functions__WEBPACK_IMPORTED_MODULE_1__["equals"](left, right);
        case '!=':
            return _functions__WEBPACK_IMPORTED_MODULE_1__["notEquals"](left, right);
        case 'and':
            return _functions__WEBPACK_IMPORTED_MODULE_1__["and"](left, right);
        case 'or':
            return _functions__WEBPACK_IMPORTED_MODULE_1__["or"](left, right);
        default:
            throw new Error(`Invalid binary operator '${node.operator}'`);
    }
}

function parseUnaryOperation(node) {
    switch (node.operator) {
        case '-':
            return _functions__WEBPACK_IMPORTED_MODULE_1__["mul"](-1, parseNode(node.argument));
        case '+':
            return parseNode(node.argument);
        default:
            throw new Error(`Invalid unary operator '${node.operator}'`);
    }
}

function parseIdentifier(node) {
    if (node.name.length && node.name[0] == '@') {
        node.name = '__cartovl_variable_' + node.name.substr(1);
    }
    if (node.name.startsWith('__cartovl_variable_')) {
        return _functions__WEBPACK_IMPORTED_MODULE_1__["variable"](node.name.substr('__cartovl_variable_'.length));
    } else if (node.name[0] == '#') {
        return new _expressions_color_hex__WEBPACK_IMPORTED_MODULE_4__["default"](node.name);
    } else if (node.name[0] == '$') {
        return _functions__WEBPACK_IMPORTED_MODULE_1__["property"](node.name.substring(1));
    } else if (_functions__WEBPACK_IMPORTED_MODULE_1__["palettes"][node.name.toUpperCase()]) {
        return _functions__WEBPACK_IMPORTED_MODULE_1__["palettes"][node.name.toUpperCase()];
    } else if (lowerCaseFunctions[node.name.toLowerCase()]) {
        return lowerCaseFunctions[node.name.toLowerCase()];
    } else if (_expressions_color_named_color__WEBPACK_IMPORTED_MODULE_3__["CSS_COLOR_NAMES"].includes(node.name.toLowerCase())) {
        return new _expressions_color_named_color__WEBPACK_IMPORTED_MODULE_3__["NamedColor"](node.name.toLowerCase());
    } else {
        throw new Error(`Invalid expression '${JSON.stringify(node)}'`);
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

function prepareJsep() {
    // jsep addBinaryOp pollutes its module scope, we need to remove the custom operators afterwards
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.addBinaryOp(':', 0);
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.addBinaryOp('^', 11);
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.addBinaryOp('or', 1);
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.addBinaryOp('and', 2);
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.addIdentifierChar('@');
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.addIdentifierChar('#');
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.removeLiteral('true');
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.removeLiteral('false');
}

function cleanJsep() {
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.removeBinaryOp('and');
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.removeBinaryOp('or');
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.removeBinaryOp('^');
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.removeBinaryOp(':');
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.removeIdentifierChar('@');
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.removeIdentifierChar('#');
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.addLiteral('true');
    jsep__WEBPACK_IMPORTED_MODULE_0___default.a.addLiteral('false');
}

/**
 * Remove comments from string
 * - // line comments
 * - /* block comments
 * - Keep comments inside single and double quotes tracking escape chars
 * Based on: https://j11y.io/javascript/removing-comments-in-javascript/
 */
function cleanComments(str) {
    const mode = {
        singleQuote: false,
        doubleQuote: false,
        blockComment: false,
        lineComment: false,
        escape: 0
    };

    // Adding chars to avoid index checking
    str = ('_' + str + '_').split('');

    for (let i = 0, l = str.length; i < l; i++) {

        if (mode.singleQuote) {
            if (str[i] == '\\') {
                mode.escape++;
            } else if (str[i] === '\'' && mode.escape % 2 == 0) {
                mode.singleQuote = false;
                mode.escape = 0;
            }
            continue;
        }

        if (mode.doubleQuote) {
            if (str[i] == '\\') {
                mode.escape++;
            } else if (str[i] === '"' && mode.escape % 2 == 0) {
                mode.doubleQuote = false;
                mode.escape = 0;
            }
            continue;
        }

        if (mode.blockComment) {
            if (str[i] === '*' && str[i + 1] === '/') {
                str[i + 1] = '';
                mode.blockComment = false;
            }
            str[i] = '';
            continue;
        }

        if (mode.lineComment) {
            if (str[i + 1] === '\n' || str[i + 1] === '\r') {
                mode.lineComment = false;
            }
            if (i + 1 < l) {
                str[i] = '';
            }
            continue;
        }

        mode.doubleQuote = str[i] === '"';
        mode.singleQuote = str[i] === '\'';

        if (str[i] === '/') {

            if (str[i + 1] === '*') {
                str[i] = '';
                mode.blockComment = true;
                continue;
            }
            if (str[i + 1] === '/') {
                str[i] = '';
                mode.lineComment = true;
                continue;
            }
        }
    }

    // Remove chars added before
    return str.join('').slice(1, -1);
}


/***/ }),

/***/ "./src/core/viz/shader-compiler.js":
/*!*****************************************!*\
  !*** ./src/core/viz/shader-compiler.js ***!
  \*****************************************/
/*! exports provided: compileShader */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "compileShader", function() { return compileShader; });
/* harmony import */ var _shaders__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shaders */ "./src/core/shaders/index.js");


class IDGenerator {
    constructor() {
        this._ids = new Map();
    }
    getID(expression) {
        if (this._ids.has(expression)) {
            return this._ids.get(expression);
        }
        const id = this._ids.size;
        this._ids.set(expression, id);
        return id;
    }
}

function compileShader(gl, template, expressions) {
    let tid = {};
    const getPropertyAccessCode = name => {
        if (tid[name] === undefined) {
            tid[name] = Object.keys(tid).length;
        }
        return `texture2D(propertyTex${tid[name]}, featureID).a`;
    };
    let codes = {};
    const idGen = new IDGenerator();
    Object.keys(expressions).forEach(exprName => {
        const expr = expressions[exprName];
        expr._setUID(idGen);
        const exprCodes = expr._applyToShaderSource(getPropertyAccessCode);
        codes[exprName + '_preface'] = exprCodes.preface;
        codes[exprName + '_inline'] = exprCodes.inline;
    });
    codes.propertyPreface = Object.keys(tid).map(name => `uniform sampler2D propertyTex${tid[name]};`).join('\n');

    const shader = Object(_shaders__WEBPACK_IMPORTED_MODULE_0__["createShaderFromTemplate"])(gl, template, codes);
    Object.keys(tid).map(name => {
        tid[name] = gl.getUniformLocation(shader.program, `propertyTex${tid[name]}`);
    });
    Object.values(expressions).forEach(expr => {
        expr._postShaderCompile(shader.program, gl);
    });

    shader.tid = tid;
    return shader;
}


/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: setDefaultAuth, setDefaultConfig, source, expressions, Layer, Viz, Map, Interactivity, version */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "source", function() { return source; });
/* harmony import */ var _core_viz_functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/viz/functions */ "./src/core/viz/functions.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "expressions", function() { return _core_viz_functions__WEBPACK_IMPORTED_MODULE_0__; });
/* harmony import */ var _api_source_geojson__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./api/source/geojson */ "./src/api/source/geojson.js");
/* harmony import */ var _api_source_dataset__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./api/source/dataset */ "./src/api/source/dataset.js");
/* harmony import */ var _api_source_sql__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./api/source/sql */ "./src/api/source/sql.js");
/* harmony import */ var _api_layer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./api/layer */ "./src/api/layer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Layer", function() { return _api_layer__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _api_viz__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./api/viz */ "./src/api/viz.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Viz", function() { return _api_viz__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _api_setup_auth_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./api/setup/auth-service */ "./src/api/setup/auth-service.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setDefaultAuth", function() { return _api_setup_auth_service__WEBPACK_IMPORTED_MODULE_6__["setDefaultAuth"]; });

/* harmony import */ var _api_setup_config_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./api/setup/config-service */ "./src/api/setup/config-service.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setDefaultConfig", function() { return _api_setup_config_service__WEBPACK_IMPORTED_MODULE_7__["setDefaultConfig"]; });

/* harmony import */ var _api_map__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./api/map */ "./src/api/map.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Map", function() { return _api_map__WEBPACK_IMPORTED_MODULE_8__["default"]; });

/* harmony import */ var _api_interactivity__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./api/interactivity */ "./src/api/interactivity.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Interactivity", function() { return _api_interactivity__WEBPACK_IMPORTED_MODULE_9__["default"]; });

/* harmony import */ var _package__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../package */ "./package.json");
var _package__WEBPACK_IMPORTED_MODULE_10___namespace = /*#__PURE__*/__webpack_require__.t(/*! ../package */ "./package.json", 1);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "version", function() { return _package__WEBPACK_IMPORTED_MODULE_10__["version"]; });

/**
 *  @api
 *  @namespace carto
 *
 *  @description
 *  The CARTO VL functionality is exposed through the **carto** namespace including:
 *
 * - {@link carto.source.Dataset|carto.source.Dataset}
 * - {@link carto.source.SQL|carto.source.SQL}
 * - {@link carto.source.GeoJSON|carto.source.GeoJSON}
 * - {@link carto.expressions|carto.expressions}
 * - {@link carto.Layer|carto.Layer}
 * - {@link carto.Viz|carto.Viz}
 * - {@link carto.Interactivity|carto.Interactivity}
 * - {@link carto.setDefaultAuth|carto.setDefaultAuth}
 * - {@link carto.setDefaultConfig|carto.setDefaultConfig}
 */













// Namespaces

const source = { Dataset: _api_source_dataset__WEBPACK_IMPORTED_MODULE_2__["default"], SQL: _api_source_sql__WEBPACK_IMPORTED_MODULE_3__["default"], GeoJSON: _api_source_geojson__WEBPACK_IMPORTED_MODULE_1__["default"] };




/***/ }),

/***/ "./src/utils/geometry.js":
/*!*******************************!*\
  !*** ./src/utils/geometry.js ***!
  \*******************************/
/*! exports provided: intersect, sub, dot, perpendicular, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "intersect", function() { return intersect; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sub", function() { return sub; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dot", function() { return dot; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "perpendicular", function() { return perpendicular; });
//If AB intersects CD => return intersection point
// Intersection method from Real Time Rendering, Third Edition, page 780
function intersect(a, b, c, d) {
    const o1 = a;
    const o2 = c;
    const d1 = sub(b, a);
    const d2 = sub(d, c);
    const d1t = perpendicular(d1);
    const d2t = perpendicular(d2);

    const s = dot(sub(o2, o1), d2t) / dot(d1, d2t);
    const t = dot(sub(o1, o2), d1t) / dot(d2, d1t);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        return [o1[0] + s * d1[0], o1[1] + s * d1[1]];
    }
}


function sub([ax, ay], [bx, by]) {
    return ([ax - bx, ay - by]);
}

function dot([ax, ay], [bx, by]) {
    return (ax * bx + ay * by);
}

function perpendicular([x, y]) {
    return [-y, x];
}

/* harmony default export */ __webpack_exports__["default"] = ({
    intersect,
    sub,
    dot,
    perpendicular
});


/***/ })

/******/ });
});
//# sourceMappingURL=carto-vl.js.map