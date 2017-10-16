var gl;

String.prototype.hashCode = function () {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    var f = (hash / 1000000);
    return f - Math.floor(f);
};

const transformVS = `#version 300 es

precision highp float;

in float property0;

uniform float selected;
uniform float anim;

$PREFACE

out vec4 color;
out float pointsize;

void main(void) {
    color = $COLOR;
    pointsize = $POINTSIZE;// mix(1., mix(1., 5., selected==property0), anim)
}
`;

const transformFS = `#version 300 es

void main(void) {
}
`;

const renderFS = `
precision mediump float;

varying lowp vec4 color;

//http://iquilezles.org/www/articles/palettes/palettes.htm
vec3 palette(float t,vec3 a,vec3 b, vec3 c, vec3 d){
    return a + b*cos(6.28318*(c*t+d));
}
void main(void) {
    gl_FragColor = color;
}`;

const renderVS = `
precision highp float;
attribute vec2 vertexPosition;
attribute vec4 vertexColor;
attribute float vertexPointSize;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;

varying lowp vec4 color;

void main(void) {
    gl_Position  = vec4(vertexScale*(vertexPosition-vertexOffset), 0.5, 1.);
    gl_PointSize = vertexPointSize;
    color = vertexColor;
}`;

var transformShaderProgram;
var shaderProgram;

Renderer.prototype._initShaders = function () {
    var fragmentShader = compileShader(renderFS, gl.FRAGMENT_SHADER);
    var vertexShader = compileShader(renderVS, gl.VERTEX_SHADER);
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    }
    gl.useProgram(shaderProgram);
    this.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertexPosition');
    this.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'vertexColor');
    this.vertexPointSizeAttribute = gl.getAttribLocation(shaderProgram, 'vertexPointSize');

    this.vertexScaleUniformLocation = gl.getUniformLocation(shaderProgram, 'vertexScale');
    this.vertexOffsetUniformLocation = gl.getUniformLocation(shaderProgram, 'vertexOffset');
    gl.enableVertexAttribArray(this.vertexPositionAttribute);
}
function compileShader(sourceCode, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader), sourceCode);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

Renderer.prototype.refresh = refresh;
function refresh() {
    var canvas = document.getElementById('glCanvas');
    var width = gl.canvas.clientWidth;
    var height = gl.canvas.clientHeight;
    if (gl.canvas.width != width ||
        gl.canvas.height != height) {
        gl.canvas.width = width;
        gl.canvas.height = height;
    }

    var aspect = canvas.clientWidth / canvas.clientHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    gl.clearColor(0.1, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    //TODO for each layer, for each tile

    if (this.layer0.style.color.isAnimated() || this.layer0.style.width.isAnimated()) {
        //TODO or if style has changed

        var tile = this.layer0.tiles[0];
        gl.useProgram(this.layer0.transformShaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, tile.property0Buffer);
        gl.vertexAttribPointer(this.transformIn0, 1, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(this.transformIn0);
        gl.enable(gl.RASTERIZER_DISCARD);

        this.layer0.style.color._preDraw();
        this.layer0.style.width._preDraw();

        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, tile.colorBuffer);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, tile.pointsizeBuffer);
        gl.beginTransformFeedback(gl.POINTS);
        gl.uniform1f(this.selectedUniformLocation, this.layer0.selected);
        gl.uniform1f(this.animUniformLocation, this.layer0.anim);
        gl.drawArrays(gl.POINTS, 0, tile.numVertex);
        gl.endTransformFeedback();
        gl.disable(gl.RASTERIZER_DISCARD);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null)
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null)

    }

    gl.useProgram(shaderProgram);
    var tile = this.layer0.tiles[0];

    gl.bindBuffer(gl.ARRAY_BUFFER, tile.vertexBuffer);
    gl.vertexAttribPointer(this.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tile.colorBuffer);
    gl.vertexAttribPointer(this.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tile.pointsizeBuffer);
    gl.vertexAttribPointer(this.vertexPointSizeAttribute, 1, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(this.vertexPositionAttribute);
    gl.enableVertexAttribArray(this.vertexColorAttribute);
    gl.enableVertexAttribArray(this.vertexPointSizeAttribute);

    var s = 0.75 / this.zoom;
    gl.uniform2f(this.vertexScaleUniformLocation, s / aspect, s);
    gl.uniform2f(this.vertexOffsetUniformLocation, this.center.x, this.center.y);
    gl.drawArrays(gl.POINTS, 0, tile.numVertex);

    if (this.layer0.style.color.isAnimated() || this.layer0.style.width.isAnimated()) {
        console.log(this.layer0.style.color.isAnimated(), this.layer0.style.width.isAnimated());
        window.requestAnimationFrame(refresh.bind(this));
    }
}

