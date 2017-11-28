import * as cartocolor from 'cartocolor';
import * as schema from '../schema';

function implicitCast(value) {
    if (Number.isFinite(value)) {
        return float(value);
    }
    return value;
}
var gl = null;
function setGL(_gl) {
    gl = _gl;
}
export {
    Property, Blend, Now, Near, Color, Float, RampColor, FloatMul, FloatDiv, FloatAdd, FloatSub, FloatPow, Log, Sqrt, Sin, Cos, Tan, Sign, SetOpacity, HSV,
    property, blend, now, near, color, float, rampColor, floatMul, floatDiv, floatAdd, floatSub, floatPow, log, sqrt, sin, cos, tan, sign, setOpacity, hsv,
    setGL
};

const schemas = {};
Object.keys(cartocolor).map(name => {
    const s = cartocolor[name];
    var defaultFound = false;
    for (let i = 20; i >= 0; i--) {
        if (s[i]) {
            if (!defaultFound) {
                schemas[name.toLowerCase()] = () => s[i];
                defaultFound = true;
            }
            schemas[`${name.toLowerCase()}_${i}`] = () => s[i];
        }
    }
});
export { schemas };

/*
    Each styling function should:
        - Create their own objects, i.e.: be used without "new"
        - Check input validity on user input (constructor and exposed functions).
        - Have certain functions that never fail:
            - _applyToShaderSource should use uniformIDMaker and propertyTIDMaker to get unique uniform IDs and property IDs as needed
            - _postShaderCompile should get uniform location after program compilation as needed
            - _preDraw should set any program's uniforms as needed
            - isAnimated should return true if the function output could change depending on the timestamp
        - Have a type property declaring the GLSL output type: 'float', 'color'
*/

/*
    TODO
        - Integrated color palettes
        - Type checking for color palettes
        - Allow multiplication, division and pow() to color expressions and color literals
        - Add SetOpacity(colorExpr, opacityFloatOverride)
        - HSV
        - Think about uniform-only types / parameters
        - Think about "Date" and "string" types.
        - Heatmaps (renderer should be improved too to accommodate this)
*/


function property(name, schema) {
    return new Property(name, schema);
}
function Property(name, schema) {
    if (typeof name !== 'string' || name == '') {
        throw new Error(`Invalid property name '${name}'`);
    }
    if (!schema[name]) {
        throw new Error(`Property name not found`);
    }
    this.name = name;
    this.type = 'float';
    this.schema = schema;
}
Property.prototype._applyToShaderSource = function (uniformIDMaker, propertyTIDMaker) {
    return {
        preface: '',
        inline: `p${propertyTIDMaker(this.name)}`
    };
}
Property.prototype._postShaderCompile = function (program) {
}
Property.prototype._preDraw = function () {
}
Property.prototype.isAnimated = function () {
    return false;
}

function now(speed) {
    return new Now(speed);
}
function Now(speed) {
    if (speed == undefined) {
        speed = 1;
    }
    if (!Number.isFinite(Number(speed))) {
        throw new Error('Now() only accepts number literals');
    }
    this.speed = Number(speed);
    this.type = 'float';
    this.float = float(0);
    this.init = Date.now();
}
Now.prototype._applyToShaderSource = function (uniformIDMaker) {
    return this.float._applyToShaderSource(uniformIDMaker);
}
Now.prototype._postShaderCompile = function (program) {
    return this.float._postShaderCompile(program);
}
Now.prototype._preDraw = function () {
    this.float.expr = ((Date.now() - this.init) * this.speed / 1000.);
    this.float._preDraw();
}
Now.prototype.isAnimated = function () {
    return true;
}

