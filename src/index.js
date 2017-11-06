var gl;

const RTT_WIDTH = 1024;

const renderVS = `

precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;

uniform sampler2D colorTex;
uniform sampler2D widthTex;

varying lowp vec4 color;

void main(void) {
    float size = texture2D(widthTex, featureID).a;
    vec4 p = vec4(vertexScale*vertexPosition-vertexOffset, 1.-(size*0.9+0.05), 1.);
    gl_Position  = p;
    gl_PointSize = size*25.;
    color = texture2D(colorTex, featureID);
}`;

const renderFS = `
precision lowp float;

varying lowp vec4 color;

void main(void) {
    //TODO fix AA (use point size)
    vec2 p = 2.*gl_PointCoord-vec2(1.);
    vec4 c = color;
    float l = length(p);
    c.a *=  1. - smoothstep(0.9, 1.1, l);
    gl_FragColor = c;
}`;


const colorStylerVS = `

precision highp float;
attribute vec2 vertex;

varying  vec2 uv;

void main(void) {
    uv = vertex*0.5+vec2(0.5);
    gl_Position  = vec4(vertex, 0.5, 1.);
}
`;

const colorStylerFS = `

precision highp float;

varying  vec2 uv;

$PREFACE

uniform sampler2D property0;
uniform sampler2D property1;
uniform sampler2D property2;
uniform sampler2D property3;

void main(void) {
    float p0=texture2D(property0, uv).a;
    float p1=texture2D(property1, uv).a;
    //float p2=texture2D(property2, uv).a;
    //float p3=texture2D(property3, uv).a;
    gl_FragColor = $COLOR;
}
`;

const widthStylerVS = `

precision highp float;
attribute vec2 vertex;

varying  vec2 uv;

void main(void) {
    uv = vertex*0.5+vec2(0.5);
    gl_Position  = vec4(vertex, 0.5, 1.);
}
`;

const widthStylerFS = `

precision highp float;

varying  vec2 uv;

$PREFACE

uniform sampler2D property0;
uniform sampler2D property1;
uniform sampler2D property2;
uniform sampler2D property3;

void main(void) {
    float p0=texture2D(property0, uv).a;
    float p1=texture2D(property1, uv).a;
    //float p2=texture2D(property2, uv).a;
    //float p3=texture2D(property3, uv).a;
    gl_FragColor = vec4($WIDTH);
}
`;

Renderer.prototype._initShaders = function () {
    var fragmentShader = compileShader(renderFS, gl.FRAGMENT_SHADER);
    var vertexShader = compileShader(renderVS, gl.VERTEX_SHADER);
    this.finalRendererProgram = gl.createProgram();
    gl.attachShader(this.finalRendererProgram, vertexShader);
    gl.attachShader(this.finalRendererProgram, fragmentShader);
    gl.linkProgram(this.finalRendererProgram);
    if (!gl.getProgramParameter(this.finalRendererProgram, gl.LINK_STATUS)) {
        throw new Error('Unable to link the shader program: ' + gl.getProgramInfoLog(this.finalRendererProgram));
    }
    this.vertexPositionAttribute = gl.getAttribLocation(this.finalRendererProgram, 'vertexPosition');
    this.FeatureIdAttr = gl.getAttribLocation(this.finalRendererProgram, 'featureID');
    gl.enableVertexAttribArray(this.vertexPositionAttribute);

    this.vertexScaleUniformLocation = gl.getUniformLocation(this.finalRendererProgram, 'vertexScale');
    this.vertexOffsetUniformLocation = gl.getUniformLocation(this.finalRendererProgram, 'vertexOffset');
    this.rendererColorTex = gl.getUniformLocation(this.finalRendererProgram, 'colorTex');
    this.rendererWidthTex = gl.getUniformLocation(this.finalRendererProgram, 'widthTex');
}

//TODO to utils.js
function compileShader(sourceCode, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader) + sourceCode);
    }
    return shader;
}

