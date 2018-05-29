import BaseStyleShader from './BaseStyleShader';

export default class WidthShader extends BaseStyleShader {
    constructor(gl, preface, inline) {
        super(gl, PREFACE_2 + preface, `vec4(encodeWidth(${inline}))`);
    }
}

const PREFACE_2 = `
/* Width */

// From pixels in [0.,255.] to [0.,1.] in exponential-like form
float encodeWidth(float x){
    if (x < 16.){
        x = x * 4.;
    } else if (x < 80.){
        x = (x - 16.) + 64.;
    } else{
        x = (x - 80.) * 0.5 + 128.;
    }
    return x / 255.;
}
`;
