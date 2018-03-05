
export const VS = `

precision highp float;
attribute vec2 vertex;

varying  vec2 uv;

void main(void) {
    uv = vertex*0.5+vec2(0.5);
    gl_Position = vec4(vertex, 0.5, 1.);
}
`;

export const FS = `

precision highp float;

varying  vec2 uv;

uniform sampler2D aaTex;
uniform sampler2D ramp;
uniform float K;
uniform vec2 offset;
uniform vec2 scale;

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d ){
    return a + b*cos( 6.28318*(c*t+d) );
}

void main(void) {
    vec4 aa = texture2D(aaTex, vec2(0.5)+0.5*((uv*2.-vec2(1.))*scale)    +offset/2.);
    aa.a*=K;
    aa.a=log(aa.a);
    vec3 c = palette(aa.a, vec3(0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(1.0, 0.7, 0.4),
    vec3(0.0, 0.15, 0.20));
    //c= texture2D(ramp, vec2(aa.a, 0.5)).rgb;
    gl_FragColor = vec4(aa.a*c, aa.a);
    //aa;//vec4(aa.rgb*aa.a, aa.a);
}
`;
