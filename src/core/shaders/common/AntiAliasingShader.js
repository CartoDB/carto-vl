import { compileProgram } from '../utils';
import { FS, VS } from './antialiasing-glsl';

export default class AntiAliasingShader {
    constructor(gl) {
        Object.assign(this,  compileProgram(gl, VS, FS));
        this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
        this.readTU = gl.getUniformLocation(this.program, 'aaTex');
    }
}
