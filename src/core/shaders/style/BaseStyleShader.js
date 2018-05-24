import { compileProgram } from '../utils';
import { FS, VS } from './style-glsl';

export default class BaseStyleShader {
    constructor(gl, preface, inline) {
        const fragmentShader = FS.replace('$PREFACE', preface).replace('$INLINE', inline);
        const { program, programID } = compileProgram(gl, VS, fragmentShader);
        this.program = program;
        this.programID = programID;
        this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
    }
}
