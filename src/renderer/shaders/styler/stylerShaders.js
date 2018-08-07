import stylerEncodeWidth from './stylerEncodeWidth.glsl';
import stylerFragmentShader from './stylerFragmentShader.glsl';
import stylerVertexShader from './stylerVertexShader.glsl';

export const colorShaderGLSL = {
    vertexShader: `${stylerVertexShader}`,
    fragmentShader: `${stylerFragmentShader}`
        .replace('$style_inline', '$color_inline')
        .replace('$style_preface', '$color_preface')
};

export const filterShaderGLSL = {
    vertexShader: `${stylerVertexShader}`,
    fragmentShader: `${stylerFragmentShader}`
        .replace('$style_inline', 'vec4($filter_inline)')
        .replace('$style_preface', '$filter_preface')
};

export const widthShaderGLSL = {
    vertexShader: `${stylerVertexShader}`,
    fragmentShader: `${stylerFragmentShader}`
        .replace('$style_inline', 'vec4(encodeWidth($width_inline), vec2(0.))')
        .replace('$style_preface', `${stylerEncodeWidth}`)
};