function UniformColor(color) {
    this.color = color;
}

UniformColor.prototype._applyToShaderSource = function (where, shaderSource, uniformID) {
    this._uniformID = uniformID;
    //Add uniform declaration to shader
    shaderSource = shaderSource.replace('$PREFACE', `uniform vec4 color${this._uniformID};\n$PREFACE`);
    //Read from uniform in shader
    shaderSource = shaderSource.replace(where, `color${this._uniformID}`);
    return shaderSource;
}
UniformColor.prototype._postShaderCompile = function (shaderProgram) {
    this._uniformLocation = gl.getUniformLocation(shaderProgram, `color${this._uniformID}`);
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
UniformColor.prototype.blendTo = function (finalValue, duration = 200, blendFunc = 'linear') {
    const t = Date.now();
    this.color = { a: this.color, b: finalValue, aTime: t, bTime: t + duration, blend: blendFunc };
}
UniformColor.prototype.isAnimated = function () {
    return !Array.isArray(this.color);
}

function UniformFloat(size) {
    this.expr = size;
}
UniformFloat.prototype._applyToShader = function (where, shaderSource, uniformID) {
    this._uniformID = uniformID;
    //Add uniform declaration to shader
    shaderSource = shaderSource.replace('$PREFACE', `uniform float f${this._uniformID};\n$PREFACE`);
    //Read from uniform in shader
    shaderSource = shaderSource.replace(where, `f${this._uniformID}`);
    return shaderSource;
}
UniformFloat.prototype._postShaderCompile = function (shaderProgram) {
    this._uniformLocation = gl.getUniformLocation(shaderProgram, `f${this._uniformID}`);
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
    console.log(111, this.expr);
    this.expr = simplifyFloatExpr(this.expr, t);
    const v = evalFloatExpr(this.expr, t);
    gl.uniform1f(this._uniformLocation, v);
}
UniformFloat.prototype.blendTo = function (finalValue, duration = 200, blendFunc = 'linear') {
    const t = Date.now();
    this.expr = { a: this.expr, b: finalValue, aTime: t, bTime: t + duration, blend: blendFunc };
}
UniformFloat.prototype.isAnimated = function () {
    return !Number.isFinite(this.expr);
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
    const width = 8;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array(4 * width);
    if (typeof keys[0] === 'string') {
        keys = keys.map(str => Math.floor(str.hashCode() * width));
    }
    for (var i = 0; i < width; i++) {
        pixel[4 * i + 0] = defaultValue[0];
        pixel[4 * i + 1] = defaultValue[1];
        pixel[4 * i + 2] = defaultValue[2];
        pixel[4 * i + 3] = defaultValue[3];
    }
    keys.forEach((k, index) => {
        pixel[k * 4 + 0] = 255 * values[index][0];
        pixel[k * 4 + 1] = 255 * values[index][1];
        pixel[k * 4 + 2] = 255 * values[index][2];
        pixel[k * 4 + 3] = 255 * values[index][3];
    });

    console.log(pixel)
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
}
DiscreteRampColor.prototype._applyToShaderSource = function (where, shaderSource, uniformID) {
    this._uniformID = uniformID;
    //Add uniform declaration to shader
    shaderSource = shaderSource.replace('$PREFACE', `uniform sampler2D tex${this._uniformID};\n$PREFACE`);
    //Read from uniform in shader
    //TODO repace property0 by propertyX
    shaderSource = shaderSource.replace(where, `texture(tex${this._uniformID}, vec2(property0, 0.5)).rgba`);
    console.log(shaderSource);
    return shaderSource;
}
DiscreteRampColor.prototype._postShaderCompile = function (shaderProgram) {
    this._uniformLocation = gl.getUniformLocation(shaderProgram, `tex${this._uniformID}`);
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
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this._uniformLocation, 0);
}
DiscreteRampColor.prototype.blendTo = function (finalValue, duration = 200, blendFunc = 'linear') {
    const t = Date.now();
    this.color = { a: this.color, b: finalValue, aTime: t, bTime: t + duration, blend: blendFunc };
}
DiscreteRampColor.prototype.isAnimated = function () {
    return false;
}











