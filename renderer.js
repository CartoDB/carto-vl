var gl;

//TODO using hashes is unsafe, prefer using an autoincrement counter
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

const renderVS = `

precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;
uniform sampler2D colorTex;

varying lowp vec4 color;

void main(void) {
    gl_Position  = vec4(vertexScale*(vertexPosition-vertexOffset), 0.5, 1.);
    gl_PointSize = 10.;
    color = texture2D(colorTex, featureID);
}`;

const renderFS = `
precision lowp float;

varying lowp vec4 color;


void main(void) {
    gl_FragColor = color;
}`;


const colorStylerVS = `

precision highp float;
attribute vec2 vertex;

varying highp vec2 uv;

void main(void) {
    uv = vertex;
    gl_Position  = vec4(vertex, 0.5, 1.);
}
`;

const colorStylerFS = `

precision lowp float;

varying highp vec2 uv;

$PREFACE

uniform sampler2D property0;

void main(void) {
    gl_FragColor = vec4(texture2D(property0, uv).rrr, 1.)*$COLOR;
}
`;

var shaderProgram;

Renderer.prototype._initShaders = function () {
    var fragmentShader = compileShader(renderFS, gl.FRAGMENT_SHADER);
    var vertexShader = compileShader(renderVS, gl.VERTEX_SHADER);
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.warn('Unable to link the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    }
    this.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'vertexPosition');
    this.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'vertexColor');
    this.vertexWidthAttribute = gl.getAttribLocation(shaderProgram, 'vertexWidth');
    this.vertexScaleUniformLocation = gl.getUniformLocation(shaderProgram, 'vertexScale');
    this.vertexOffsetUniformLocation = gl.getUniformLocation(shaderProgram, 'vertexOffset');
    this.rendererColorTex = gl.getUniformLocation(shaderProgram, 'colorTex');
    this.FeatureIdAttr = gl.getAttribLocation(shaderProgram, 'featureID');
    gl.enableVertexAttribArray(this.vertexPositionAttribute);
}
function compileShader(sourceCode, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader), sourceCode);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

Renderer.prototype.refresh = refresh;
function refresh() {
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

    gl.clearColor(0.1, 0.5, 0.5, 1);//TODO this should be a renderer property
    //TODO blending with CSS and other html+css elements
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //TODO controllable
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    //TODO for each layer

    if (this.layer0.style.updated || this.layer0.style._color.isAnimated() || this.layer0.style._width.isAnimated() || !this.layer0.tiles.every(t => t.initialized)) {
        //TODO refactor
        /*gl.useProgram(this.layer0.transformShaderProgram);
        this.layer0.style._width._preDraw();
        gl.enableVertexAttribArray(this.transformIn0);
        gl.enable(gl.RASTERIZER_DISCARD);

        this.layer0.tiles.forEach(tile => {
            if (!(this.layer0.style.updated || this.layer0.style._color.isAnimated() ||
                this.layer0.style._width.isAnimated() || !tile.initialized)) {
                return;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, tile.property0Buffer);
            gl.vertexAttribPointer(this.transformIn0, 1, gl.FLOAT, false, 0, 0);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, tile.colorBuffer);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, tile.widthBuffer);
            gl.beginTransformFeedback(gl.POINTS);
            gl.drawArrays(gl.POINTS, 0, tile.numVertex);
            gl.endTransformFeedback();

            tile.initialized = true;
        });

        gl.disable(gl.RASTERIZER_DISCARD);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);*/

        // Render To Texture
        var tile = this.layer0.tiles[0];
        var fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tile.texColor, 0);
        //var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        //console.log(status);

        gl.useProgram(this.layer0.colorShader);

        this.layer0.style._color._preDraw();

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tile.texP0);
        gl.uniform1i(this.layer0.colorShaderTex0, 0);

        gl.enableVertexAttribArray(this.colorShaderVertex);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
        gl.vertexAttribPointer(this.layer0.colorShaderVertex, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    gl.useProgram(shaderProgram);
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

        gl.drawArrays(gl.POINTS, 0, tile.numVertex);
    });

    if (this.layer0.style._color.isAnimated() || this.layer0.style._width.isAnimated()) {
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
    this.notify();
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
    //TODO replace property0 by propertyX
    shaderSource = shaderSource.replace(where, `texture(tex${this._uniformID}, vec2(property0, 0.5)).rgba`);
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

function Style(layer) {
    this.layer = layer;
    this.updated = true;

    this._width = new UniformFloat(3);
    this._width.notify = () => { window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer)); };

    this._color = new UniformColor([0, 1, 0, 1]);
    this._color.notify = () => {
        this.layer._compileColorShader();
        window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer));
    };
}
Style.prototype.setWidth = function (float) {
    this._width = float;
    this.updated = true;
    float.notify = () => { window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer)); };
    float.notify();
}
Style.prototype.setColor = function (color) {
    this._color = color;
    this.updated = true;
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
}
Layer.prototype._compileColorShader = function () {
    var VS = compileShader(colorStylerVS, gl.VERTEX_SHADER);
    const source = this.style._color._applyToShaderSource('$COLOR', colorStylerFS, 0)
        .replace('$PREFACE', '');
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
    this.colorShaderTex0 = gl.getUniformLocation(this.colorShader, 'property0');
}

Layer.prototype.setTile = function (tileXYZ, tile) {
    this.tiles.push(tile);

    var points = tile.geom;
    var property0 = tile.properties.latin_species;

    tile.vertexBuffer = gl.createBuffer();
    tile.featureIDBuffer = gl.createBuffer();

    tile.numVertex = points.length / 2;

    tile.texP0 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tile.texP0);
    const level = 0;
    const internalFormat = gl.R32F;
    const width = 8 * 1024;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RED;
    const srcType = gl.FLOAT;
    const pixel = new Float32Array(width);
    for (var i = 0; i < property0.length; i++) {
        pixel[i] = property0[i];
    }

    gl.texImage2D(gl.TEXTURE_2D, level, gl.R32F,
        width, height, 0, gl.RED, srcType,
        pixel);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


    tile.texColor = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tile.texColor);
    gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA,
        width, height, border, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array(4 * width));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);



    var ids = new Float32Array(points.length);
    for (var i = 0; i < points.length; i += 2) {
        ids[i + 0] = ((i / 2) % width) / width;
        ids[i + 1] = 0.5;//Math.floor((i / 2) / width) / width;
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
        gl = canvas.getContext('webgl2');
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
