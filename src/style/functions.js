
function implicitCast(value) {
    if (Number.isFinite(value)) {
        return Float(value);
    }
    return value;
}
var gl = null;
function setGL(_gl) {
    gl = _gl;
}
export { Now, Near, Color, Float, RampColor, setGL, FloatMul, FloatDiv, FloatAdd, FloatSub, FloatPow };

function Now() {
    return new _Now();
}
function _Now() {
    this.float = Float(100);
}
_Now.prototype._applyToShaderSource = function (uniformIDMaker) {
    return this.float._applyToShaderSource(uniformIDMaker);
}
_Now.prototype._postShaderCompile = function (program) {
    return this.float._postShaderCompile(program);
}
_Now.prototype._preDraw = function () {
    this.float.expr = Date.now() * 0.1 % 400;
    this.float._preDraw();
}
_Now.prototype.isAnimated = function () {
    return true;
}

const FloatMul = genFloatBinaryOperation((x, y) => x * y, (x, y) => `(${x} * ${y})`);
const FloatDiv = genFloatBinaryOperation((x, y) => x / y, (x, y) => `(${x} / ${y})`);
const FloatAdd = genFloatBinaryOperation((x, y) => x + y, (x, y) => `(${x} + ${y})`);
const FloatSub = genFloatBinaryOperation((x, y) => x - y, (x, y) => `(${x} - ${y})`);
const FloatPow = genFloatBinaryOperation((x, y) => Math.pow(x, y), (x, y) => `pow(${x}, ${y})`);

function genFloatBinaryOperation(jsFn, glsl) {
    function BinaryOp(a, b) {
        if (Number.isFinite(a) && Number.isFinite(b)) {
            return Float(jsFn(a, b));
        }
        if (Number.isFinite(a)) {
            a = Float(a);
        }
        if (Number.isFinite(b)) {
            b = Float(b);
        }
        return new _BinaryOp(a, b);
    }
    function _BinaryOp(a, b) {
        this.a = a;
        this.b = b;
        a.parent = this;
        b.parent = this;
    }
    _BinaryOp.prototype._applyToShaderSource = function (uniformIDMaker, propertyTIDMaker) {
        const a = this.a._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
        const b = this.b._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
        return {
            preface: a.preface + b.preface,
            inline: glsl(a.inline, b.inline)
        };
    }
    _BinaryOp.prototype._postShaderCompile = function (program) {
        this.a._postShaderCompile(program);
        this.b._postShaderCompile(program);
    }
    _BinaryOp.prototype._preDraw = function (l) {
        this.a._preDraw(l);
        this.b._preDraw(l);
    }
    _BinaryOp.prototype.isAnimated = function () {
        return this.a.isAnimated() || this.b.isAnimated();
    }
    _BinaryOp.prototype.replaceChild = function (toReplace, replacer) {
        if (this.a = toReplace) {
            this.a = replacer;
        } else {
            this.b = replacer;
        }
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    }
    _BinaryOp.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
        genericFloatBlend(this, finalValue, duration, blendFunc);
    }
    return BinaryOp;
}



function FloatBlend(a, b, mix) {
    this.a = a;
    this.b = b;
    a.parent = this;
    b.parent = this;
    if (mix.indexOf('ms') >= 0) {
        const duration = Number(mix.replace('ms', ''));
        this.aTime = Date.now();
        this.bTime = this.aTime + duration;
        mix = 'anim';
    }
    this.mix = mix;
}
FloatBlend.prototype._applyToShaderSource = function (uniformIDMaker, propertyTIDMaker) {
    this._uniformID = uniformIDMaker();
    const a = this.a._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const b = this.b._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    return {
        preface: `uniform float mix${this._uniformID};\n${a.preface}${b.preface}`,
        inline: `mix(${a.inline}, ${b.inline}, mix${this._uniformID})`
    };
}
FloatBlend.prototype._postShaderCompile = function (program) {
    this._uniformLocation = gl.getUniformLocation(program, `mix${this._uniformID}`);
    this.a._postShaderCompile(program);
    this.b._postShaderCompile(program);
}
FloatBlend.prototype._preDraw = function (l) {
    var mix = this.mix;
    if (mix == 'anim') {
        const time = Date.now();
        mix = (time - this.aTime) / (this.bTime - this.aTime);
        if (mix >= 1.) {
            mix = 1.;
            this.mix = 1.;
            //TODO free A, free blend
            this.parent.replaceChild(this, this.b);
        }
    }
    gl.uniform1f(this._uniformLocation, mix);
    this.a._preDraw(l);
    this.b._preDraw(l);
}
FloatBlend.prototype.isAnimated = function () {
    return this.mix === 'anim';
}
FloatBlend.prototype.replaceChild = function (toReplace, replacer) {
    if (this.a = toReplace) {
        this.a = replacer;
    } else {
        this.b = replacer;
    }
    replacer.parent = this;
    replacer.notify = toReplace.notify;
}
function genericFloatBlend(initial, final, duration, blendFunc) {
    const parent = initial.parent;
    const blend = new FloatBlend(initial, final, `${duration}ms`);
    parent.replaceChild(initial, blend);
    blend.notify();
}


