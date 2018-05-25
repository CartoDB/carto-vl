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

varying vec2 uv;

$PREFACE

void main(void) {
    vec2 featureID = uv;
    gl_FragColor = $INLINE;
}
`;
