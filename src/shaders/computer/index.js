export const VS = `

precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;

varying highp vec4 color;

$PREFACE

uniform sampler2D property0;
uniform sampler2D property1;
uniform sampler2D property2;
uniform sampler2D property3;

void main(void) {
    gl_Position  = vec4(vertexScale*vertexPosition-vertexOffset, 0.5, 1.);
    gl_PointSize = 1.;
    float p0=texture2D(property0, featureID).a;
    float p1=texture2D(property1, featureID).a;
    float p2=texture2D(property2, featureID).a;
    float p3=texture2D(property3, featureID).a;
    color = vec4($INLINE);
}`;

export const FS = `
precision highp float;

varying highp vec4 color;

void main(void) {
    vec4 c = color;
    gl_FragColor = c;
}`;