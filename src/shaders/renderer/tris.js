export const VS = `

precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D colorStrokeTex;
uniform sampler2D strokeWidthTex;

varying lowp vec4 color;
varying lowp vec4 stroke;
varying highp float dp;
varying highp float sizeNormalizer;
varying highp float fillScale;
varying highp float strokeScale;

void main(void) {
    color = texture2D(colorTex, featureID);
    stroke = texture2D(colorStrokeTex, featureID);

    float size = 64.*texture2D(widthTex, featureID).a;
    float fillSize = size;
    float strokeSize = 64.*texture2D(strokeWidthTex, featureID).a;
    size+=strokeSize*0.5;
    fillScale=size/fillSize;
    strokeScale=size/max(0.001, (fillSize-strokeSize*0.5));
    if (fillScale==strokeScale){
        stroke.a=0.;
    }
    //gl_PointSize = size+2.;
    dp = 1.0/(size+1.);
    sizeNormalizer = (size+1.)/(size);

    vec4 p = vec4(vertexScale*vertexPosition-vertexOffset, 0.5, 1.);
    if (size==0. || (stroke.a==0. && color.a==0.)){
        p.x=10000.;
    }
    gl_Position  = p;
}`;

export const FS = `
precision highp float;

varying lowp vec4 color;
varying lowp vec4 stroke;
varying highp float dp;
varying highp float sizeNormalizer;
varying highp float fillScale;
varying highp float strokeScale;

float distanceAntialias(vec2 p){
    return 1. - smoothstep(1.-dp*1.4142, 1.+dp*1.4142, length(p));
}


void main(void) {
    vec2 p = vec2(0.);//(2.*gl_PointCoord-vec2(1.))*sizeNormalizer;
    vec4 c = color;

    vec4 s = stroke;

    c.a *= distanceAntialias(p*fillScale);
    c.rgb*=c.a;

    s.a *= distanceAntialias(p);
    s.a *= 1.-distanceAntialias((strokeScale)*p);
    s.rgb*=s.a;

    c=s+(1.-s.a)*c;

    gl_FragColor = c;
}`;