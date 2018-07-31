precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;
uniform float orderMinWidth;
uniform float orderMaxWidth;
uniform vec2 normalScale;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D colorStrokeTex;
uniform sampler2D strokeWidthTex;
uniform sampler2D filterTex;
//TODO order bucket texture

varying highp vec4 color;
varying highp vec4 stroke;
varying highp float dp;
varying highp float fillScale;
varying highp float strokeScale;
varying highp vec2 pointCoord;

// From [0.,1.] in exponential-like form to pixels in [0.,255.]
float decodeWidth(float x) {
  float w;
  if (x < 0.25098039215686274) { // x < 64/255
    w = 63.75 * x; // 255 * 0.25
  } else if (x < 0.5019607843137255) { // x < 128/255
    w = x * 255. - 48.;
  } else {
    w = x * 510. - 174.;
  }
  return w;
}

void main(void) {
  color = texture2D(colorTex, abs(featureID));
  stroke = texture2D(colorStrokeTex, abs(featureID));
  float filtering = texture2D(filterTex, abs(featureID)).a;
  color.a *= filtering;
  stroke.a *= filtering;
  float size = decodeWidth(texture2D(widthTex, abs(featureID)).a);
  float fillSize = size;
  float strokeSize = decodeWidth(texture2D(strokeWidthTex, abs(featureID)).a);
  size += strokeSize;
  fillScale = size / fillSize;
  strokeScale = size / max(0.001, (fillSize - strokeSize));
  if (fillScale == strokeScale) {
    stroke.a = 0.;
  }
  dp = 1.0 / (size + 1.);
  float sizeNormalizer = (size +1.)/size;


  vec4 p = vec4(vertexScale * vertexPosition - vertexOffset, 0.5, 1.);

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

  if (size == 0. || (stroke.a == 0. && color.a == 0.) || size < orderMinWidth || size >= orderMaxWidth) {
    p.x = 10000.;
  }

  gl_Position = p;
}
