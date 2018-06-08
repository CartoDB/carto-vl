import { compileProgram } from '../utils';
import { VS, FS } from './line-glsl';


export default class LineShader {
    constructor(gl) {
        Object.assign(this,  compileProgram(gl, VS, FS));
        this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
        this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
        this.normalAttr = gl.getAttribLocation(this.program, 'normal');
        this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
        this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
        this.colorTexture = gl.getUniformLocation(this.program, 'colorTex');
        this.widthTexture = gl.getUniformLocation(this.program, 'widthTex');
        this.filterTexture = gl.getUniformLocation(this.program, 'filterTex');
        this.normalScale = gl.getUniformLocation(this.program, 'normalScale');
    }
}