//WIP, other classes should extend this
const genExpr = (childrenNames, glslMaker) => class Expression {
    _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
        //apply children
        //append prefaces (child+this)
        //gen inline by glsl(childInlines);
    }
    _postShaderCompile(program) {
        //apply to children
    }
    _preDraw(l) {
        //apply to children
    }
    isAnimated() {
        //get from children
    }
    replaceChild(toReplace, replacer) {
        //Check this[childName] to find
    }
    blendTo(finalValue, duration = 500, blendFunc = 'linear') {
        genericBlend(this, finalValue, duration, blendFunc);
    }
}


class HSV {
    constructor(h, s, v) {
        h = implicitCast(h);
        s = implicitCast(s);
        v = implicitCast(v);

        if (h.type != 'float' || s.type != 'float' || v.type != 'float') {
            console.warn(h, s, v);
            throw new Error(`SetOpacity cannot be performed between `);
        }
        this.type = 'color';
        this.h = h;
        this.s = s;
        this.v = v;
        h.parent = this;
        s.parent = this;
        v.parent = this;
    }
    _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
        const h = this.h._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
        const s = this.s._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
        const v = this.v._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
        return {
            preface: h.preface + s.preface + v.preface +
                `
                #ifndef HSV2RGB
                #define HSV2RGB
                vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
              }
              #endif
              `,
            inline: `vec4(hsv2rgb(vec3(${h.inline}, clamp(${s.inline}, 0.,1.), clamp(${v.inline}, 0.,1.))), 1)`
        };
    }
    _postShaderCompile(program) {
        this.h._postShaderCompile(program);
        this.s._postShaderCompile(program);
        this.v._postShaderCompile(program);
    }
    _preDraw(l) {
        this.h._preDraw(l);
        this.s._preDraw(l);
        this.v._preDraw(l);
    }
    isAnimated() {
        return this.h.isAnimated() || this.s.isAnimated() || this.v.isAnimated();
    }
    replaceChild(toReplace, replacer) {
        if (this.h = toReplace) {
            this.h = replacer;
        } else if (this.s = toReplace) {
            this.s = replacer;
        } else {
            this.v = replacer;
        }
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    }
    blendTo(finalValue, duration = 500, blendFunc = 'linear') {
        genericBlend(this, finalValue, duration, blendFunc);
    }
};
const hsv = (...args) => new HSV(...args);

class SetOpacity {
    constructor(a, b) {
        if (Number.isFinite(b)) {
            b = float(b);
        }
        if (a.type == 'color' && b.type == 'float') {
        } else {
            console.warn(a, b);
            throw new Error(`SetOpacity cannot be performed between '${a}' and '${b}'`);
        }
        this.type = 'color';
        this.a = a;
        this.b = b;
        a.parent = this;
        b.parent = this;
    }
    _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
        const a = this.a._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
        const b = this.b._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
        return {
            preface: a.preface + b.preface,
            inline: `vec4((${a.inline}).rgb, ${b.inline})`
        };
    }
    _postShaderCompile(program) {
        this.a._postShaderCompile(program);
        this.b._postShaderCompile(program);
    }
    _preDraw(l) {
        this.a._preDraw(l);
        this.b._preDraw(l);
    }
    isAnimated() {
        return this.a.isAnimated() || this.b.isAnimated();
    }
    replaceChild(toReplace, replacer) {
        if (this.a = toReplace) {
            this.a = replacer;
        } else {
            this.b = replacer;
        }
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    }
    blendTo(finalValue, duration = 500, blendFunc = 'linear') {
        genericBlend(this, finalValue, duration, blendFunc);
    }
};
const setOpacity = (...args) => new SetOpacity(...args);

