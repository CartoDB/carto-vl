import { compileProgram } from '../utils';
import stylerVertexShader from './styler-vertex-shader.glsl';
import stylerFragmentShader from './styler-fragment-shader.glsl';
import stylerEncodeWidth from './styler-encode-width.glsl';

const widthShader = {
    vertexShader: stylerVertexShader,
    fragmentShader: stylerFragmentShader
        .replace('$style_inline', 'vec4(encodeWidth($width_inline))')
        .replace('$style_preface', `${stylerEncodeWidth} $width_preface`)
};

export default class StylerWidthShader {
    constructor(gl) {
        Object.assign(this, compileProgram(
            gl, 
            widthShader.vertexShader, 
            widthShader.fragmentShader));
    }
}
