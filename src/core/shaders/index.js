import ShaderCache from './Cache';

import * as stylerGLSL from './styler';

const shaderCache = new ShaderCache();
import AntiAliasingShader from './common/AntiAliasingShader';

import LineShader from './geometry/LineShader';
import PointShader from './geometry/PointShader';
import TriangleShader from './geometry/TriangleShader';

import ColorShader from './style/ColorShader';
import WidthShader from './style/WidthShader';
import FilterShader from './style/FilterShader';

let programID = 0;

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

const AABlender = AntiAliasingShader;

const renderer = {
    createPointShader: gl => new PointShader(gl),
    createTriShader: gl => new TriangleShader(gl),
    createLineShader: gl => new LineShader(gl),
};

// TODO remove class nonsense

function compileProgram(gl, glslVS, glslFS) {
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
    const shader = compileProgram(gl, VS, FS);
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

const styler = {
    createColorShader: (gl, preface, inline) => new ColorShader(gl, preface, inline),
    createWidthShader: (gl, preface, inline) => new WidthShader(gl, preface, inline),
    createFilterShader: (gl, preface, inline) => new FilterShader(gl, preface, inline)
};

export { renderer, AABlender, styler };
