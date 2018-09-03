precision highp float;

varying vec2 uv;

vec2 featureID;

$propertyPreface
$style_preface

void main(void) {
    featureID = abs(uv);
    gl_FragColor = $style_inline;
}
