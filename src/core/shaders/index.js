import * as rendererGLSL from './renderer';
import * as stylerGLSL from './styler';
import * as aaBlenderGLSL from './aaBlender';
import ShaderCache from './shader-cache';

const NUM_TEXTURE_LOCATIONS = 4;
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
class GenericStyler {
    constructor(gl, glsl, preface, inline) {
        const VS = glsl.VS;
        let FS = glsl.FS;
        FS = FS.replace('$PREFACE', preface);
        FS = FS.replace('$INLINE', inline);
        compileProgram.call(this, gl, VS, FS);
        this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
        this.textureLocations = [];
        for (let i = 0; i < NUM_TEXTURE_LOCATIONS; i++) {
            this.textureLocations[i] = gl.getUniformLocation(this.program, `property${i}`);
        }
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
        return new Point(gl);
    },
    createTriShader: function (gl) {
        return new Tri(gl);
    },
    createLineShader: function (gl) {
        return new Line(gl);
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