function Color(color) {
    if (Array.isArray(color)) {
        color = color.filter(x => true);
        if (color.length != 4 || !color.every(Number.isFinite)) {
            return null;
        }
        return new UniformColor(color);
    }
    return null;
}
function UniformColor(color) {
    this.color = color;
}
UniformColor.prototype._applyToShaderSource = function (uniformIDMaker) {
    this._uniformID = uniformIDMaker();
    return {
        preface: `uniform vec4 color${this._uniformID};\n`,
        inline: `color${this._uniformID}`
    };
}
UniformColor.prototype._postShaderCompile = function (program) {
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
UniformColor.prototype._preDraw = function () {
    const t = Date.now();
    this.color = simplifyColorExpr(this.color, t);
    const color = evalColor(this.color, t);
    gl.uniform4f(this._uniformLocation, color[0], color[1], color[2], color[3]);
}
UniformColor.prototype.isAnimated = function () {
    return false;
}


function ColorBlend(a, b, mix) {
    this.a = a;
    this.b = b;
    a.parent = this;
    b.parent = this;
    if (mix.indexOf('ms') >= 0) {
        const duration = Number(mix.replace('ms', ''));
        this.aTime = Date.now();
        this.bTime = this.aTime + duration;
        mix = 'anim';
    }
    this.mix = mix;
}
ColorBlend.prototype._applyToShaderSource = function (uniformIDMaker, propertyTIDMaker) {
    this._uniformID = uniformIDMaker();
    const a = this.a._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const b = this.b._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    return {
        preface: `uniform float mix${this._uniformID};\n${a.preface}${b.preface}`,
        inline: `mix(${a.inline}, ${b.inline}, mix${this._uniformID})`
    };
}
ColorBlend.prototype._postShaderCompile = function (program) {
    this._uniformLocation = gl.getUniformLocation(program, `mix${this._uniformID}`);
    this.a._postShaderCompile(program);
    this.b._postShaderCompile(program);
}
ColorBlend.prototype._preDraw = function (l) {
    var mix = this.mix;
    if (mix == 'anim') {
        const time = Date.now();
        mix = (time - this.aTime) / (this.bTime - this.aTime);
        if (mix >= 1.) {
            mix = 1.;
            this.mix = 1.;
            //TODO free A, free blend
            this.parent.replaceChild(this, this.b);
        }
    }
    gl.uniform1f(this._uniformLocation, mix);
    this.a._preDraw(l);
    this.b._preDraw(l);
}
ColorBlend.prototype.isAnimated = function () {
    return this.mix === 'anim';
}
ColorBlend.prototype.replaceChild = function (toReplace, replacer) {
    if (this.a = toReplace) {
        this.a = replacer;
    } else {
        this.b = replacer;
    }
    replacer.parent = this;
    replacer.notify = toReplace.notify;
}

function genericColorBlend(initial, final, duration, blendFunc) {
    const parent = initial.parent;
    const blend = new ColorBlend(initial, final, `${duration}ms`);
    parent.replaceChild(initial, blend);
    blend.notify();
}

UniformColor.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericColorBlend(this, finalValue, duration, blendFunc);
}
ColorBlend.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericColorBlend(this, finalValue, duration, blendFunc);
}
_RampColor.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericColorBlend(this, finalValue, duration, blendFunc);
}


_Near.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericFloatBlend(this, finalValue, duration, blendFunc);
}
UniformFloat.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericFloatBlend(this, finalValue, duration, blendFunc);
}
FloatBlend.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericFloatBlend(this, finalValue, duration, blendFunc);
}

function Float(x) {
    if (!Number.isFinite(x)) {
        return null;
    }
    return new UniformFloat(x);
}

