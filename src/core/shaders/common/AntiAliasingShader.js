import { compileProgram } from '../utils';
import { FS, VS } from './antialiasing-glsl';

export default class AntiAliasingShader {
    constructor(gl) {
        const { program, programID } = compileProgram(gl, VS, FS);
        this.program = program;
        this.programID = programID;
        this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
        this.readTU = gl.getUniformLocation(this.program, 'aaTex');
    }
}
