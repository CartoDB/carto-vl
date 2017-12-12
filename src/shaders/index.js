import * as rendererGLSL from './renderer';
import * as stylerGLSL from './styler';
import * as computerGLSL from './computer';

const NUM_TEXTURE_LOCATIONS = 4;

function compileShader(gl, sourceCode, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('An error occurred compiling the shaders: ' + log + '\nSource:\n' + sourceCode);
    }
    return shader;
}

function compileProgram(gl, glslVS, glslFS) {
    const VS = compileShader(gl, glslVS, gl.VERTEX_SHADER);
    const FS = compileShader(gl, glslFS, gl.FRAGMENT_SHADER);
    this.program = gl.createProgram();
    gl.attachShader(this.program, VS);
    gl.attachShader(this.program, FS);
    gl.linkProgram(this.program);
    gl.deleteShader(VS);
    gl.deleteShader(FS);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        throw new Error('Unable to link the shader program: ' + gl.getProgramInfoLog(this.program));
    }
}

function Point(gl) {
    compileProgram.call(this, gl, rendererGLSL.point.VS, rendererGLSL.point.FS);
    this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
    this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
    this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
    this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
    this.colorTexture = gl.getUniformLocation(this.program, 'colorTex');
    this.colorStrokeTexture = gl.getUniformLocation(this.program, 'colorStrokeTex');
    this.strokeWidthTexture = gl.getUniformLocation(this.program, 'strokeWidthTex');
    this.widthTexture = gl.getUniformLocation(this.program, 'widthTex');
}
function GenericStyler(gl, glsl, preface, inline) {
    const VS = glsl.VS;
    let FS = glsl.FS;
    FS = FS.replace('$PREFACE', preface);
    FS = FS.replace('$INLINE', inline);
    //console.log(FS)
    compileProgram.call(this, gl, VS, FS);
    this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
    this.textureLocations = [];
    for (let i = 0; i < NUM_TEXTURE_LOCATIONS; i++) {
        this.textureLocations[i] = gl.getUniformLocation(this.program, `property${i}`);
    }
}
function Computer(gl, glsl, preface, inline){
    let VS = glsl.VS;
    let FS = glsl.FS;
    VS = VS.replace('$PREFACE', preface);
    VS = VS.replace('$INLINE', inline);
    //console.log(VS)
    //console.log(FS)
    compileProgram.call(this, gl, VS, FS);
    this.textureLocations = [];
    for (let i = 0; i < NUM_TEXTURE_LOCATIONS; i++) {
        this.textureLocations[i] = gl.getUniformLocation(this.program, `property${i}`);
    }
    this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
    this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
    this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
    this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
}
function computer(gl, preface, inline){
    return new Computer(gl, computerGLSL, preface, inline);
}
function Color(gl, preface, inline) {
    GenericStyler.call(this, gl, stylerGLSL, preface, inline);
}
function Width(gl, preface, inline) {
    GenericStyler.call(this, gl, stylerGLSL, preface, `vec4((${inline})/64.)`);
}

const renderer = {
    createPointShader: function (gl) {
        return new Point(gl);
    }
};

const styler = {
    createColorShader: function (gl, preface, inline) {
        return new Color(gl, preface, inline);
    },
    createWidthShader: function (gl, preface, inline) {
        return new Width(gl, preface, inline);
    }
};

export { renderer, styler, computer };
