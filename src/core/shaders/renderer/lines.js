export const VS = `

precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;
attribute vec2 normal;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D filterTex;

varying lowp vec4 color;

void main(void) {
    color = texture2D(colorTex, featureID);
    float filtering = texture2D(filterTex, featureID).a;
    color.a *= filtering;
    color.rgb *= color.a;
    float size = 64.*texture2D(widthTex, featureID).a;

    vec4 p = vec4(vertexScale*(vertexPosition+normal*0.001*size)-vertexOffset, 0.5, 1.);
    if (size==0. || color.a==0.){
        p.x=10000.;
    }
    gl_Position  = p;
}`;

export const FS = `
precision highp float;

varying lowp vec4 color;

void main(void) {
    gl_FragColor = color;
}`;
