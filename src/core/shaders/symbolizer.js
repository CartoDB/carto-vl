
export const symbolizerGLSL = {
    VS: `

precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;
uniform float orderMinWidth;
uniform float orderMaxWidth;
uniform float devicePixelRatio;
uniform vec2 resolution;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D colorStrokeTex;
uniform sampler2D strokeWidthTex;
uniform sampler2D filterTex;
//TODO order bucket texture

varying highp vec2 featureIDVar;
varying highp vec4 color;
varying highp vec4 stroke;
varying highp float fillScale;
varying highp float strokeScale;

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

$symbolPlacement_preface
$propertyPreface

void main(void) {
    featureIDVar = featureID;
    color = texture2D(colorTex, featureID);
    stroke = texture2D(colorStrokeTex, featureID);
    float filtering = texture2D(filterTex, featureID).a;
    color.a *= filtering;
    stroke.a *= filtering;

    float size = decodeWidth(texture2D(widthTex, featureID).a);
    float fillSize = size;
    float strokeSize = decodeWidth(texture2D(strokeWidthTex, featureID).a);
    size+=strokeSize;
    fillScale=size/fillSize;
    strokeScale=size/max(0.001, (fillSize-strokeSize));
    if (fillScale==strokeScale){
        stroke.a=0.;
    }
    if (size > 126.){
        size = 126.;
    }
    gl_PointSize = size * devicePixelRatio;

    vec4 p = vec4(vertexScale*vertexPosition-vertexOffset, 0.5, 1.);
    p.xy -= ($symbolPlacement_inline)*gl_PointSize/resolution;
    if (size==0. || (stroke.a==0. && color.a==0.) || size<orderMinWidth || size>=orderMaxWidth){
        p.x=10000.;
    }
    gl_Position  = p;
}`,

    FS: `
precision highp float;

varying highp vec2 featureIDVar;
varying highp vec4 color;
varying highp vec4 stroke;

$symbol_preface
$propertyPreface

void main(void) {
    vec2 featureID = featureIDVar;
    vec2 spriteUV = gl_PointCoord.xy;
    // Ignore RGB channels from the symbol, just use the alpha one
    vec4 c = color*vec4(vec3(1), ($symbol_inline).a);
    gl_FragColor = vec4(c.rgb*c.a, c.a);
}`
};
