import * as cartocolor from 'cartocolor';
import * as schema from '../schema';

/** @module style/functions/
 * @api
 * @description
 * # Styling language overview
 *
 * A style has a fixed number of properties with default values.
 * These properties are: color, width, stroke-color and stroke-width.
 *
 * Properties are styled by using styling expressions.
 * A styling expression is a numeric literal, an identifier, a function call, or a built-in mathematic operation.
 *
 *
 *
 * ## Numeric literals:
 * ```
 * 5            //This IS a valid expression, a numeric literal
 * 0.3          //This IS a valid expression too
 * 'myString'   //This IS NOT a valid expression, strings are unsupported
 * ```
 * ## Identifiers.
 * Identifiers can be used to refer to a feature property by prefixing the property name by '$'.
 * Cartocolors schemes are identifiers too.
 * ```
 * $myAwesomeProperty   //This IS a valid expression
 * Prism                //This IS a valid expression, Prism is a cartocolor palette
 * wadusWadus           //This IS NOT a valid expression since wadusWadus is not a known palette nor it is prefixed by '$'
 * ```
 *
 * ## Built-in mathematic operations
 * Some basic mathematical operations are supported:
 * ```
 * 3+4       //This IS a valid expression
 * 2^5       //This IS a valid expression, '^' is the power function, this resolves to 32
 * 2<<3      //This IS NOT a valid expression (no, binary operators are unsupported)
 * ```
 *
 *
 * ## Function calling.
 * Functions can be used to mix different expressions creating richer expressions.
 * ```
 * rgba(0.5,0.5,0.5, 1) //This IS a valid expression
 * now()                //This IS a valid expression
 *
 * wadusWadus()         //This IS NOT a valid expression, wadusWadus is not a known function
 * rgba(1)              //This IS NOT a valid expression since rgba() takes 4 parameters and only one was passed
 *
 * rgba(0,0,0, now())           //This IS a valid expression, now is a numeric expression and match the alpha parameter type of rgba()
 * rgba(0,0,0, rgba(0,0,0,0))   //This IS NOT a valid expression, the alpha parameter of the first function call is of type color since rgba returns a color
 * ```
 */


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

class Expression {
    /**
     * @jsapi
     * @hideconstructor
     * @param {*} children
     * @param {*} inlineMaker
     * @param {*} preface
     */
    constructor(children, inlineMaker, preface) {
        this.inlineMaker = inlineMaker;
        this.preface = (preface ? preface : '');
        this.childrenNames = Object.keys(children);
        Object.keys(children).map(name => this[name] = children[name]);
        this._getChildren().map(child => child.parent = this);
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
        }
    }
    /**
     * Inform about a successful shader compilation. One-time post-compilation WebGL calls should be done here.
     * @param {*} program
     */
    _postShaderCompile(program) {
        this.childrenNames.forEach(name => this[name]._postShaderCompile(program));
    }
    /**
     * Pre-rendering routine. Should establish related WebGL state as needed.
     * @param {*} l
     */
    _preDraw(l) {
        this.childrenNames.forEach(name => this[name]._preDraw(l));
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
    blendTo(final, duration = 500, blendFunc = 'linear') {
        const parent = this.parent;
        const blender = blend(this, final, animate(duration));
        parent._replaceChild(this, blender);
        blender.notify();
    }
    /**
     * @returns a list with the expression children
     */
    _getChildren() {
        return this.childrenNames.map(name => this[name]);
    }
}

class Property extends Expression {
    /**
     * @jsapi
     * @param {*} name Property/column name
     */
    constructor(name, schema) {
        if (typeof name !== 'string' || name == '') {
            throw new Error(`Invalid property name '${name}'`);
        }
        if (!schema[name]) {
            throw new Error(`Property name not found`);
        }
        super({}, (childInlines, uniformIDMaker, propertyTIDMaker) => `p${propertyTIDMaker(this.name)}`);
        this.name = name;
        this.type = 'float';
        this.schema = schema;
    }
}

class Now extends Expression {
    /**
     * @api
     * @description get the current timestamp
     */
    constructor() {
        super({ now: float(0) }, inline => inline.now);
        this.type = 'float';
        this.init = Date.now();
    }
    _preDraw() {
        this.now.expr = (Date.now() - this.init) / 1000.;
        this.now._preDraw();
    }
    isAnimated() {
        return true;
    }
}

