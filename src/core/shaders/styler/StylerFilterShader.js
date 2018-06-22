import { compileProgram } from '../utils';
import stylerVertexShader from './styler-vertex-shader.glsl';
import stylerFragmentShader from './styler-fragment-shader.glsl';

const filterShader = {
    vertexShader: stylerVertexShader,
    fragmentShader: stylerFragmentShader
        .replace('$style_inline', 'vec4($filter_inline)')
        .replace('$style_preface', '$filter_preface')
};

export default class StylerFilterShader {
    constructor(gl) {
        Object.assign(this, compileProgram(
            gl, 
            filterShader.vertexShader, 
            filterShader.fragmentShader));
    }
}
