import * as stylerGLSL from './styler';
import * as aaBlenderGLSL from './aaBlender';
import ShaderCache from './shader-cache';

import LineShader from './shaders/geometry/LineShader';
import PointShader from './shaders/geometry/PointShader';
import TriangleShader from './shaders/geometry/TriangleShader';

const shaderCache = new ShaderCache();

let programID = 1;

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

class GenericStyler {
    constructor(gl, glsl, preface, inline) {
        const VS = glsl.VS;
        let FS = glsl.FS;
        FS = FS.replace('$PREFACE', preface);
        FS = FS.replace('$INLINE', inline);
        compileProgram.call(this, gl, VS, FS);
        this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
    }
}
class Color extends GenericStyler {
    constructor(gl, preface, inline) {
        super(gl, stylerGLSL, '/*Color*/' + preface, inline);
    }
}
class Width extends GenericStyler {
    constructor(gl, preface, inline) {
        super(gl, stylerGLSL,
            `
        /*Width*/
        // From pixels in [0.,255.] to [0.,1.] in exponential-like form
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
        ` + preface,
            `vec4(encodeWidth(${inline}))`);
    }
}

class Filter extends GenericStyler {
    constructor(gl, preface, inline) {
        super(gl, stylerGLSL, '/*Filter*/' + preface, `vec4(${inline})`);
    }
}

const renderer = {
    createPointShader: function (gl) {
        return new PointShader(gl);
    },
    createTriShader: function (gl) {
        return new TriangleShader(gl);
    },
    createLineShader: function (gl) {
        return new LineShader(gl);
    }
};

const styler = {
    createColorShader: function (gl, preface, inline) {
        return new Color(gl, preface, inline);
    },
    createWidthShader: function (gl, preface, inline) {
        return new Width(gl, preface, inline);
    },
    createFilterShader: function (gl, preface, inline) {
        return new Filter(gl, preface, inline);
    }
};

export { renderer, styler, AABlender };