const now = (speed) => new Now(speed);

//TODO convert to use uniformfloat class
class Animate extends Expression {
    /**
     * @jsapi
     * @description Animate returns a number from zero to one based on the elapsed number of milliseconds since the style was instantiated.
     * The animation is not cyclic. It will stick to one once the elapsed number of milliseconds reach the animation's duration.
     * @param {*} duration animation duration in milliseconds
     */
    constructor(duration) {
        if (!Number.isFinite(duration)) {
            throw new Error("Animate only supports number literals");
        }
        super({});
        this.type = 'float';
        this.aTime = Date.now();
        this.bTime = this.aTime + Number(duration);
    }
    _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
        this._uniformID = uniformIDMaker();
        return {
            preface: `uniform float anim${this._uniformID};\n`,
            inline: `anim${this._uniformID}`
        };
    }
    _postShaderCompile(program) {
        this._uniformLocation = gl.getUniformLocation(program, `anim${this._uniformID}`);
    }
    _preDraw(l) {
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


class HSV extends Expression {
    /**
     * @api
     * @description Color constructor for Hue Saturation Value (HSV) color space
     * @param {*} hue   hue is the color hue, the coordinates goes from 0 to 1 and is cyclic, i.e.: 0.5=1.5=2.5=-0.5
     * @param {*} saturation saturation of the color in the [0,1] range
     * @param {*} value value (brightness) of the color in the [0,1] range
     */
    constructor(h, s, v) {
        h = implicitCast(h);
        s = implicitCast(s);
        v = implicitCast(v);
        if (h.type != 'float' || s.type != 'float' || v.type != 'float') {
            console.warn(h, s, v);
            throw new Error(`SetOpacity cannot be performed between `);
        }
        super({ h: h, s: s, v: v }, inline =>
            `vec4(hsv2rgb(vec3(${inline.h}, clamp(${inline.s}, 0.,1.), clamp(${inline.v}, 0.,1.))), 1)`
            ,
            `
        #ifndef HSV2RGB
        #define HSV2RGB
        vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }
        #endif
        `);
        this.type = 'color';
    }
};



const genBinaryOp = (jsFn, glsl) =>
    class BinaryOperation extends Expression {
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
                return float(jsFn(a, b));
            }
            if (Number.isFinite(a)) {
                a = float(a);
            }
            if (Number.isFinite(b)) {
                b = float(b);
            }
            if (a.type == 'float' && b.type == 'float') {
                super({ a: a, b: b }, inline => glsl(inline.a, inline.b));
                this.type = 'float';
            } else {
                console.warn(a, b);
                throw new Error(`Binary operation cannot be performed between '${a}' and '${b}'`);
            }
        }
    };



class SetOpacity extends Expression {
    /**
     * @api
     * @description Override the input color opacity
     * @param {*} color input color
     * @param {*} opacity new opacity
     */
    constructor(a, b) {
        if (Number.isFinite(b)) {
            b = float(b);
        }
        if (a.type == 'color' && b.type == 'float') {
        } else {
            console.warn(a, b);
            throw new Error(`SetOpacity cannot be performed between '${a}' and '${b}'`);
        }
        super({ a: a, b: b }, inlines => `vec4((${inlines.a}).rgb, ${inlines.b})`);
        this.type = 'color';
    }
};

/**
* @jsapi
* @augments {BinaryOperation}
*/
class FloatMul extends genBinaryOp((x, y) => x * y, (x, y) => `(${x} * ${y})`) { }
const FloatDiv = genBinaryOp((x, y) => x / y, (x, y) => `(${x} / ${y})`);
const FloatAdd = genBinaryOp((x, y) => x + y, (x, y) => `(${x} + ${y})`);
const FloatSub = genBinaryOp((x, y) => x - y, (x, y) => `(${x} - ${y})`);
const FloatPow = genBinaryOp((x, y) => Math.pow(x, y), (x, y) => `pow(${x}, ${y})`);


const genUnaryOp = (jsFn, glsl) => class UnaryOperation extends Expression {
    constructor(a) {
        if (Number.isFinite(a)) {
            return float(jsFn(a));
        }
        if (a.type != 'float') {
            console.warn(a);
            throw new Error(`Binary operation cannot be performed to '${a}'`);
        }
        super({ a: a }, inlines => glsl(inlines.a));
        this.type = 'float';
    }
}

