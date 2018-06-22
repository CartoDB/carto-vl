import { compileProgram } from '../../utils';
import antialiasingVertexShader from './antialiasing-vertex-shader.glsl';
import antialiasingFragmentShader from './antialiasing-fragment-shader.glsl';

export default class AntiAliasingShader {
    constructor(gl) {
        Object.assign(this,  compileProgram(gl, antialiasingVertexShader, antialiasingFragmentShader));
        this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
        this.readTU = gl.getUniformLocation(this.program, 'aaTex');
    }
}
