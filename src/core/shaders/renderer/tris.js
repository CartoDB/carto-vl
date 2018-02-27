export const VS = `

precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;

uniform sampler2D colorTex;
uniform sampler2D filterTex;

varying highp vec4 color;


void main(void) {
    vec4 c = texture2D(colorTex, featureID);
    float filtering = texture2D(filterTex, featureID).a;
    c.a *= filtering;
    vec4 p = vec4(vertexScale*vertexPosition-vertexOffset, 0.5, 1.);
    if (c.a==0.){
        p.x=10000.;
    }
    color = vec4(c.rgb*c.a, c.a);
    gl_Position  = p;
}`;

export const FS = `
precision highp float;

varying highp vec4 color;

void main(void) {
    gl_FragColor = color;
}`;