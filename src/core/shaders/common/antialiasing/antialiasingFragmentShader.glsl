precision highp float;

varying  vec2 uv;

uniform sampler2D aaTex;

void main(void) {
    vec4 aa = texture2D(aaTex, uv);
    gl_FragColor = aa;
}
