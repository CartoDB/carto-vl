import BaseStyleShader from './BaseStyleShader';

export default class ColorShader extends BaseStyleShader {
    constructor(gl, preface, inline) {
        super(gl, '/*Color*/' + preface, inline);
    }
}
