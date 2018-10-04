precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform float orderMinWidth;
uniform float orderMaxWidth;
uniform float devicePixelRatio;
uniform vec2 resolution;
uniform mat4 matrix;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D filterTex;
//TODO order bucket texture

varying highp vec2 featureIDVar;
varying highp vec4 color;
varying highp vec2 pointCoord;
varying highp float filtering;

float decodeWidth(vec2 enc) {
  return enc.x*(255.*4.) + 4.*enc.y;
}

$symbolPlacement_preface
$propertyPreface
$transform_preface

vec2 transform(vec2 p){
    return $transform_inline(p*resolution)/resolution;
}

void main(void) {
    featureIDVar = abs(featureID);
    color = texture2D(colorTex, abs(featureID));
    filtering = texture2D(filterTex, abs(featureID)).a;

    float size = decodeWidth(texture2D(widthTex, abs(featureID)).rg);
    float fillSize = size;

    vec4 p =  matrix*vec4(vertexPosition, 0., 1.);
    p/=p.w;
    float sizeNormalizer = (size +2.)/size;
    vec2 size2 = (2.*size+4.)/resolution;

    if (featureID.y<0.){
        pointCoord = vec2(0.866025, -0.5)*2.*sizeNormalizer;
        p.xy += transform(size2*vec2(0.866025, -0.5));
    }else if (featureID.x<0.){
        pointCoord = vec2(-0.866025, -0.5)*2.*sizeNormalizer;
        p.xy += transform(size2*vec2(-0.866025, -0.5));
    }else{
        pointCoord = vec2(0., 1.)*2.*sizeNormalizer;
        p.xy += transform(vec2(0.,size2.y));
    }
    pointCoord.y = -pointCoord.y;


    p.xy += ($symbolPlacement_inline)*size/resolution;


    vec4 noOverrideColor = vec4(0.);
    if (size==0. || (color.a==0. && color != noOverrideColor) || size<orderMinWidth || size>=orderMaxWidth){
        p.x=10000.;
    }

    gl_Position  = p;
}
