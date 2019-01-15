// Line Vertex Shader
precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;
attribute vec2 normal;

uniform float normalScale;
uniform vec2 resolution;
uniform mat4 matrix;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D filterTex;

varying lowp vec4 color;

float decodeWidth(vec2 enc) {
  return enc.x*(255.*4.) + 4.*enc.y;
}

$propertyPreface
$transform_preface

void main(void) {
    color = texture2D(colorTex, featureID);
    float filtering = texture2D(filterTex, featureID).a;
    color.a *= filtering;
    color.rgb *= color.a; // premultiplied-alpha
    float size = decodeWidth(texture2D(widthTex, featureID).rg);

    // 64 is computed based on RTT_WIDTH and the depth buffer precision
    // 64 = 2^(BUFFER_BITS)/RTT_WIDTH = 2^16/1024 = 64
    float z = featureID.y * 63. / 64. + featureID.x / (64.);

    // Set z range (-1, 1)
    z = z * 2. - 1.;

    vec2 n = normal*size*normalScale;
    vec4 p =  matrix*vec4(vertexPosition+n, 0., 1.);
    p/=p.w;

    p.xy = $transform_inline(p.xy*resolution)/resolution;
    if (size==0. || color.a==0.){
        p.x=10000.;
    }
    p.z=z;
    gl_Position  = p;
}
