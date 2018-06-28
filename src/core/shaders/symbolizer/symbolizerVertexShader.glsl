precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;
uniform float orderMinWidth;
uniform float orderMaxWidth;
uniform float devicePixelRatio;
uniform vec2 resolution;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D filterTex;
//TODO order bucket texture

varying highp vec2 featureIDVar;
varying highp vec4 color;

// From [0.,1.] in exponential-like form to pixels in [0.,255.]
float decodeWidth(float x){
    x*=255.;
    if (x < 64.){
        return x*0.25;
    }else if (x<128.){
        return (x-64.)+16.;
    }else{
        return (x-127.)*2.+80.;
    }
}

$symbolPlacement_preface
$propertyPreface

void main(void) {
    featureIDVar = featureID;
    color = texture2D(colorTex, featureID);
    float filtering = texture2D(filterTex, featureID).a;
    color.a *= filtering;

    float size = decodeWidth(texture2D(widthTex, featureID).a);
    float fillSize = size;
    if (size > 126.){
        size = 126.;
    }
    gl_PointSize = size * devicePixelRatio;

    vec4 p = vec4(vertexScale*vertexPosition-vertexOffset, 0.5, 1.);
    p.xy += ($symbolPlacement_inline)*gl_PointSize/resolution;
    if (size==0. || color.a==0. || size<orderMinWidth || size>=orderMaxWidth){
        p.x=10000.;
    }
    gl_Position  = p;
}
