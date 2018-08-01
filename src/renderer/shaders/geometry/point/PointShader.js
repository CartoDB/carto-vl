import { compileProgram } from '../../utils';
import pointFragmentShader from './pointFragmentShader.glsl';
import pointVertexShader from './pointVertexShader.glsl';

export default class PointShader {
    constructor (gl) {
        Object.assign(this, compileProgram(gl, pointVertexShader, pointFragmentShader));
        this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
        this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
        this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
        this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
        this.colorTexture = gl.getUniformLocation(this.program, 'colorTex');
        this.colorStrokeTexture = gl.getUniformLocation(this.program, 'colorStrokeTex');
        this.strokeWidthTexture = gl.getUniformLocation(this.program, 'strokeWidthTex');
        this.widthTexture = gl.getUniformLocation(this.program, 'widthTex');
        this.orderMinWidth = gl.getUniformLocation(this.program, 'orderMinWidth');
        this.orderMaxWidth = gl.getUniformLocation(this.program, 'orderMaxWidth');
        this.filterTexture = gl.getUniformLocation(this.program, 'filterTex');
        this.normalScale = gl.getUniformLocation(this.program, 'normalScale');
    }
}
