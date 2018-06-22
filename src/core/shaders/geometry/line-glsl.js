export const VS = `
#define ANTIALIASING 1.0 / DEVICE_PIXEL_RATIO / 2.0

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
    color = texture2D(colorTex, featureID);
    float filtering = texture2D(filterTex, featureID).a;
    color.a *= filtering;
    color.rgb *= color.a;
    float size = decodeWidth(texture2D(widthTex, featureID).a);

    vec4 p = vec4(vertexScale * (vertexPosition) + normalScale * normal * size - vertexOffset, 0.5, 1.);
    
    if (size==0. || color.a==0.){
        p.x=10000.;
    }

    gl_Position = p;
}`;

export const FS = `
precision highp float;

varying lowp vec4 color;

void main(void) {
    gl_FragColor = color;
}`;
