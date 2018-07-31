precision highp float;

varying highp vec2 featureIDVar;
varying highp vec4 color;
varying highp vec2 pointCoord;

uniform bool overrideColor;

$symbol_preface
$propertyPreface

void main(void) {
    vec2 featureID = abs(featureIDVar);
    vec2 imageUV = pointCoord*0.5+vec2(0.5);
    vec4 symbolColor = $symbol_inline;

    vec4 c;
    if (overrideColor){
        c = color * vec4(vec3(1), symbolColor.a);
    }else{
        c = symbolColor;
    }
    if (imageUV!=clamp(imageUV, 0.,1.)){
        c.a=0.;
    }

    gl_FragColor = vec4(c.rgb*c.a, c.a) +0.*vec4(0.,0.3,0.,0.4);
}