const genBinaryOp = (jsFn, glsl) =>
    class BinaryOperation {
        /**
         * @constructor
         * @name BinaryOperation
         * @param {*} a
         * @param {*} b
         */
        constructor(a, b) {
            if (Number.isFinite(a) && Number.isFinite(b)) {
                return float(jsFn(a, b));
            }
            if (Number.isFinite(a)) {
                a = float(a);
            }
            if (Number.isFinite(b)) {
                b = float(b);
            }
            if (a.type == 'float' && b.type == 'float') {
                this.type = 'float';
            } else {
                console.warn(a, b);
                throw new Error(`Binary operation cannot be performed between '${a}' and '${b}'`);
            }
            this.type = 'float';
            this.a = a;
            this.b = b;
            a.parent = this;
            b.parent = this;
        }
        /**
         * @description apply shader to GLSL source code
         * @name BinaryOperation#_applyToShaderSource
         * @param {*} uniformIDMaker
         * @param {*} propertyTIDMaker
         */
        _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
            const a = this.a._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
            const b = this.b._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
            return {
                preface: a.preface + b.preface,
                inline: glsl(a.inline, b.inline)
            };
        }
        _postShaderCompile(program) {
            this.a._postShaderCompile(program);
            this.b._postShaderCompile(program);
        }
        _preDraw(l) {
            this.a._preDraw(l);
            this.b._preDraw(l);
        }
        isAnimated() {
            return this.a.isAnimated() || this.b.isAnimated();
        }
        replaceChild(toReplace, replacer) {
            if (this.a = toReplace) {
                this.a = replacer;
            } else {
                this.b = replacer;
            }
            replacer.parent = this;
            replacer.notify = toReplace.notify;
        }
        /**
     * @api
     * @alias BinaryOp#blendTo
     * @param {*} finalValue
     * @param {*} duration
     * @param {*} blendFunc
     */
        blendTo(finalValue, duration = 500, blendFunc = 'linear') {
            genericBlend(this, finalValue, duration, blendFunc);
        }
    };


const FloatMul = genBinaryOp((x, y) => x * y, (x, y) => `(${x} * ${y})`);
const FloatDiv = genBinaryOp((x, y) => x / y, (x, y) => `(${x} / ${y})`);
const FloatAdd = genBinaryOp((x, y) => x + y, (x, y) => `(${x} + ${y})`);
const FloatSub = genBinaryOp((x, y) => x - y, (x, y) => `(${x} - ${y})`);
const FloatPow = genBinaryOp((x, y) => Math.pow(x, y), (x, y) => `pow(${x}, ${y})`);

/**
 *
 * @api
 * @returns {FloatMul}
 */
const floatMul = (...args) => new FloatMul(...args);
const floatDiv = (...args) => new FloatDiv(...args);
const floatAdd = (...args) => new FloatAdd(...args);
const floatSub = (...args) => new FloatSub(...args);
const floatPow = (...args) => new FloatPow(...args);

const genUnaryOp = (jsFn, glsl) => class UnaryOperation {
    constructor(a) {
        if (Number.isFinite(a)) {
            return float(jsFn(a));
        }
        if (a.type != 'float') {
            console.warn(a);
            throw new Error(`Binary operation cannot be performed to '${a}'`);
        }
        this.type = 'float';
        this.a = a;
        a.parent = this;
    }
    _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
        const a = this.a._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
        return {
            preface: a.preface,
            inline: glsl(a.inline)
        };
    }
    _postShaderCompile(program) {
        this.a._postShaderCompile(program);
    }
    _preDraw(l) {
        this.a._preDraw(l);
    }
    isAnimated() {
        return this.a.isAnimated();
    }
    replaceChild(toReplace, replacer) {
        if (this.a = toReplace) {
            this.a = replacer;
        } else {
            throw new Error('toReplace element is not a child');
        }
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    }
    blendTo(finalValue, duration = 500, blendFunc = 'linear') {
        genericBlend(this, finalValue, duration, blendFunc);
    }
}

const Log = genUnaryOp(x => Math.log(x), x => `log(${x})`);
const Sqrt = genUnaryOp(x => Math.sqrt(x), x => `sqrt(${x})`);
const Sin = genUnaryOp(x => Math.sin(x), x => `sin(${x})`);
const Cos = genUnaryOp(x => Math.cos(x), x => `cos(${x})`);
const Tan = genUnaryOp(x => Math.tan(x), x => `tan(${x})`);
const Sign = genUnaryOp(x => Math.sign(x), x => `sign(${x})`);