const Log = genUnaryOp(x => Math.log(x), x => `log(${x})`);
const Sqrt = genUnaryOp(x => Math.sqrt(x), x => `sqrt(${x})`);
const Sin = genUnaryOp(x => Math.sin(x), x => `sin(${x})`);
const Cos = genUnaryOp(x => Math.cos(x), x => `cos(${x})`);
const Tan = genUnaryOp(x => Math.tan(x), x => `tan(${x})`);
const Sign = genUnaryOp(x => Math.sign(x), x => `sign(${x})`);


class Near extends Expression {
    /**
     * @api
     * @description Near returns zero for inputs that are far away from center.
     * This can be useful for filtering out features by setting their size to zero.
     * @param {*} input
     * @param {*} center
     * @param {*} threshold size of the allowed distance between input and center that is filtered in (returning one)
     * @param {*} falloff size of the distance to be used as a falloff to linearly interpolate between zero and one
     */
    constructor(input, center, threshold, falloff) {
        input = implicitCast(input);
        center = implicitCast(center);
        threshold = implicitCast(threshold);
        falloff = implicitCast(falloff);
        if ([input, center, threshold, falloff].some(x => x === undefined || x === null)) {
            throw new Error(`Invalid arguments to Near()`);
        }
        if (input.type != 'float' || center.type != 'float' || threshold.type != 'float' || falloff.type != 'float') {
            throw new Error('Near(): invalid parameter type');
        }
        super({ input: input, center: center, threshold: threshold, falloff: falloff }, (inline) =>
            `1.-clamp((abs(${inline.input}-${inline.center})-${inline.threshold})/${inline.falloff},
            0., 1.)`
        );
        this.type = 'float';
    }
}

class Blend extends Expression {
    /**
     * @api
     * @description Interpolate from *a* to *b* based on *mix*
     * @param {*} a can be a color or a number
     * @param {*} b type must match a's type
     * @param {*} mix interpolation parameter in the [0,1] range
     */
    constructor(a, b, mix) {
        a = implicitCast(a);
        b = implicitCast(b);
        mix = implicitCast(mix);
        if ([a, b, mix].some(x => x === undefined || x === null)) {
            throw new Error(`Invalid arguments to Blend(): ${args}`);
        }
        if (mix.type != 'float') {
            throw new Error(`Blending cannot be performed by '${mix.type}'`);
        }
        if (schema.checkSchemaMatch(a.schema, b.schema)) {
            throw new Error('Blend parameters schemas mismatch');
        }
        super({ a: a, b: b, mix: mix }, inline => `mix(${inline.a}, ${inline.b}, ${inline.mix})`);
        if (a.type == 'float' && b.type == 'float') {
            this.type = 'float';
        } else if (a.type == 'color' && b.type == 'color') {
            this.type = 'color';
        } else {
            console.warn(a, b);
            throw new Error(`Blending cannot be performed between types '${a.type}' and '${b.type}'`);
        }
        this.schema = a.schema;
    }
    _preDraw(l) {
        super._preDraw(l);
        if (this.mix instanceof Animate && !this.mix.isAnimated()) {
            this.parent._replaceChild(this, this.b);
        }
    }
}

//TODO rename to uniformcolor, write color (plain, literal)
class RGBA extends Expression {
    /**
     * @api
     * @description RGBA color constructor
     * @param {*} r red component in the [0,1] range
     * @param {*} g green component in the [0,1] range
     * @param {*} b blue component in the [0,1] range
     * @param {*} a alpha/opacity component in the [0,1] range
     */
    constructor(r, g, b, a) {
        var color = [r, g, b, a];
        if (!Array.isArray(color)) {
            throw new Error(`Invalid arguments to Color(): ${args}`);
        }
        color = color.filter(x => true);
        if (color.length != 4 || !color.every(Number.isFinite)) {
            throw new Error(`Invalid arguments to Color(): ${args}`);
        }
        super({});
        this.type = 'color';
        this.color = color;
    }
    _applyToShaderSource(uniformIDMaker) {
        this._uniformID = uniformIDMaker();
        return {
            preface: `uniform vec4 color${this._uniformID};\n`,
            inline: `color${this._uniformID}`
        };
    }
    _postShaderCompile(program) {
        this._uniformLocation = gl.getUniformLocation(program, `color${this._uniformID}`);
    }
    _preDraw() {
        gl.uniform4f(this._uniformLocation, this.color[0], this.color[1], this.color[2], this.color[3]);
    }
    isAnimated() {
        return false;
    }
}


