import stylerVertexShader from './styler-vertex-shader.glsl';
import stylerFragmentShader from './styler-fragment-shader.glsl';
import stylerEncodeWidth from './styler-encode-width.glsl';

export const colorShader = {
    vertexShader: `${stylerVertexShader}`,
    fragmentShader: `${stylerFragmentShader}`
        .replace('$style_inline', '$color_inline')
        .replace('$style_preface', '$color_preface')
};

export const filterShader = {
    vertexShader: `${stylerVertexShader}`,
    fragmentShader: `${stylerFragmentShader}`
        .replace('$style_inline', 'vec4($filter_inline)')
        .replace('$style_preface', '$filter_preface')
};

export const widthShader = {
    vertexShader: `${stylerVertexShader}`,
    fragmentShader: `${stylerFragmentShader}`
        .replace('$style_inline', 'vec4(encodeWidth($width_inline))')
        .replace('$style_preface', `${stylerEncodeWidth}`)
};
