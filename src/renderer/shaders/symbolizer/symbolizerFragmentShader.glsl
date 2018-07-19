precision highp float;

varying highp vec2 featureIDVar;
varying highp vec4 color;

uniform bool overrideColor;

$symbol_preface
$propertyPreface

void main(void) {
    vec2 featureID = featureIDVar;
    vec2 imageUV = gl_PointCoord.xy;
    vec4 symbolColor = $symbol_inline;

    vec4 c;
    if (overrideColor){
        c = color * vec4(vec3(1), symbolColor.a);
    }else{
        c = symbolColor;
    }

    gl_FragColor = vec4(c.rgb*c.a, c.a);
}
