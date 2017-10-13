var gl;

String.prototype.hashCode = function () {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
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

const shaderFS = `
precision mediump float;

varying lowp vec4 color;

//http://iquilezles.org/www/articles/palettes/palettes.htm
vec3 palette(float t,vec3 a,vec3 b, vec3 c, vec3 d){
    return a + b*cos(6.28318*(c*t+d));
}
void main(void) {
    gl_FragColor = color;
}`;

const shaderVS = `
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
    var fragmentShader = compileShader(shaderFS, gl.FRAGMENT_SHADER);
    var vertexShader = compileShader(shaderVS, gl.VERTEX_SHADER);
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

Renderer.prototype.refresh = function () {
    var points = this.layer0.tiles[0].geom;
    var property0 = this.layer0.tiles[0].properties.latin_species;

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

    var vertexBuffer = gl.createBuffer();
    var colorBuffer = gl.createBuffer();
    var pointsizeBuffer = gl.createBuffer();
    var property0Buffer = gl.createBuffer();

    var colors = new Float32Array(points.length * 2);
    var pointsizes = new Float32Array(points.length / 2);

    for (var i = 0; i < points.length / 2; i++) {
        colors[4 * i + 0] = 1.;
        colors[4 * i + 3] = 1.;
        pointsizes[4 + i] = 4;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, pointsizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, pointsizes, gl.STATIC_DRAW);

    gl.useProgram(this.layer0.transformShaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, property0Buffer);
    gl.bufferData(gl.ARRAY_BUFFER, property0, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.transformIn0, 1, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(this.transformIn0);
    gl.enable(gl.RASTERIZER_DISCARD);

    this.layer0.style.color._preDraw();

    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, colorBuffer);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, pointsizeBuffer);
    gl.beginTransformFeedback(gl.POINTS);
    gl.uniform1f(this.selectedUniformLocation, this.layer0.selected);
    gl.uniform1f(this.animUniformLocation, this.layer0.anim);
    gl.drawArrays(gl.POINTS, 0, points.length / 2);
    gl.endTransformFeedback();
    gl.disable(gl.RASTERIZER_DISCARD);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null)
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null)

    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(this.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(this.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointsizeBuffer);
    gl.vertexAttribPointer(this.vertexPointSizeAttribute, 1, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(this.vertexPositionAttribute);
    gl.enableVertexAttribArray(this.vertexColorAttribute);
    gl.enableVertexAttribArray(this.vertexPointSizeAttribute);

    var s = 0.75 / this.zoom;
    gl.uniform2f(this.vertexScaleUniformLocation, s / aspect, s);
    gl.uniform2f(this.vertexOffsetUniformLocation, this.center.x, this.center.y);
    gl.drawArrays(gl.POINTS, 0, points.length / 2);
}

function UniformColor(r,g,b,a){
    this.r=r;
    this.g=g;
    this.b=b;
    this.a=a;
}

UniformColor.prototype._applyToShaderSource = function(where, shaderSource, uniformID){
    //Get uniform ID from shader
    this._uniformID=uniformID;
    //Add uniform declaration to shader
    shaderSource=shaderSource.replace('$PREFACE', `uniform vec4 color${this._uniformID};\n$PREFACE`);
    //Read from uniform in shader
    shaderSource=shaderSource.replace(where, `color${this._uniformID}`);
    return shaderSource;
}
UniformColor.prototype._postShaderCompile = function(shaderProgram){
    //Get uniform location
    this._uniformLocation=gl.getUniformLocation(shaderProgram, `color${this._uniformID}`);
}
UniformColor.prototype._preDraw = function(){
    //Set uniform
    gl.uniform4f(this._uniformLocation, this.r, this.g, this.b, this.a);
}


function UniformFloat(size){
    this.size=size;
}
UniformFloat.prototype._applyToShader = function(where, shader){
    //Get uniform ID from shader
    //Add uniform declaration to shader
    //Read from uniform in shader
}

function DiscreteRampFloat(property, keys, values, defaultValue){
    //TODO
}
function DiscreteRampColor(property, keys, values, defaultValue){
    //TODO
}

//f applies f to the input (after being re-mapped to the [0-1] range defined by minKey/maxKey)
function ContinuousRampFloat(property, minKey, maxKey, values, f='linear'){
    //TODO
}
function ContinuousRampColor(property, minKey, maxKey, values, f='linear'){
    //TODO
}


function Layer(geometryType) {
    this.geometryType=geometryType;
    this.style ={
        width: new UniformFloat(3),
        color: new UniformColor(1,1,1,1),
    }
    this._compileTransformShader();
    //for each style property => add animation utils
    // add blend(NEW_VALUE, ANIM_TIME, ANIM_BLEND_FUNC)
}

Layer.prototype._compileTransformShader = function () {
    //Apply width and color

    var transformVertexShader = compileShader(this.style.color._applyToShaderSource('$COLOR', transformVS, 0).replace('$POINTSIZE', '1.').replace('$PREFACE', ''), gl.VERTEX_SHADER);
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
