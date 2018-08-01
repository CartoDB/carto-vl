precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;
attribute vec2 normal;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;
uniform vec2 normalScale;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D filterTex;

varying lowp vec4 color;

// From [0.,1.] in exponential-like form to pixels in [0., 1024.)
float decodeWidth(vec2 enc) {
  return enc.x*(255.*4.) + 4.*enc.y;
}

void main(void) {
    color = texture2D(colorTex, featureID);
    float filtering = texture2D(filterTex, featureID).a;
    color.a *= filtering;
    color.rgb *= color.a;
    float size = decodeWidth(texture2D(widthTex, featureID).rg);

    // 64 is computed based on RTT_WIDTH and the depth buffer precision
    // 64 = 2^(BUFFER_BITS)/RTT_WIDTH = 2^16/1024 = 64
    float z = mod(featureID.y, 1./64.)*63. + featureID.x / (64.);
    // Set z range (-1, 1)
    z = z * 2. - 1.;

    vec4 p = vec4(vertexScale*(vertexPosition)+normalScale*normal*size-vertexOffset, z, 1.);
    if (size==0. || color.a==0.){
        p.x=10000.;
    }
    gl_Position  = p;
}
