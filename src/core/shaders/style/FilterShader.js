import BaseStyleShader from './BaseStyleShader';

export default class Filter extends BaseStyleShader {
    constructor(gl, preface, inline) {
        super(gl, '/*Filter*/' + preface, `vec4(${inline})`);
    }
}
