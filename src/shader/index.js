const renderer = require("./renderer");
const styler = require("./styler");
exports.styler = require("./styler");

function compileShader(gl, sourceCode, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('An error occurred compiling the shaders: ' + log + '\nSource:\n' + sourceCode);
    }
    return shader;
}

function Point(gl) {
    const VS = compileShader(gl, renderer.point.VS, gl.VERTEX_SHADER);
    const FS = compileShader(gl, renderer.point.FS, gl.FRAGMENT_SHADER);
    this.program = gl.createProgram();
    gl.attachShader(this.program, VS);
    gl.attachShader(this.program, FS);
    gl.linkProgram(this.program);
    gl.deleteShader(VS);
    gl.deleteShader(FS);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        throw new Error('Unable to link the shader program: ' + gl.getProgramInfoLog(this.program));
    }
    this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
    this.FeatureIdAttr = gl.getAttribLocation(this.program, 'featureID');
    gl.enableVertexAttribArray(this.vertexPositionAttribute);

    this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
    this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
    this.rendererColorTex = gl.getUniformLocation(this.program, 'colorTex');
    this.rendererWidthTex = gl.getUniformLocation(this.program, 'widthTex');
}

function Color(gl, preface, inline) {
    var VS = compileShader(gl, styler.color.VS, gl.VERTEX_SHADER);
    var source = styler.color.FS;
    source = source.replace('$PREFACE', preface);
    source = source.replace('$COLOR', inline);
    console.log("Recompilation of\n", source);
    var FS = compileShader(gl, source, gl.FRAGMENT_SHADER);
    if (this.program) {
        gl.deleteProgram(this.program);
    }
    this.program = gl.createProgram();
    gl.attachShader(this.program, VS);
    gl.attachShader(this.program, FS);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.warn('Unable to initialize the shader program: ' + gl.getProgramInfoLog(this.program));
    }
    this.colorShaderVertex = gl.getAttribLocation(this.program, 'vertex');
    this.colorShaderTex = [];
    for (var i = 0; i < 8; i++) {
        this.colorShaderTex[i] = gl.getUniformLocation(this.program, `property${i}`);
    }
    gl.deleteShader(VS);
    gl.deleteShader(FS);
}

function Width(gl, preface, inline) {
    var VS = compileShader(gl, styler.width.VS, gl.VERTEX_SHADER);
    var source = styler.width.FS;
    source = source.replace('$PREFACE', preface);
    source = source.replace('$WIDTH', inline);
    console.log("Recompilation of\n", source);
    var FS = compileShader(gl, source, gl.FRAGMENT_SHADER);
    if (this.program) {
        gl.deleteProgram(this.program);
    }
    this.program = gl.createProgram();
    gl.attachShader(this.program, VS);
    gl.attachShader(this.program, FS);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.warn('Unable to initialize the shader program: ' + gl.getProgramInfoLog(this.program));
    }
    this.widthShaderVertex = gl.getAttribLocation(this.program, 'vertex');
    this.widthShaderTex = [];
    for (var i = 0; i < 8; i++) {
        this.widthShaderTex[i] = gl.getUniformLocation(this.program, `property${i}`);
    }
    gl.deleteShader(VS);
    gl.deleteShader(FS);
}

exports.renderer = {
    createPointShader: function (gl) {
        return new Point(gl);
    },
    createColorShader: function (gl, preface, inline) {
        return new Color(gl, preface, inline);
    },
    createWidthShader: function (gl, preface, inline) {
        return new Width(gl, preface, inline);
    },
}