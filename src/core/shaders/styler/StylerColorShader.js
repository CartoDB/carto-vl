import { compileProgram } from '../utils';
import stylerVertexShader from './styler-vertex-shader.glsl';
import stylerFragmentShader from './styler-fragment-shader.glsl';

const colorShader = {
    vertexShader: stylerVertexShader,
    fragmentShader: stylerFragmentShader
        .replace('$style_inline', '$color_inline')
        .replace('$style_preface', '$color_preface')
};

export default class StylerColorShader {
    constructor(gl) {
        Object.assign(this, compileProgram(
            gl, 
            colorShader.vertexShader, 
            colorShader.fragmentShader));
    }
}
