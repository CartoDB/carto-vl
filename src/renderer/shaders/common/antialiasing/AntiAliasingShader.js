import { compileProgram } from '../../utils';
import antialiasingFragmentShader from './antialiasingFragmentShader.glsl';
import antialiasingVertexShader from './antialiasingVertexShader.glsl';

export default class AntiAliasingShader {
    constructor (gl) {
        Object.assign(this, compileProgram(gl, antialiasingVertexShader, antialiasingFragmentShader));
        this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
        this.readTU = gl.getUniformLocation(this.program, 'aaTex');
    }
}
