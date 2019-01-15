precision highp float;

varying highp vec2 featureIDVar;
varying highp vec4 color;
varying highp vec2 pointCoord;
varying highp float filtering;

$symbol_preface
$propertyPreface

void main(void) {
    vec2 featureID = abs(featureIDVar);
    vec2 imageUV = pointCoord;
    imageUV.x = imageUV.x * 0.5 + 0.5;
    vec4 symbolColor = $symbol_inline;
    vec4 noOverrideColor = vec4(1., 1., 1., 0.);

    vec4 c;
    if (color != noOverrideColor){
        c = color * vec4(vec3(1), symbolColor.a);
    }else{
        c = symbolColor;
    }
    c.a *= filtering;
    if (imageUV!=clamp(imageUV, 0.,1.)){
        c.a = 0.;
    }

    gl_FragColor = vec4(c.rgb*c.a, c.a);
}