Renderer.prototype.refresh = refresh;
function refresh(timestamp) {
    // Don't re-render more than once per animation frame
    if (this.lastFrame == timestamp) {
        return;
    }
    this.lastFrame = timestamp;

    //console.log('Re-render')


    var canvas = document.getElementById('glCanvas');//TODO this should be a renderer property
    var width = gl.canvas.clientWidth;
    var height = gl.canvas.clientHeight;
    if (gl.canvas.width != width ||
        gl.canvas.height != height) {
        gl.canvas.width = width;
        gl.canvas.height = height;
    }

    var aspect = canvas.clientWidth / canvas.clientHeight;
    gl.clearColor(0., 0., 0., 0.);//TODO this should be a renderer property
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);

    this.layers.forEach(layer => {
        if ((layer.style._color.isAnimated() || layer.style._width.isAnimated() || layer.style.updated)) {
            //TODO refactor condition
            gl.disable(gl.BLEND);
            gl.disable(gl.DEPTH_TEST);

            if (!this.auxFB) {
                this.auxFB = gl.createFramebuffer();
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.auxFB);
            //console.log("Restyle", timestamp)
            // Render To Texture
            // COLOR
            layer.tiles.forEach(tile => {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tile.texColor, 0);
                gl.viewport(0, 0, RTT_WIDTH, tile.height);
                gl.clear(gl.COLOR_BUFFER_BIT);

                gl.useProgram(layer.colorShader);

                layer.style._color._preDraw(layer);

                Object.keys(layer.propertyColorTID).forEach((name, i) => {
                    gl.activeTexture(gl.TEXTURE0 + i);
                    gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[layer.propertyID[name]]);
                    gl.uniform1i(layer.colorShaderTex[i], i);
                });

                gl.enableVertexAttribArray(this.colorShaderVertex);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
                gl.vertexAttribPointer(layer.colorShaderVertex, 2, gl.FLOAT, false, 0, 0);

                gl.drawArrays(gl.TRIANGLES, 0, 3);
            });

            //WIDTH
            layer.tiles.forEach(tile => {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tile.texWidth, 0);
                gl.useProgram(layer.widthShader);
                gl.viewport(0, 0, RTT_WIDTH, tile.height);
                gl.clear(gl.COLOR_BUFFER_BIT);

                layer.style._width._preDraw(layer);
                Object.keys(layer.propertyWidthTID).forEach((name, i) => {
                    gl.activeTexture(gl.TEXTURE0 + i);
                    gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[layer.propertyID[name]]);
                    gl.uniform1i(layer.widthShaderTex[i], i);
                });

                gl.enableVertexAttribArray(layer.widthShaderVertex);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
                gl.vertexAttribPointer(layer.widthShaderVertex, 2, gl.FLOAT, false, 0, 0);

                gl.drawArrays(gl.TRIANGLES, 0, 3);

                layer.style.updated = false;
                tile.initialized = true;
            });

        }

        gl.enable(gl.DEPTH_TEST);

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        gl.useProgram(this.finalRendererProgram);
        var s = 1. / this._zoom;


        layer.tiles.forEach(tile => {
            gl.uniform2f(this.vertexScaleUniformLocation, s / aspect * tile.scale, s * tile.scale);
            gl.uniform2f(this.vertexOffsetUniformLocation, s / aspect * this._center.x + tile.center.x, s * this._center.y + tile.center.y);

            gl.enableVertexAttribArray(this.vertexPositionAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, tile.vertexBuffer);
            gl.vertexAttribPointer(this.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);


            gl.enableVertexAttribArray(this.FeatureIdAttr);
            gl.bindBuffer(gl.ARRAY_BUFFER, tile.featureIDBuffer);
            gl.vertexAttribPointer(this.FeatureIdAttr, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, tile.texColor);
            gl.uniform1i(this.rendererColorTex, 0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, tile.texWidth);
            gl.uniform1i(this.rendererWidthTex, 1);

            gl.drawArrays(gl.POINTS, 0, tile.numVertex);

        });

        if (layer.style._color.isAnimated() || layer.style._width.isAnimated()) {
            window.requestAnimationFrame(refresh.bind(this));
        }
    });
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
        duration = Number(mix.replace('ms', ''));
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



