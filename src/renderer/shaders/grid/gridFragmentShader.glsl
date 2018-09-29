// THIS IS A GRID!!!!
precision highp float;

varying highp vec2 uv;

varying highp vec2 featureIDVar;

$propertyPreface
$color_preface

#ifndef LNGLATWMUV
    #define LNGLATWMUV
    const float PI = 3.1415926535897932384626433832795;
    const float R = 6378137.0;
    const float DEG2RAD = PI / 180.0;
    vec2 LNGLAT_WM_UV(vec2 uv, float y0, float y1, float lat0, float lat1) {
      float phi0 = lat0 * DEG2RAD;
      float phi1 = lat1 * DEG2RAD;
      float v = 1.0 - uv[1];
      v = (2.0*(atan(exp((v*(y1-y0)+y0)/R)) - PI/4.0)-phi0)/(phi1-phi0);
      return vec2(uv[0], 1.0 - v);
    }
#endif

uniform float gMinWM;
uniform float gMaxWM;
uniform float gMinLL;
uniform float gMaxLL;

void main(void) {
    gl_FragColor = $color_inline;
}
