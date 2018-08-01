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

// From [0.,1.] in exponential-like form to pixels in [0.,255.]
float decodeWidth(float x){
    float w;
    if (x < 0.25098039215686274){ // x < 64/255
        w = 63.75 * x; // 255 * 0.25
    }else if (x < 0.5019607843137255){ // x < 128/255
        w = x*255. -48.;
    }else {
        w = x*510. -174.;
    }
    return w;
}

void main(void) {
    vec4 c;
    if (normal == vec2(0.)){
        c = texture2D(colorTex, featureID);
    }else{
        c = texture2D(strokeColorTex, featureID);
    }
    float filtering = texture2D(filterTex, featureID).a;
    c.a *= filtering;
    float size = decodeWidth(texture2D(strokeWidthTex, featureID).a);

    // 64 is computed based on RTT_WIDTH and the depth buffer precision
    // 64 = 2^(BUFFER_BITS)/RTT_WIDTH = 2^16/1024 = 64
    float z = mod(featureID.y, 1./64.)*63. + featureID.x / (64.);
    // Set z range (-1, 1)
    z = z * 2. - 1.;

    vec4 p = vec4(vertexScale*(vertexPosition)+normalScale*normal*size-vertexOffset, z, 1.);

    if (c.a==0.){
        p.x=10000.;
    }
    color = vec4(c.rgb*c.a, c.a);
    gl_Position  = p;
}