class Float extends Expression {
    /**
     * @jsapi
     * @param {*} x
     */
    constructor(x) {
        if (!Number.isFinite(x)) {
            throw new Error(`Invalid arguments to Float(): ${x}`);
        }
        super({});
        this.type = 'float';
        this.expr = x;
    }
    _applyToShaderSource(uniformIDMaker) {
        this._uniformID = uniformIDMaker();
        return {
            preface: `uniform float float${this._uniformID};\n`,
            inline: `float${this._uniformID}`
        };
    }
    _postShaderCompile(program) {
        this._uniformLocation = gl.getUniformLocation(program, `float${this._uniformID}`);
    }
    _preDraw() {
        gl.uniform1f(this._uniformLocation, this.expr);
    }
    isAnimated() {
        return false;
    }
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


//Palette => used by Ramp, Ramp gets texture2D from palette by asking for number of buckets (0/interpolated palette, 2,3,4,5,6...)

class RampColor extends Expression {
    /**
     * @api
     * @description Creates a color ramp based on input and within the range defined by *minKey* and *maxKey*
     * @param {*} input
     * @param {*} minKey
     * @param {*} maxKey
     * @param {*} palette
     */
    constructor(input, minKey, maxKey, palette) {
        input = implicitCast(input);
        minKey = implicitCast(minKey);
        maxKey = implicitCast(maxKey);
        var values = implicitCast(palette);
        if ([input, minKey, maxKey, values].some(x => x === undefined || x === null)) {
            throw new Error(`Invalid arguments to RampColor()`);
        }
        super({ input: input });
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
    _free() {
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
    _postShaderCompile(program) {
        this.input._postShaderCompile(program);
        this._texLoc = gl.getUniformLocation(program, `texRamp${this._UID}`);
        this._keyMinLoc = gl.getUniformLocation(program, `keyMin${this._UID}`);
        this._keyWidthLoc = gl.getUniformLocation(program, `keyWidth${this._UID}`);
    }
    _preDraw(l) {
        this.input._preDraw(l);
        gl.activeTexture(gl.TEXTURE0 + l.freeTexUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this._texLoc, l.freeTexUnit);
        gl.uniform1f(this._keyMinLoc, (this.minKey));
        gl.uniform1f(this._keyWidthLoc, (this.maxKey) - (this.minKey));
        l.freeTexUnit++;
    }
}


const floatMul = (...args) => new FloatMul(...args);
const floatDiv = (...args) => new FloatDiv(...args);
const floatAdd = (...args) => new FloatAdd(...args);
const floatSub = (...args) => new FloatSub(...args);
const floatPow = (...args) => new FloatPow(...args);
const log = (...args) => new Log(...args);
const sqrt = (...args) => new Sqrt(...args);
const sin = (...args) => new Sin(...args);
const cos = (...args) => new Cos(...args);
const tan = (...args) => new Tan(...args);
const sign = (...args) => new Sign(...args);
const near = (...args) => new Near(...args);
const blend = (...args) => new Blend(...args);
const rgba = (...args) => new RGBA(...args);
const property = (...args) => new Property(...args);
const animate = (...args) => new Animate(...args);
const hsv = (...args) => new HSV(...args);
const setOpacity = (...args) => new SetOpacity(...args);
const rampColor = (...args) => new RampColor(...args);
const float = (...args) => new Float(...args);

export {
    Property, Blend, Now, Near, RGBA, Float, RampColor, FloatMul, FloatDiv, FloatAdd, FloatSub, FloatPow, Log, Sqrt, Sin, Cos, Tan, Sign, SetOpacity, HSV, Animate,
    property, blend, now, near, rgba, float, rampColor, floatMul, floatDiv, floatAdd, floatSub, floatPow, log, sqrt, sin, cos, tan, sign, setOpacity, hsv, animate,
    setGL
};