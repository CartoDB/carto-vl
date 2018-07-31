precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;
uniform float orderMinWidth;
uniform float orderMaxWidth;
uniform float devicePixelRatio;
uniform vec2 resolution;
uniform vec2 normalScale;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D filterTex;
//TODO order bucket texture

varying highp vec2 featureIDVar;
varying highp vec4 color;
varying highp vec2 pointCoord;

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
    featureIDVar = abs(featureID);
    color = texture2D(colorTex, abs(featureID));
    float filtering = texture2D(filterTex, abs(featureID)).a;
    color.a *= filtering;

    float size = decodeWidth(texture2D(widthTex, abs(featureID)).a);
    float fillSize = size;

    vec4 p = vec4(vertexScale*vertexPosition-vertexOffset, 0.5, 1.);
    float sizeNormalizer = (size +2.)/size;
    vec2 size2 = (2.*size+4.)*normalScale;

    if (featureID.y<0.){
        pointCoord = vec2(0.866025, -0.5)*2.*sizeNormalizer;
        p.xy += size2*vec2(0.866025, -0.5);
    }else if (featureID.x<0.){
        pointCoord = vec2(-0.866025, -0.5)*2.*sizeNormalizer;
        p.xy += size2*vec2(-0.866025, -0.5);
    }else{
        pointCoord = vec2(0., 1.)*2.*sizeNormalizer;
        p.y += size2.y;
    }
    pointCoord.y = -pointCoord.y;

    p.xy += ($symbolPlacement_inline)*size/resolution;
    if (size==0. || color.a==0. || size<orderMinWidth || size>=orderMaxWidth){
        p.x=10000.;
    }
    gl_Position  = p;
}
