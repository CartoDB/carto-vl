precision highp float;

varying lowp vec4 color;
varying lowp vec4 stroke;
varying highp float dp;
varying highp float fillScale;
varying highp float strokeScale;
varying highp vec2 pointCoord;

float distanceAntialias(vec2 p){
    // return length(p) > 1 ? 0. : 1. ; // to disable antialias
    return 1. - smoothstep(1.-dp*1.4142, 1.+dp*1.4142, length(p));
}

void main(void) {
    vec2 p = pointCoord;
    vec4 c = color;

    vec4 s = stroke;

    c.a *= distanceAntialias(p*fillScale);
    c.rgb*=c.a;

    s.a *= distanceAntialias(p);
    s.a *= 1.-distanceAntialias((strokeScale)*p);
    s.rgb*=s.a;

    c=s+(1.-s.a)*c;

    gl_FragColor = c;
}
