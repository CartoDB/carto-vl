
module.exports.VS = `

precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;

uniform sampler2D colorTex;
uniform sampler2D widthTex;

varying lowp vec4 color;

void main(void) {
    float size = texture2D(widthTex, featureID).a;
    vec4 p = vec4(vertexScale*vertexPosition-vertexOffset, 1.-(size*0.9+0.05), 1.);
    gl_Position  = p;
    gl_PointSize = size*25.;
    color = texture2D(colorTex, featureID);
}`;

module.exports.FS = `
precision lowp float;

varying lowp vec4 color;

void main(void) {
    //TODO fix AA (use point size)
    vec2 p = 2.*gl_PointCoord-vec2(1.);
    vec4 c = color;
    float l = length(p);
    c.a *=  1. - smoothstep(0.9, 1.1, l);
    if (c.a==0.){
        discard;
    }
    gl_FragColor = c;
}`;