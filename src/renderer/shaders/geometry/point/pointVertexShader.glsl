precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform float orderMinWidth;
uniform float orderMaxWidth;
uniform vec2 resolution;
uniform mat4 matrix;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D strokeColorTex;
uniform sampler2D strokeWidthTex;
uniform sampler2D filterTex;

varying highp vec4 color;
varying highp vec4 stroke;
varying highp float dp;
varying highp float fillScale;
varying highp float strokeScale;
varying highp vec2 pointCoord;

float decodeWidth(vec2 enc) {
  return enc.x*(255.*4.) + 4.*enc.y;
}

$propertyPreface
$transform_preface

vec2 transform(vec2 p){
    return $transform_inline(p*resolution*0.5)/resolution*2.;
}

void main(void) {
  color = texture2D(colorTex, abs(featureID));
  stroke = texture2D(strokeColorTex, abs(featureID));
  float filtering = texture2D(filterTex, abs(featureID)).a;
  color.a *= filtering;
  stroke.a *= filtering;
  float size = decodeWidth(texture2D(widthTex, abs(featureID)).rg);
  float fillSize = size;
  float strokeSize = decodeWidth(texture2D(strokeWidthTex, abs(featureID)).rg);
  size += strokeSize;
  fillScale = min(size / fillSize, 1.);
  strokeScale = size / max(0.001, (fillSize - strokeSize));
  if (fillScale == strokeScale) {
    stroke.a = 0.;
  }
  dp = 1.0 / (size + 1.);
  float sizeNormalizer = (size +1.)/size;

  vec4 p =  matrix*vec4(vertexPosition, 0., 1.);
  p/=p.w;
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

  if (size == 0. || (stroke.a == 0. && color.a == 0.) || size < orderMinWidth || size >= orderMaxWidth) {
    p.z = p.w*2.;
  }

  gl_Position = p;
}