const log = (...args) => new Log(...args);
const sqrt = (...args) => new Sqrt(...args);
const sin = (...args) => new Sin(...args);
const cos = (...args) => new Cos(...args);
const tan = (...args) => new Tan(...args);
const sign = (...args) => new Sign(...args);

function animation(duration) {
    return new Animation(duration);
}
function Animation(duration) {
    if (!Number.isFinite(duration)) {
        throw new Error("Animation only supports number literals");
    }
    this.type = 'float';
    this.aTime = Date.now();
    this.bTime = this.aTime + Number(duration);
}
Animation.prototype._applyToShaderSource = function (uniformIDMaker, propertyTIDMaker) {
    this._uniformID = uniformIDMaker();
    return {
        preface: `uniform float anim${this._uniformID};\n`,
        inline: `anim${this._uniformID}`
    };
}
Animation.prototype._postShaderCompile = function (program) {
    this._uniformLocation = gl.getUniformLocation(program, `anim${this._uniformID}`);
}
Animation.prototype._preDraw = function (l) {
    const time = Date.now();
    this.mix = (time - this.aTime) / (this.bTime - this.aTime);
    if (this.mix > 1.) {
        gl.uniform1f(this._uniformLocation, 1);
    } else {
        gl.uniform1f(this._uniformLocation, this.mix);
    }
}
Animation.prototype.isAnimated = function () {
    return !this.mix || this.mix <= 1.;
}



function near(property, center, threshold, falloff) {
    const args = [property, center, threshold, falloff].map(implicitCast);
    if (args.some(x => x === undefined || x === null)) {
        throw new Error(`Invalid arguments to Near(): ${args}`);
    }
    return new Near(...args);
}

function Near(input, center, threshold, falloff) {
    if (input.type != 'float' || center.type != 'float' || threshold.type != 'float' || falloff.type != 'float') {
        throw new Error('Near(): invalid parameter type');
    }
    this.type = 'float';
    this.input = input;
    this.center = center;
    this.threshold = threshold;
    this.falloff = falloff;
}
Near.prototype._applyToShaderSource = function (uniformIDMaker, propertyTIDMaker) {
    this._UID = uniformIDMaker();
    const tid = propertyTIDMaker(this.property);
    const input = this.input._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const center = this.center._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const threshold = this.threshold._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const falloff = this.falloff._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    return {
        preface:
            input.preface + center.preface + threshold.preface + falloff.preface,
        inline: `1.-clamp((abs(${input.inline}-${center.inline})-${threshold.inline})/${falloff.inline},
                        0., 1.)`
    };
}
Near.prototype._postShaderCompile = function (program) {
    this.center._postShaderCompile(program);
    this.threshold._postShaderCompile(program);
    this.falloff._postShaderCompile(program);
    this.input._postShaderCompile(program);
}
Near.prototype._preDraw = function () {
    this.center._preDraw();
    this.threshold._preDraw();
    this.falloff._preDraw();
    this.input._preDraw();
}
Near.prototype.isAnimated = function () {
    return this.center.isAnimated();
}



