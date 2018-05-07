export const VS = `

precision highp float;

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

varying highp vec4 color;

// From [0.,1.] in exponential-like form to pixels in [0.,255.]
float decodeWidth(float x){
    x*=255.;
    if (x < 64.){
        return x*0.25;
    }else if (x<128.){
        return (x-64.)+16.;
    }else{
        return (x-127.)*2.+80.;
    }
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

    vec4 p = vec4(vertexScale*(vertexPosition)+normalScale*normal*size-vertexOffset, 0.5, 1.);

    if (c.a==0.){
        p.x=10000.;
    }
    color = vec4(c.rgb*c.a, c.a);
    gl_Position  = p;
}`;

export const FS = `
precision highp float;

varying highp vec4 color;

void main(void) {
    gl_FragColor = color;
}`;