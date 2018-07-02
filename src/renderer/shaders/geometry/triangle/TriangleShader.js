import { compileProgram } from '../../utils';
import triangleVertexShader from './triangleVertexShader.glsl';
import triangleFragmentShader from './triangleFragmentShader.glsl';

export default class TriangleShader {
    constructor(gl) {
        Object.assign(this,  compileProgram(gl, `${triangleVertexShader}`, `${triangleFragmentShader}`));
        this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
        this.normalAttr = gl.getAttribLocation(this.program, 'normal');
        this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
        this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
        this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
        this.colorTexture = gl.getUniformLocation(this.program, 'colorTex');
        this.colorStrokeTexture = gl.getUniformLocation(this.program, 'strokeColorTex');
        this.strokeWidthTexture = gl.getUniformLocation(this.program, 'strokeWidthTex');
        this.filterTexture = gl.getUniformLocation(this.program, 'filterTex');
        this.normalScale = gl.getUniformLocation(this.program, 'normalScale');
    }
}