function FloatBlend(a, b, mix) {
    this.a = a;
    this.b = b;
    a.parent = this;
    b.parent = this;
    if (mix.indexOf('ms') >= 0) {
        duration = Number(mix.replace('ms', ''));
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
        inline: `float${this._uniformID}/25.`
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
    if ([property, center, threshold, falloff, outputOnNegative, outputOnPositive].some(x => x === undefined || x === null)) {
        return null;
    }
    return new _Near(property, center, threshold, falloff, outputOnNegative, outputOnPositive);
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
    return {
        preface: `
        uniform float center${this._UID};
        uniform float threshold${this._UID};
        uniform float falloff${this._UID};
        uniform float positive${this._UID};
        uniform float negative${this._UID};
        `,
        inline: `mix(positive${this._UID},negative${this._UID},
                        clamp((abs(p${tid}-center${this._UID})-threshold${this._UID})/falloff${this._UID},
                            0., 1.))/25.`
    };
}
_Near.prototype._postShaderCompile = function (program) {
    this._centerLoc = gl.getUniformLocation(program, `center${this._UID}`);
    this._thresholdLoc = gl.getUniformLocation(program, `threshold${this._UID}`);
    this._falloffLoc = gl.getUniformLocation(program, `falloff${this._UID}`);
    this._positiveLoc = gl.getUniformLocation(program, `positive${this._UID}`);
    this._negativeLoc = gl.getUniformLocation(program, `negative${this._UID}`);
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
    gl.uniform1f(this._centerLoc, evalFloatUniform(this.center));
    gl.uniform1f(this._thresholdLoc, evalFloatUniform(this.threshold) / 2.);
    gl.uniform1f(this._falloffLoc, evalFloatUniform(this.falloff) / 2.);
    gl.uniform1f(this._positiveLoc, evalFloatUniform(this.outputOnPositive));
    gl.uniform1f(this._negativeLoc, evalFloatUniform(this.outputOnNegative));
}
_Near.prototype.isAnimated = function () {
    return typeof this.center === "function";
}

function RampColor(property, minKey, maxKey, values) {
    //TODO contiunuos vs discrete should be decided based on property type => cartegory vs float
    return new _RampColor(property, minKey, maxKey, values);
}

function _RampColor(property, minKey, maxKey, values) {
    this.property = property;
    this.minKey = minKey;
    this.maxKey = maxKey;
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


function Style(layer) {
    this.layer = layer;
    this.updated = true;

    this._width = Float(3);
    this._width.parent = this;
    this._width.notify = () => {
        this.layer._compileWidthShader();
        window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer));
    };
    this._color = Color([0, 1, 0, 1]);
    this._color.parent = this;
    this._color.notify = () => {
        this.layer._compileColorShader();
        window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer));
    };
}
Style.prototype.setWidth = function (float) {
    this._width = float;
    this.updated = true;
    float.parent = this;
    float.notify = () => {
        this.layer._compileWidthShader();
        window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer));
    };
    float.notify();
}
Style.prototype.replaceChild = function (toReplace, replacer) {
    if (toReplace == this._color) {
        this._color = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    } else if (toReplace == this._width) {
        this._width = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    } else {
        console.warn('No child found');
    }
}

Style.prototype.setColor = function (color) {
    this._color = color;
    this.updated = true;
    color.parent = this;
    color.notify = () => {
        this.layer._compileColorShader();
        window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer));
    };
    color.notify();
}
Style.prototype.getWidth = function () {
    return this._width;
}
Style.prototype.getColor = function () {
    return this._color;
}

function Layer(renderer, geometryType) {
    this.renderer = renderer;
    this.geometryType = geometryType;
    this.style = new Style(this);
    this.tiles = [];
    this._compileColorShader();
    this._compileWidthShader();
    this.propertyCount = 0;
    this.propertyID = {}; //Name => PID
    this.propertyWidthTID = {}; //Name => Texture image unit ID
    this.propertyColorTID = {}; //Name => Texture image unit ID
    this.categoryMap = {};
}

Layer.prototype._compileColorShader = function () {
    console.log("Recompile color")
    var VS = compileShader(colorStylerVS, gl.VERTEX_SHADER);
    var uniformIDcounter = 0;
    var tid = {};
    const colorModifier = this.style._color._applyToShaderSource(() => uniformIDcounter++, name => {
        if (tid[name] !== undefined) {
            return tid[name];
        }
        tid[name] = Object.keys(tid).length;
        return tid[name];
    });
    //TODO check tid table size
    this.propertyColorTID = tid;
    var source = colorStylerFS;
    source = source.replace('$PREFACE', colorModifier.preface);
    source = source.replace('$COLOR', colorModifier.inline);
    //console.log(this, source);
    var FS = compileShader(source, gl.FRAGMENT_SHADER);
    this.colorShader = gl.createProgram();
    gl.attachShader(this.colorShader, VS);
    gl.attachShader(this.colorShader, FS);
    gl.linkProgram(this.colorShader);
    if (!gl.getProgramParameter(this.colorShader, gl.LINK_STATUS)) {
        console.warn('Unable to initialize the shader program: ' + gl.getProgramInfoLog(this.colorShader));
    }
    this.style._color._postShaderCompile(this.colorShader);
    this.colorShaderVertex = gl.getAttribLocation(this.colorShader, 'vertex');
    this.colorShaderTex = [];
    for (var i = 0; i < 8; i++) {
        this.colorShaderTex[i] = gl.getUniformLocation(this.colorShader, `property${i}`);
    }
}

