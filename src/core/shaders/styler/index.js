//TODO Discuss size scaling constant, maybe we need to remap using an exponential map

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

$PREFACE

uniform sampler2D property0;
uniform sampler2D property1;
uniform sampler2D property2;
uniform sampler2D property3;

void main(void) {
    // TODO texture reads should be dynamic to improve Texture Unit utilization
    float p0=texture2D(property0, uv).a;
    float p1=texture2D(property1, uv).a;
    float p2=texture2D(property2, uv).a;
    float p3=texture2D(property3, uv).a;
    gl_FragColor = $INLINE;
}
`;
