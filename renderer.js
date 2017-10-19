var gl;

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
    float size=4.;
    gl_Position  = vec4(vertexScale*(vertexPosition-vertexOffset), 0.5, 1.);
    gl_PointSize = texture2D(widthTex, featureID).a*10.;
    color = texture2D(colorTex, featureID);
}`;

const renderFS = `
precision mediump float;

varying lowp vec4 color;

void main(void) {
    //TODO circular AA points
    vec2 p = 2.*gl_PointCoord-vec2(1.);
    vec4 c = color;
    float l =length(p);
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
uniform sampler2D property4;
uniform sampler2D property5;
uniform sampler2D property6;
uniform sampler2D property7;


//http://iquilezles.org/www/articles/palettes/palettes.htm
vec3 palette(float t,vec3 a,vec3 b, vec3 c, vec3 d){
    return a + b*cos(6.28318*(c*t+d));
}


void main(void) {
    float p0=texture2D(property0, uv).a;
    float p1=texture2D(property1, uv).a;
    float p2=texture2D(property2, uv).a;
    float p3=texture2D(property3, uv).a;
    float p4=texture2D(property4, uv).a;
    float p5=texture2D(property5, uv).a;
    float p6=texture2D(property6, uv).a;
    float p7=texture2D(property7, uv).a;
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
    float p2=texture2D(property2, uv).a;
    float p3=texture2D(property3, uv).a;
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

    console.log('Re-render')

    var canvas = document.getElementById('glCanvas');//TODO this should be a renderer property
    var width = gl.canvas.clientWidth;
    var height = gl.canvas.clientHeight;
    if (gl.canvas.width != width ||
        gl.canvas.height != height) {
        gl.canvas.width = width;
        gl.canvas.height = height;
    }

    var aspect = canvas.clientWidth / canvas.clientHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    gl.clearColor(0.1, 0.1, 0.1, 1);//TODO this should be a renderer property
    //TODO blending with CSS and other html+css elements
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //TODO controllable


    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    //TODO for each layer
    if (this.layer0.style._color.isAnimated() || this.layer0.style._width.isAnimated() || this.layer0.style.updated) {
        //TODO refactor
        gl.disable(gl.BLEND);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        console.log("Restyle", timestamp)
        // Render To Texture
        var tile = this.layer0.tiles[0];
        var fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tile.texColor, 0);
        gl.viewport(0, 0, 1024 * 8, 16);

        //var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        //console.log(status);

        gl.useProgram(this.layer0.colorShader);

        this.layer0.style._color._preDraw();

        for (var i = 0; i < 8; i++) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[i]);
            gl.uniform1i(this.layer0.colorShaderTex[i], i);
        }

        gl.enableVertexAttribArray(this.colorShaderVertex);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
        gl.vertexAttribPointer(this.layer0.colorShaderVertex, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 3);

        //WIDTH

        fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tile.texWidth, 0);
        gl.viewport(0, 0, 1024 * 8, 16);

        //var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        //console.log(status);

        gl.useProgram(this.layer0.widthShader);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.layer0.style._width._preDraw();

        for (var i = 0; i < 8; i++) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[i]);
            gl.uniform1i(this.layer0.widthShaderTex[i], i);
        }

        gl.enableVertexAttribArray(this.layer0.widthShaderVertex);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
        gl.vertexAttribPointer(this.layer0.widthShaderVertex, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 3);


        this.layer0.style.updated = false;
        tile.initialized = true;
    }

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    gl.useProgram(this.finalRendererProgram);
    var s = 1. / this._zoom;
    gl.uniform2f(this.vertexScaleUniformLocation, s / aspect, s);
    gl.uniform2f(this.vertexOffsetUniformLocation, this._center.x, this._center.y);

    this.layer0.tiles.forEach(tile => {
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

    if (this.layer0.style._color.isAnimated() || this.layer0.style._width.isAnimated()) {
        window.requestAnimationFrame(refresh.bind(this));
    }
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
ColorBlend.prototype._applyToShaderSource = function (uniformIDMaker) {
    this._uniformID = uniformIDMaker();
    const a = this.a._applyToShaderSource(uniformIDMaker);
    const b = this.b._applyToShaderSource(uniformIDMaker);
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
ColorBlend.prototype._preDraw = function () {
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
    this.a._preDraw();
    this.b._preDraw();
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

DiscreteRampColor.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericColorBlend(this, finalValue, duration, blendFunc);
}
UniformColor.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericColorBlend(this, finalValue, duration, blendFunc);
}
ColorBlend.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericColorBlend(this, finalValue, duration, blendFunc);
}
ContinuousRampColor.prototype.blendTo = function (finalValue, duration = 500, blendFunc = 'linear') {
    genericColorBlend(this, finalValue, duration, blendFunc);
}



function UniformFloat(size) {
    this.expr = size;
}
UniformFloat.prototype._applyToShaderSource = function (uniformIDMaker) {
    this._uniformID = uniformIDMaker();
    return {
        preface: `uniform float float${this._uniformID};\n`,
        inline: `float${this._uniformID}/10.`
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
UniformFloat.prototype.blendTo = function (finalValue, duration = 200, blendFunc = 'linear') {
    const t = Date.now();
    this.expr = { a: this.expr, b: finalValue, aTime: t, bTime: t + duration, blend: blendFunc };
}


function DiscreteRampFloat(property, keys, values, defaultValue) {
    //TODO
}



function DiscreteRampColor(property, keys, values, defaultValue) {
    defaultValue = defaultValue.map(x => 255 * x);
    this.property = property;
    this.keys = keys;
    this.values = values;
    this.defaultValue = defaultValue;
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
        pixel[4 * i + 0] = defaultValue[0] * 0;
        pixel[4 * i + 1] = defaultValue[1] * 0;
        pixel[4 * i + 2] = defaultValue[2] * 0;
        pixel[4 * i + 3] = 255;
    }

    keys.forEach((k, index) => {
        pixel[k * 4 + 0] = 255 * values[index][0];
        pixel[k * 4 + 1] = 255 * values[index][1];
        pixel[k * 4 + 2] = 255 * values[index][2];
        pixel[k * 4 + 3] = 255 * values[index][3];
    });


    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}
DiscreteRampColor.prototype._applyToShaderSource = function (uniformIDMaker) {
    this._uniformID = uniformIDMaker();
    return {
        preface: `uniform sampler2D texRamp${this._uniformID};\n`,
        inline: `texture2D(texRamp${this._uniformID}, vec2((p0), 0.5)).rgba`
    };
}
DiscreteRampColor.prototype._postShaderCompile = function (program) {
    this._uniformLocation = gl.getUniformLocation(program, `texRamp${this._uniformID}`);
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
DiscreteRampColor.prototype._preDraw = function () {
    const t = Date.now();
    //this.color = simplifyColorExpr(this.color, t);
    //const color = evalColor(this.color, t);
    gl.activeTexture(gl.TEXTURE10);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this._uniformLocation, 10);
}
DiscreteRampColor.prototype.isAnimated = function () {
    return false;
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
    width: exprNear(date, SIM_TIME, 0, 4)
*/

function Near(property, center,  minVal, maxVal){
    this.property=property;
    this.center=center;
    this.minVal=minVal;
    this.maxVal=maxVal;
}

Near.prototype._applyToShaderSource = function (uniformIDMaker) {
    this._uniformID = uniformIDMaker();
    console.log(this.center)
    return {
        preface: `uniform float near${this._uniformID};\n`,
        inline: `mix(${this.maxVal},${this.minVal} , abs(p1-near${this._uniformID})/20.)/10.`
    };
}
Near.prototype._postShaderCompile = function (program) {
    this._uniformLocation = gl.getUniformLocation(program, `near${this._uniformID}`);
}
Near.prototype._preDraw = function () {
    this.center=Date.now()*0.5%4000;
    gl.uniform1f(this._uniformLocation, this.center);
}
Near.prototype.isAnimated = function () {
    return true;
}

//f applies f to the input (after being re-mapped to the [0-1] range defined by minKey/maxKey)
//values are control-points of the output, results will be linearly interpolated between control points
function ContinuousRampFloat(property, minKey, maxKey, values, f = 'linear') {
    //TODO
}

function ContinuousRampColor(property, minKey, maxKey, values, f = 'linear') {
    this.property = property;
    this.minKey = minKey;
    this.maxKey = maxKey;
    this.values = values;
    this.f = f;

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
        const vraw = values[Math.floor(i / width * values.length)];
        const v = [hexToRgb(vraw).r, hexToRgb(vraw).g, hexToRgb(vraw).b, 255];
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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

ContinuousRampColor.prototype._applyToShaderSource = function (uniformIDMaker) {
    this._uniformID = uniformIDMaker();
    return {
        preface: `uniform sampler2D texRamp${this._uniformID};\n`,
        inline: `texture2D(texRamp${this._uniformID}, vec2((p0-(${this.minKey}.))/${this.maxKey - this.minKey}., 0.5)).rgba`
        //inline: `vec4((p0-(${this.minKey}.))/${this.maxKey - this.minKey}.)`
    };
}
ContinuousRampColor.prototype._postShaderCompile = function (program) {
    this._uniformLocation = gl.getUniformLocation(program, `texRamp${this._uniformID}`);
}
ContinuousRampColor.prototype._preDraw = function () {
    gl.activeTexture(gl.TEXTURE12);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this._uniformLocation, 12);
}
ContinuousRampColor.prototype.isAnimated = function () {
    return false;
}


function Style(layer) {
    this.layer = layer;
    this.updated = true;

    this._width = new UniformFloat(3);
    this._width.parent = this;
    this._width.notify = () => {
        this.layer._compileWidthShader();
        window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer));
    };
    this._color = new UniformColor([0, 1, 0, 1]);
    this._color.parent = this;
    this._color.notify = () => {
        this.layer._compileColorShader();
        window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer));
    };
}
Style.prototype.setWidth = function (float) {
    this._width = float;
    float.parent = this;
    console.log("SET", float)
    float.notify = () => {
        this.updated = true;
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
}

Layer.prototype._compileColorShader = function () {
    console.log("Recompile color")
    var VS = compileShader(colorStylerVS, gl.VERTEX_SHADER);
    var uniformIDcounter = 0;
    const colorModifier = this.style._color._applyToShaderSource(() => uniformIDcounter++);
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
    const widthModifier = this.style._width._applyToShaderSource(() => uniformIDcounter++);
    var source = widthStylerFS;
    source = source.replace('$PREFACE', widthModifier.preface);
    source = source.replace('$WIDTH', widthModifier.inline);
    console.log(this, source);
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


Layer.prototype.setTile = function (tileXYZ, tile) {
    console.log("Tile", tile)
    this.tiles.push(tile);

    var points = tile.geom;
    var property0 = tile.properties.p0;
    var property1 = tile.properties.p1;

    tile.vertexBuffer = gl.createBuffer();
    tile.featureIDBuffer = gl.createBuffer();

    tile.numVertex = points.length / 2;

    const level = 0;
    const width = 8 * 1024;
    const height = 16;
    const border = 0;
    const srcFormat = gl.RED;
    const srcType = gl.FLOAT;


    tile.propertyTex = [];
    tile.propertyTex[0] = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[0]);

    const pixel = new Float32Array(width * height).fill(255);
    for (var i = 0; i < property0.length; i++) {
        pixel[i] = property0[i];
    }
    gl.texImage2D(gl.TEXTURE_2D, level, gl.ALPHA,
        width, height, 0, gl.ALPHA, srcType,
        pixel);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    {
        tile.propertyTex[1] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[1]);

        const pixel = new Float32Array(width * height).fill(255);
        for (var i = 0; i < property1.length; i++) {
            pixel[i] = property1[i];
        }
        gl.texImage2D(gl.TEXTURE_2D, level, gl.ALPHA,
            width, height, 0, gl.ALPHA, srcType,
            pixel);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    }


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
        new Uint8Array(4 * width * height));
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
    this.layer0 = layer;
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
