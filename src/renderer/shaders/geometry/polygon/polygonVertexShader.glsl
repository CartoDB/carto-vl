precision mediump float;

attribute vec2 vertexPosition;
attribute vec2 featureID;
attribute vec2 normal;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;
uniform vec2 normalScale;

uniform sampler2D colorTex;
uniform sampler2D strokeColorTex;
uniform sampler2D strokeWidthTex;
uniform sampler2D filterTex;

varying lowp vec4 color;

float decodeWidth(vec2 enc) {
  return enc.x*(255.*4.) + 4.*enc.y;
}

$propertyPreface
$transform_preface

void main(void) {
    // 64 is computed based on RTT_WIDTH and the depth buffer precision
    // 64 = 2^(BUFFER_BITS)/RTT_WIDTH = 2^16/1024 = 64
    float z = featureID.y * 63. / 64. + featureID.x / 64.;

    vec4 c;
    if (normal == vec2(0.)){
        c = texture2D(colorTex, featureID);
    }else{
        z = mod(z + (z > 0.5 ? -1./64. : 1./64.), 1.);
        c = texture2D(strokeColorTex, featureID);
    }
    z = 2.*z - 1.;
    float filtering = texture2D(filterTex, featureID).a;
    c.a *= filtering;
    float size = decodeWidth(texture2D(strokeWidthTex, featureID).rg);

    vec4 p = vec4(vertexScale*(vertexPosition)+normalScale*normal*size-vertexOffset, z, 1.);
    p.xy += normalScale*($transform_inline);

    if (c.a==0.){
        p.x=10000.;
    }
    color = vec4(c.rgb*c.a, c.a);
    gl_Position  = p;
}
