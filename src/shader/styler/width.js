module.exports.VS = `

precision highp float;
attribute vec2 vertex;

varying  vec2 uv;

void main(void) {
    uv = vertex*0.5+vec2(0.5);
    gl_Position  = vec4(vertex, 0.5, 1.);
}
`;

module.exports.FS = `

precision highp float;

varying  vec2 uv;

$PREFACE

uniform sampler2D property0;
uniform sampler2D property1;
uniform sampler2D property2;
uniform sampler2D property3;

void main(void) {
    float p0=texture2D(property0, uv).a;
    float p1=texture2D(property1, uv).a;
    //float p2=texture2D(property2, uv).a;
    //float p3=texture2D(property3, uv).a;
    gl_FragColor = vec4($WIDTH);
}
`;