Layer.prototype._compileWidthShader = function () {
    console.log("Recompile width", this)
    var VS = compileShader(widthStylerVS, gl.VERTEX_SHADER);
    var uniformIDcounter = 0;
    var tid = {};
    const widthModifier = this.style._width._applyToShaderSource(() => uniformIDcounter++, name => {
        if (tid[name] !== undefined) {
            return tid[name];
        }
        tid[name] = Object.keys(tid).length;
        return tid[name];
    });
    //TODO check tid table size
    this.propertyWidthTID = tid;
    var source = widthStylerFS;
    source = source.replace('$PREFACE', widthModifier.preface);
    source = source.replace('$WIDTH', widthModifier.inline);
    var FS = compileShader(source, gl.FRAGMENT_SHADER);
    this.widthShader = gl.createProgram();
    gl.attachShader(this.widthShader, VS);
    gl.attachShader(this.widthShader, FS);
    gl.linkProgram(this.widthShader);
    if (!gl.getProgramParameter(this.widthShader, gl.LINK_STATUS)) {
        console.warn('Unable to initialize the shader program: ' + gl.getProgramInfoLog(this.widthShader));
    }
    this.style._width._postShaderCompile(this.widthShader);
    this.widthShaderVertex = gl.getAttribLocation(this.widthShader, 'vertex');
    this.widthShaderTex = [];
    for (var i = 0; i < 8; i++) {
        this.widthShaderTex[i] = gl.getUniformLocation(this.widthShader, `property${i}`);
    }
}

Layer.prototype.removeTile = function (tile) {
    this.tiles = this.tiles.filter(t => t !== tile);
    console.log("REM", this.tiles)
    //TODO free GL resources
}

//TODO => setTileProperty (or geom)

Layer.prototype.addTile = function (tile) {
    this.tiles.push(tile);
    tile.propertyTex = [];

    var points = tile.geom;
    const level = 0;
    const width = RTT_WIDTH;
    tile.numVertex = points.length / 2;
    const height = Math.ceil(tile.numVertex / width);
    const border = 0;
    const srcFormat = gl.RED;
    const srcType = gl.FLOAT;
    tile.height = height;


    for (var k in tile.properties) {
        if (tile.properties.hasOwnProperty(k) && tile.properties[k].length > 0) {
            const isCategory = !Number.isFinite(tile.properties[k][0]);
            const property = tile.properties[k];
            var propertyID = this.propertyID[k];
            if (propertyID === undefined) {
                propertyID = this.propertyCount;
                this.propertyCount++;
                this.propertyID[k] = propertyID;
            }
            tile.propertyTex[propertyID] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[propertyID]);
            const pixel = new Float32Array(width * height);
            for (var i = 0; i < property.length; i++) {
                pixel[i] = property[i];
            }
            if (isCategory) {
                var map = this.categoryMap[k];
                if (!map) {
                    map = {};
                    this.categoryMap[k] = map;
                }
                for (var i = 0; i < property.length; i++) {
                    var catID = map[property[i]];
                    if (catID === undefined) {
                        map[property[i]] = Object.keys(map).length;
                        catID = map[property[i]];
                    }
                    pixel[i] = catID / 256.;
                }
            }
            gl.texImage2D(gl.TEXTURE_2D, level, gl.ALPHA,
                width, height, 0, gl.ALPHA, srcType,
                pixel);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
    }

    tile.vertexBuffer = gl.createBuffer();
    tile.featureIDBuffer = gl.createBuffer();


    tile.texColor = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tile.texColor);
    gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA,
        width, height, border, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array(4 * width * height).fill(255));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    tile.texWidth = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tile.texWidth);
    gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA,
        width, height, border, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array(4 * width * height).fill(100));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);



    var ids = new Float32Array(points.length);
    for (var i = 0; i < points.length; i += 2) {
        ids[i + 0] = ((i / 2) % width) / width;
        ids[i + 1] = Math.floor((i / 2) / width) / height;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, tile.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, tile.featureIDBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    window.requestAnimationFrame(refresh.bind(this.renderer));

    return tile;
}

function Renderer(canvas) {
    if (!gl) {
        //TODO use webgl 1
        gl = canvas.getContext('webgl');
        var ext = gl.getExtension("OES_texture_float");
        if (!ext) {
            console.error("this machine or browser does not support OES_texture_float");
        }
        if (!gl) {
            console.warn('Unable to initialize WebGL2. Your browser may not support it.');
            return null
        }
        this._initShaders();
        this._center = { x: 0, y: 0 };
        this._zoom = 1;
    }
    this.layers = [];
    this.squareBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
    var vertices = [
        10.0, -10.0,
        0.0, 10.0,
        -10.0, -10.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

Renderer.prototype.addLayer = function () {
    var layer = new Layer(this, 'points');
    this.layers.push(layer);
    return layer;
}

Renderer.prototype.getCenter = function () {
    return { x: this._center.x, y: this._center.y };
}
Renderer.prototype.setCenter = function (x, y) {
    this._center.x = x;
    this._center.y = y;
    window.requestAnimationFrame(refresh.bind(this));
}

Renderer.prototype.getZoom = function () {
    return this._zoom;
}
Renderer.prototype.setZoom = function (zoom) {
    this._zoom = zoom;
    window.requestAnimationFrame(refresh.bind(this));
}

module.exports = {
    Renderer: Renderer,
    Style: {
        Near: Near,
        Float: Float,
        Color: Color,
        RampColor: RampColor
    }
};