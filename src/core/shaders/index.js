import * as rendererGLSL from './renderer';
import * as aaBlenderGLSL from './aaBlender';
import ShaderCache from './shader-cache';

import * as stylerGLSL from './styler';

const shaderCache = new ShaderCache();

let programID = 1;

export const styleColorGLSL = {VS: stylerGLSL.VS,
    FS: stylerGLSL.FS.replace('$style_inline', '$color_inline').replace('$style_preface', '$color_preface')
};
export const styleWidthGLSL = {VS: stylerGLSL.VS,
    FS: stylerGLSL.FS.replace('$style_inline', 'vec4(encodeWidth($width_inline))').replace('$style_preface',
        `   // From pixels in [0.,255.] to [0.,1.] in exponential-like form
        float encodeWidth(float x){
            if (x<16.){
                x = x*4.;
            }else if (x<80.){
                x = (x-16.)+64.;
            }else{
                x = (x-80.)*0.5 + 128.;
            }
            return x / 255.;
        }

        $width_preface
        ` )
};
export const styleFilterGLSL = {VS: stylerGLSL.VS,
    FS: stylerGLSL.FS.replace('$style_inline', 'vec4($filter_inline)').replace('$style_preface', '$filter_preface')
};

function compileShader(gl, sourceCode, type) {
    if (shaderCache.has(gl, sourceCode)) {
        return shaderCache.get(gl, sourceCode);
    }
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('An error occurred compiling the shaders: ' + log + '\nSource:\n' + sourceCode);
    }
    shaderCache.set(gl, sourceCode, shader);
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
    this.programID = programID++;
}

class AABlender {
    constructor(gl) {
        compileProgram.call(this, gl, aaBlenderGLSL.VS, aaBlenderGLSL.FS);
        this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
        this.readTU = gl.getUniformLocation(this.program, 'aaTex');
    }
}

class Point {
    constructor(gl) {
        compileProgram.call(this, gl, rendererGLSL.point.VS, rendererGLSL.point.FS);
        this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
        this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
        this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
        this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
        this.colorTexture = gl.getUniformLocation(this.program, 'colorTex');
        this.colorStrokeTexture = gl.getUniformLocation(this.program, 'colorStrokeTex');
        this.strokeWidthTexture = gl.getUniformLocation(this.program, 'strokeWidthTex');
        this.widthTexture = gl.getUniformLocation(this.program, 'widthTex');
        this.orderMinWidth = gl.getUniformLocation(this.program, 'orderMinWidth');
        this.orderMaxWidth = gl.getUniformLocation(this.program, 'orderMaxWidth');
        this.filterTexture = gl.getUniformLocation(this.program, 'filterTex');
        this.devicePixelRatio = gl.getUniformLocation(this.program, 'devicePixelRatio');
    }
}
class Tri {
    constructor(gl) {
        compileProgram.call(this, gl, rendererGLSL.tris.VS, rendererGLSL.tris.FS);
        this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
        this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
        this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
        this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
        this.colorTexture = gl.getUniformLocation(this.program, 'colorTex');
        this.filterTexture = gl.getUniformLocation(this.program, 'filterTex');
    }
}
class Line {
    constructor(gl) {
        compileProgram.call(this, gl, rendererGLSL.line.VS, rendererGLSL.line.FS);
        this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
        this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
        this.normalAttr = gl.getAttribLocation(this.program, 'normal');
        this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
        this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
        this.colorTexture = gl.getUniformLocation(this.program, 'colorTex');
        this.widthTexture = gl.getUniformLocation(this.program, 'widthTex');
        this.filterTexture = gl.getUniformLocation(this.program, 'filterTex');
        this.normalScale = gl.getUniformLocation(this.program, 'normalScale');
    }
}

const renderer = {
    createPointShader: function (gl) {
        return new Point(gl);
    },
    createTriShader: function (gl) {
        return new Tri(gl);
    },
    createLineShader: function (gl) {
        return new Line(gl);
    }
};

// TODO remove class nonsense

function compileProgram2(gl, glslVS, glslFS) {
    const shader = {};
    const VS = compileShader(gl, glslVS, gl.VERTEX_SHADER);
    const FS = compileShader(gl, glslFS, gl.FRAGMENT_SHADER);
    shader.program = gl.createProgram();
    gl.attachShader(shader.program, VS);
    gl.attachShader(shader.program, FS);
    gl.linkProgram(shader.program);
    gl.deleteShader(VS);
    gl.deleteShader(FS);
    if (!gl.getProgramParameter(shader.program, gl.LINK_STATUS)) {
        throw new Error('Unable to link the shader program: ' + gl.getProgramInfoLog(shader.program));
    }
    shader.programID = programID++;
    return shader;
}

export function createShader(gl, glslTemplate, codes) {
    let VS = glslTemplate.VS;
    let FS = glslTemplate.FS;

    Object.keys(codes).forEach(codeName => {
        VS = VS.replace('$' + codeName, codes[codeName]);
        FS = FS.replace('$' + codeName, codes[codeName]);
    });
    const shader = compileProgram2(gl, VS, FS);
    shader.vertexAttribute = gl.getAttribLocation(shader.program, 'vertex');
    shader.vertexPositionAttribute = gl.getAttribLocation(shader.program, 'vertexPosition');
    shader.featureIdAttr = gl.getAttribLocation(shader.program, 'featureID');
    shader.vertexScaleUniformLocation = gl.getUniformLocation(shader.program, 'vertexScale');
    shader.vertexOffsetUniformLocation = gl.getUniformLocation(shader.program, 'vertexOffset');
    shader.colorTexture = gl.getUniformLocation(shader.program, 'colorTex');
    shader.colorStrokeTexture = gl.getUniformLocation(shader.program, 'colorStrokeTex');
    shader.strokeWidthTexture = gl.getUniformLocation(shader.program, 'strokeWidthTex');
    shader.widthTexture = gl.getUniformLocation(shader.program, 'widthTex');
    shader.orderMinWidth = gl.getUniformLocation(shader.program, 'orderMinWidth');
    shader.orderMaxWidth = gl.getUniformLocation(shader.program, 'orderMaxWidth');
    shader.filterTexture = gl.getUniformLocation(shader.program, 'filterTex');
    shader.devicePixelRatio = gl.getUniformLocation(shader.program, 'devicePixelRatio');
    shader.resolution = gl.getUniformLocation(shader.program, 'resolution');
    return shader;
}

export { renderer, AABlender };
