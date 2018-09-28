// THIS IS A GRID!!!!
precision highp float;

varying highp vec2 uv;

varying highp vec2 featureIDVar;

$propertyPreface
$color_preface

void main(void) {
    // FIXME: hardcoded values!
    float scale = 1.0/0.22;
    float offset = 0.0;

    // use single band texture as gray level
    // float value = scale*(texture2D(propertyTex0, uv)[0] - offset);
    // gl_FragColor = vec4(value, value, value, 1.0);
    gl_FragColor = $color_inline;
}