function UniformFloat(size) {
    this.expr = size;
}
UniformFloat.prototype._applyToShaderSource = function (uniformIDMaker) {
    this._uniformID = uniformIDMaker();
    return {
        preface: `uniform float float${this._uniformID};\n`,
        inline: `float${this._uniformID}`
    };
}
UniformFloat.prototype._postShaderCompile = function (program) {
    this._uniformLocation = gl.getUniformLocation(program, `float${this._uniformID}`);
}
function evalFloatExpr(expr, time) {
    if (Number.isFinite(expr)) {
        return expr;
    }
    var a = evalFloatExpr(expr.a, time);
    var b = evalFloatExpr(expr.b, time);
    var m = (time - expr.aTime) / (expr.bTime - expr.aTime);
    return (1 - m) * a + m * b; //TODO non linear functions
}
function simplifyFloatExpr(expr, time) {
    if (Number.isFinite(expr)) {
        return expr;
    }
    var m = (time - expr.aTime) / (expr.bTime - expr.aTime);
    if (m >= 1) {
        return expr.b;
    }
    return expr;
}
UniformFloat.prototype._preDraw = function () {
    const t = Date.now();
    this.expr = simplifyFloatExpr(this.expr, t);
    const v = evalFloatExpr(this.expr, t);
    gl.uniform1f(this._uniformLocation, v);
}
UniformFloat.prototype.isAnimated = function () {
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



/*
    color: ramp(temp, 0º, 30º, carto-color)
    width: exprNear(date, SIM_TIME, fullRegion, blendRegion, 0, 4)
*/

function Near(property, center, threshold, falloff, outputOnNegative, outputOnPositive) {
    const args = [property, center, threshold, falloff, outputOnNegative, outputOnPositive].map(implicitCast);
    if (args.some(x => x === undefined || x === null)) {
        return null;
    }
    return new _Near(...args);
}

function _Near(property, center, threshold, falloff, outputOnNegative, outputOnPositive) {
    this.property = property;
    this.center = center;
    this.outputOnNegative = outputOnNegative;
    this.outputOnPositive = outputOnPositive;
    this.threshold = threshold;
    this.falloff = falloff;
}

_Near.prototype._applyToShaderSource = function (uniformIDMaker, propertyTIDMaker) {
    this._UID = uniformIDMaker();
    const tid = propertyTIDMaker(this.property);
    const center = this.center._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const positive = this.outputOnPositive._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const threshold = this.threshold._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const falloff = this.falloff._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    const negative = this.outputOnNegative._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
    return {
        preface:
            center.preface + positive.preface + threshold.preface + falloff.preface + negative.preface,
        inline: `mix(${positive.inline},${negative.inline},
                        clamp((abs(p${tid}-${center.inline})-${threshold.inline})/${falloff.inline},
                            0., 1.))`
    };
}
_Near.prototype._postShaderCompile = function (program) {
    this.center._postShaderCompile(program);
    this.outputOnNegative._postShaderCompile(program);
    this.outputOnPositive._postShaderCompile(program);
    this.threshold._postShaderCompile(program);
    this.falloff._postShaderCompile(program);
}
function evalFloatUniform(x) {
    if (typeof x === "function") {
        x = x();
    }
    if (Number.isFinite(x)) {
        return x;
    }
    return 0;
}

_Near.prototype._preDraw = function () {
    this.center._preDraw();
    this.outputOnNegative._preDraw();
    this.outputOnPositive._preDraw();
    this.threshold._preDraw();
    this.falloff._preDraw();
}
_Near.prototype.isAnimated = function () {
    return this.center.isAnimated();
}

function RampColor(property, minKey, maxKey, values) {
    //TODO contiunuos vs discrete should be decided based on property type => cartegory vs float
    const args = [property, minKey, maxKey, values].map(implicitCast);
    if (args.some(x => x === undefined || x === null)) {
        return null;
    }
    return new _RampColor(...args);
}

function _RampColor(property, minKey, maxKey, values) {
    this.property = property;
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

_RampColor.prototype._free = function () {
    gl.deleteTexture(this.texture);
}
_RampColor.prototype._applyToShaderSource = function (uniformIDMaker, propertyTIDMaker) {
    const tid = propertyTIDMaker(this.property);
    this._UID = uniformIDMaker();
    return {
        preface: `
        uniform sampler2D texRamp${this._UID};
        uniform float keyMin${this._UID};
        uniform float keyWidth${this._UID};
        `,
        inline: `texture2D(texRamp${this._UID}, vec2((p${tid}-keyMin${this._UID})/keyWidth${this._UID}, 0.5)).rgba`
    };
}
_RampColor.prototype._postShaderCompile = function (program) {
    this._texLoc = gl.getUniformLocation(program, `texRamp${this._UID}`);
    this._keyMinLoc = gl.getUniformLocation(program, `keyMin${this._UID}`);
    this._keyWidthLoc = gl.getUniformLocation(program, `keyWidth${this._UID}`);
}
_RampColor.prototype._preDraw = function () {
    gl.activeTexture(gl.TEXTURE12);//TODO remove hardcode
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this._texLoc, 12);
    gl.uniform1f(this._keyMinLoc, evalFloatUniform(this.minKey));
    gl.uniform1f(this._keyWidthLoc, evalFloatUniform(this.maxKey) - evalFloatUniform(this.minKey));
}
_RampColor.prototype.isAnimated = function () {
    return false;
}
