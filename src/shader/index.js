const renderer = require("./renderer");
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

exports.renderer = {
    createPointShader: function(gl){
        return new Point(gl);
    }
}