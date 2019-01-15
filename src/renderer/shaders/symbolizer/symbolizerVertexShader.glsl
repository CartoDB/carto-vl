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
    return $transform_inline(2.*p)/resolution;
}

// We'll need a square inscribed in a triangle
// The triangle will be equilateral
// The square side length will be equal to 1
// Each triangle edge length will be equal to 1+2*A (by definition of A)
// The triangle height will be equal to H by definition
// The square inscription will generate 3 smaller triangles
// Each one of these will have an hypotenuse equal to Y
//
// Therefore:
// Y*sin(60) = 1  =>  Y = 2 / sqrt(3)
// A=Y*cos(60)    =>  A = 1 / sqrt(3)
// tan(60) = H / (0.5 + A)   =>  H = sqrt(3)*(0.5 + 1 / sqrt(3))
#define A (0.577350269189625)
#define H (1.86603)

void main(void) {
    featureIDVar = abs(featureID);
    color = texture2D(colorTex, abs(featureID));
    filtering = texture2D(filterTex, abs(featureID)).a;

    float size = decodeWidth(texture2D(widthTex, abs(featureID)).rg);

    vec4 p =  matrix*vec4(vertexPosition, 0., 1.);
    p/=p.w;

    if (featureID.y<0.){
        pointCoord = vec2((0.5+A)/(0.5), 0.);
        p.xy += transform(size*vec2(0.5+A, -H/2. + (H/2. - 0.5) ));
    }else if (featureID.x<0.){
        pointCoord = vec2(-(0.5+A)/(0.5), 0.);
        p.xy += transform(size*vec2(-(0.5+A), -H/2. + (H/2. - 0.5)));
    }else{
        pointCoord = vec2(0., H);
        p.xy += transform(size*vec2(0., H/2. + (H/2. - 0.5)));
    }
    pointCoord.y = 1.-pointCoord.y;


    p.xy += ($symbolPlacement_inline)*size/resolution;


    vec4 noOverrideColor = vec4(1., 1., 1., 0.);
    bool alphaButNotOverrideColor = (color.a==0. && color != noOverrideColor);

    if (size==0. || alphaButNotOverrideColor || size<orderMinWidth || size>=orderMaxWidth){
        p.x=10000.;
    }

    gl_Position  = p;
}