function blend(a, b, mix) {
    const args = [a, b, mix].map(implicitCast);
    if (args.some(x => x === undefined || x === null)) {
        throw new Error(`Invalid arguments to Blend(): ${args}`);
    }
    return new Blend(...args);
}
function Blend(a, b, mix) {
    if (a.type == 'float' && b.type == 'float') {
        this.type = 'float';
    } else if (a.type == 'color' && b.type == 'color') {
        this.type = 'color';
    } else {
        console.warn(a, b);
        throw new Error(`Blending cannot be performed between types '${a.type}' and '${b.type}'`);
    }
    if (mix.type != 'float') {
        throw new Error(`Blending cannot be performed by '${mix.type}'`);
    }
    if (schema.checkSchemaMatch(a.schema, b.schema)) {
        throw new Error('Blend parameters schemas mismatch');
    }
    this.schema = a.schema;
    this.a = a;
    this.b = b;
    this.mix = mix;
    a.parent = this;
    b.parent = this;
    mix.parent = this;
}
Blend.prototype._applyToShaderSource = function (uniformIDMaker, propertyTIDMaker) {
    const a = this.a._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const b = this.b._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const mix = this.mix._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    return {
        preface: `${a.preface}${b.preface}${mix.preface}`,
        inline: `mix(${a.inline}, ${b.inline}, ${mix.inline})`
    };
}
Blend.prototype._postShaderCompile = function (program) {
    this.a._postShaderCompile(program);
    this.b._postShaderCompile(program);
    this.mix._postShaderCompile(program);
}
Blend.prototype._preDraw = function (l) {
    this.a._preDraw(l);
    this.b._preDraw(l);
    this.mix._preDraw(l);
    if (this.mix instanceof Animation && !this.mix.isAnimated()) {
        this.parent.replaceChild(this, this.b);
    }
}
Blend.prototype.isAnimated = function () {
    return this.a.isAnimated() || this.b.isAnimated() || this.mix.isAnimated();
}
Blend.prototype.replaceChild = function (toReplace, replacer) {
    if (this.a = toReplace) {
        this.a = replacer;
    } else {
        this.b = replacer;
    }
    replacer.parent = this;
    replacer.notify = toReplace.notify;
}

function genericBlend(initial, final, duration, blendFunc) {
    const parent = initial.parent;
    const blender = blend(initial, final, animation(duration));
    parent.replaceChild(initial, blender);
    blender.notify();
}
Color.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericBlend(this, finalValue, duration, blendFunc);
}
RampColor.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericBlend(this, finalValue, duration, blendFunc);
}

Near.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericBlend(this, finalValue, duration, blendFunc);
}
Float.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericBlend(this, finalValue, duration, blendFunc);
}
Blend.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericBlend(this, finalValue, duration, blendFunc);
}
Property.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericBlend(this, finalValue, duration, blendFunc);
}


function color(color) {
    if (Array.isArray(color)) {
        color = color.filter(x => true);
        if (color.length != 4 || !color.every(Number.isFinite)) {
            throw new Error(`Invalid arguments to Color(): ${args}`);
        }
        return new Color(color);
    }
    throw new Error(`Invalid arguments to Color(): ${args}`);
}
function Color(color) {
    this.type = 'color';
    this.color = color;
}
Color.prototype._applyToShaderSource = function (uniformIDMaker) {
    this._uniformID = uniformIDMaker();
    return {
        preface: `uniform vec4 color${this._uniformID};\n`,
        inline: `color${this._uniformID}`
    };
}
Color.prototype._postShaderCompile = function (program) {
    this._uniformLocation = gl.getUniformLocation(program, `color${this._uniformID}`);
}
function evalColor(color, time) {
    if (Array.isArray(color)) {
        return color;
    }
    var a = evalColor(color.a, time);
    var b = evalColor(color.b, time);
    var m = (time - color.aTime) / (color.bTime - color.aTime);
    return a.map((va, index) => {
        return (1 - m) * va + m * b[index];//TODO non linear functions
    });
}
function simplifyColorExpr(color, time) {
    if (Array.isArray(color)) {
        return color;
    }
    var m = (time - color.aTime) / (color.bTime - color.aTime);
    if (m >= 1) {
        return color.b;
    }
    return color;
}
Color.prototype._preDraw = function () {
    const t = Date.now();
    this.color = simplifyColorExpr(this.color, t);
    const color = evalColor(this.color, t);
    gl.uniform4f(this._uniformLocation, color[0], color[1], color[2], color[3]);
}
Color.prototype.isAnimated = function () {
    return false;
}

