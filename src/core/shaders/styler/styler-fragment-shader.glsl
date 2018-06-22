precision highp float

varying vec2 uv

$style_preface
$propertyPreface

void main(void) {
    vec2 featureID = uv;
    gl_FragColor = $style_inline;
}
