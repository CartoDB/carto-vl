precision lowp float;

varying lowp vec4 color;
varying highp vec2 lineA;
varying highp vec2 lineB;
varying highp vec2 pos;
varying highp float width;

uniform float resY;

float sdCapsule( vec2 p, vec2 a, vec2 b, float r ){
    vec2 pa = p - a, ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h ) - r;
}

void main(void) {
    float f = 0.01/length(lineA-pos);
    f = sdCapsule(pos, lineA, lineB, width/resY)>0.? 0.:1.;
    float r = 0.01/length(lineA-pos);
    float g = 0.01/length(lineB-pos);
    //gl_FragColor = vec4(r,g, 0. ,r+g);
    gl_FragColor = vec4(10000.*sdCapsule(pos, lineA, lineB, width/resY));
    gl_FragColor = vec4(f*color);
}