function float(x) {
    if (!Number.isFinite(x)) {
        throw new Error(`Invalid arguments to Float(): ${args}`);
    }
    return new Float(x);
}

function Float(size) {
    this.type = 'float';
    this.expr = size;
}
Float.prototype._applyToShaderSource = function (uniformIDMaker) {
    this._uniformID = uniformIDMaker();
    return {
        preface: `uniform float float${this._uniformID};\n`,
        inline: `float${this._uniformID}`
    };
}
Float.prototype._postShaderCompile = function (program) {
    this._uniformLocation = gl.getUniformLocation(program, `float${this._uniformID}`);
}
function evalFloatExpr(expr, time) {
    if (Number.isFinite(expr)) {
        return expr;
    }
    if (typeof expr === "function") {
        return x(time);
    }
    return expr.eval();
}
function simplifyFloatExpr(expr, time) {
    if (Number.isFinite(expr)) {
        return expr;
    }
    return expr.simplify();
}
Float.prototype._preDraw = function (time) {
    this.expr = simplifyFloatExpr(this.expr, time);
    const v = evalFloatExpr(this.expr, time);
    gl.uniform1f(this._uniformLocation, v);
}
Float.prototype.isAnimated = function () {
    return !Number.isFinite(this.expr);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


function rampColor(input, minKey, maxKey, values) {
    //TODO contiunuos vs discrete should be decided based on input type => cartegory vs float
    const args = [input, minKey, maxKey, values].map(implicitCast);
    if (args.some(x => x === undefined || x === null)) {
        throw new Error(`Invalid arguments to RampColor(): ${args}`);
    }
    return new RampColor(...args);
}

//Palette => used by Ramp, Ramp gets texture2D from palette by asking for number of buckets (0/interpolated palette, 2,3,4,5,6...)
function RampColor(input, minKey, maxKey, values) {
    this.type = 'color';
    this.input = input;
    this.minKey = minKey.expr;
    this.maxKey = maxKey.expr;
    this.values = values;

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
    for (var i = 0; i < width; i++) {
        const vlowRaw = values[Math.floor(i / width * (values.length - 1))];
        const vhighRaw = values[Math.ceil(i / width * (values.length - 1))];
        const vlow = [hexToRgb(vlowRaw).r, hexToRgb(vlowRaw).g, hexToRgb(vlowRaw).b, 255];
        const vhigh = [hexToRgb(vhighRaw).r, hexToRgb(vhighRaw).g, hexToRgb(vhighRaw).b, 255];
        const m = i / width * (values.length - 1) - Math.floor(i / width * (values.length - 1));
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

RampColor.prototype._free = function () {
    gl.deleteTexture(this.texture);
}
RampColor.prototype._applyToShaderSource = function (uniformIDMaker, propertyTIDMaker) {
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
RampColor.prototype._postShaderCompile = function (program) {
    this.input._postShaderCompile(program);
    this._texLoc = gl.getUniformLocation(program, `texRamp${this._UID}`);
    this._keyMinLoc = gl.getUniformLocation(program, `keyMin${this._UID}`);
    this._keyWidthLoc = gl.getUniformLocation(program, `keyWidth${this._UID}`);
}
RampColor.prototype._preDraw = function (l) {
    this.input._preDraw(l);
    gl.activeTexture(gl.TEXTURE0 + l.freeTexUnit);//TODO remove hardcode
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this._texLoc, l.freeTexUnit);
    gl.uniform1f(this._keyMinLoc, evalFloatExpr(this.minKey));
    gl.uniform1f(this._keyWidthLoc, evalFloatExpr(this.maxKey) - evalFloatExpr(this.minKey));
    l.freeTexUnit++;
}
RampColor.prototype.isAnimated = function () {
    return this.input.isAnimated();
}
