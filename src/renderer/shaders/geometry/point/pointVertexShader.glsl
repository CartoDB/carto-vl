precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;
uniform float orderMinWidth;
uniform float orderMaxWidth;
uniform float devicePixelRatio;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D colorStrokeTex;
uniform sampler2D strokeWidthTex;
uniform sampler2D filterTex;
//TODO order bucket texture

varying highp vec4 color;
varying highp vec4 stroke;
varying highp float dp;
varying highp float sizeNormalizer;
varying highp float fillScale;
varying highp float strokeScale;

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
  color = texture2D(colorTex, featureID);
  stroke = texture2D(colorStrokeTex, featureID);
  float filtering = texture2D(filterTex, featureID).a;
  color.a *= filtering;
  stroke.a *= filtering;

  float size = decodeWidth(texture2D(widthTex, featureID).a);
  float fillSize = size;
  float strokeSize = decodeWidth(texture2D(strokeWidthTex, featureID).a);
  size += strokeSize;
  fillScale = size / fillSize;
  strokeScale = size / max(0.001, (fillSize - strokeSize));
  if (fillScale == strokeScale) {
    stroke.a = 0.;
  }
  if (size > 126.) {
    size = 126.;
  }
  gl_PointSize = size * devicePixelRatio + 2.;
  dp = 1.0 / (size + 1.);
  sizeNormalizer = (size + 1.) / (size);

  vec4 p = vec4(vertexScale * vertexPosition - vertexOffset, 0.5, 1.);
  if (size == 0. || (stroke.a == 0. && color.a == 0.) || size < orderMinWidth || size >= orderMaxWidth) {
    p.x = 10000.;
  }
  gl_Position = p;
}
