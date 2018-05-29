import { compileProgram } from '../utils';
import { VS, FS } from './triangle-glsl';

export default class TriangleShader {
    constructor(gl) {
        const { program, programID } = compileProgram(gl, VS, FS);
        this.program = program;
        this.programID = programID;
        this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
        this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
        this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
        this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
        this.colorTexture = gl.getUniformLocation(this.program, 'colorTex');
        this.filterTexture = gl.getUniformLocation(this.program, 'filterTex');
    }
}