//f applies f to the input (after being re-mapped to the [0-1] range defined by minKey/maxKey)
//values are control-points of the output, results will be linearly interpolated between control points
function ContinuousRampFloat(property, minKey, maxKey, values, f = 'linear') {
    //TODO
}
function ContinuousRampColor(property, minKey, maxKey, values, f = 'linear') {
    //TODO
}


function Layer(geometryType) {
    this.geometryType = geometryType;
    this.style = {
        width: new UniformFloat(3),
        color: new UniformColor([1, 1, 1, 1]),
    }
    this._compileTransformShader();
    //for each style property => add animation utils
    // add blend(NEW_VALUE, ANIM_TIME, ANIM_BLEND_FUNC)
}

Layer.prototype._compileTransformShader = function () {
    //Apply width and color

    var transformVertexShader = compileShader(
        this.style.width._applyToShader('$POINTSIZE', this.style.color._applyToShaderSource('$COLOR', transformVS, 0), 1)
            .replace('$PREFACE', ''), gl.VERTEX_SHADER);
    var transformFragmentShader = compileShader(transformFS, gl.FRAGMENT_SHADER);
    this.transformShaderProgram = gl.createProgram();
    gl.attachShader(this.transformShaderProgram, transformVertexShader);
    gl.attachShader(this.transformShaderProgram, transformFragmentShader);
    gl.transformFeedbackVaryings(this.transformShaderProgram, ['color', 'pointsize'], gl.SEPARATE_ATTRIBS);
    gl.linkProgram(this.transformShaderProgram);
    if (!gl.getProgramParameter(this.transformShaderProgram, gl.LINK_STATUS)) {
        console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(this.transformShaderProgram));
    }
    this.style.color._postShaderCompile(this.transformShaderProgram);
    this.style.width._postShaderCompile(this.transformShaderProgram);
    this.selectedUniformLocation = gl.getUniformLocation(this.transformShaderProgram, 'selected');
    this.animUniformLocation = gl.getUniformLocation(this.transformShaderProgram, 'anim');
    this.transformIn0 = gl.getAttribLocation(this.transformShaderProgram, 'property0');
}

/* Example:
features{
        count : number
        geom: Float32Array()
        properties: {
            latin_species: Float32Array()
        }
}
*/
Layer.prototype.setTile = function (tileXYZ, features) {
    this.tiles = [features];
    var tile = features;

    var points = features.geom;
    var property0 = features.properties.latin_species;

    tile.vertexBuffer = gl.createBuffer();
    tile.colorBuffer = gl.createBuffer();
    tile.pointsizeBuffer = gl.createBuffer();
    tile.property0Buffer = gl.createBuffer();

    tile.numVertex = points.length / 2;

    var colors = new Float32Array(points.length * 2);
    var pointsizes = new Float32Array(points.length / 2);

    gl.bindBuffer(gl.ARRAY_BUFFER, tile.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, tile.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, tile.pointsizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, pointsizes, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, tile.property0Buffer);
    gl.bufferData(gl.ARRAY_BUFFER, property0, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

Layer.prototype.refreshStyle = function () {
    //Generate transform shader
}

function Renderer(canvas) {
    if (!gl) {
        gl = canvas.getContext('webgl2');
        if (!gl) {
            console.warn('Unable to initialize WebGL2. Your browser may not support it.');
            return null
        }
        this._initShaders();
        this.center = { x: 0, y: 0 };
        this.zoom = 1;
    }
}

Renderer.prototype.addLayer = function () {
    var layer = new Layer('points');
    this.layer0 = layer;
    return layer;
}
