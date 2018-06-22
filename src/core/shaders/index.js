import * as stylerGLSL from './styler';

import AntiAliasingShader from './common/AntiAliasingShader';

import LineShader from './geometry/LineShader';
import PointShader from './geometry/PointShader';
import TriangleShader from './geometry/TriangleShader';
import { compileProgram } from './utils';

export const styleColorGLSL = {
    VS: stylerGLSL.VS,
    FS: stylerGLSL.FS.replace('$style_inline', '$color_inline').replace('$style_preface', '$color_preface')
};
export const styleWidthGLSL = {
    VS: stylerGLSL.VS,
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
export const styleFilterGLSL = {
    VS: stylerGLSL.VS,
    FS: stylerGLSL.FS.replace('$style_inline', 'vec4($filter_inline)').replace('$style_preface', '$filter_preface')
};



const AABlender = AntiAliasingShader;

const renderer = {
    createPointShader: gl => new PointShader(gl),
    createTriShader: gl => new TriangleShader(gl),
    createLineShader: gl => new LineShader(gl)
};

export function createShaderFromTemplate(gl, glslTemplate, codes) {
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
    shader.overrideColor = gl.getUniformLocation(shader.program, 'overrideColor');
    return shader;
}

export { renderer, AABlender };
