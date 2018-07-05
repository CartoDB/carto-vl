precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;
attribute vec2 normal;
attribute vec2 vertexB;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;
uniform vec2 normalScale;

uniform sampler2D colorTex;
uniform sampler2D widthTex;

uniform sampler2D filterTex;

varying lowp vec4 color;
varying highp vec2 lineA;
varying highp vec2 lineB;
varying highp vec2 pos;
varying highp float width;

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
    width = size;
    vec4 p = vec4(vertexScale*(vertexPosition)+normalScale*normal*size-vertexOffset, 0.5, 1.);

    if (size==0. || color.a==0.){
        p.x=10000.;
    }



    vec2 A = vertexScale*vertexPosition-vertexOffset;
    vec2 B = vertexScale*vertexB-vertexOffset;

    if (A.x>B.x){//FIXME
        lineA = A;
        lineB = B;
    }else{
        lineB = A;
        lineA = B;
    }

    pos = p.xy;

    gl_Position  = p;
}
