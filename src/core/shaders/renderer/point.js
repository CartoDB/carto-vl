//TODO performance optimization: direct stroke/color/widths from uniform instead of texture read when possible

/*
    Antialiasing

    I think that the current antialiasing method is correct.
    It is certainly fast since it uses the distance to the circumference.
    The results have been checked against a reference 4x4 sampling method.

    The vertex shader is responsible for the oversizing of the points to "enable" conservative rasterization.
    See https://developer.nvidia.com/content/dont-be-conservative-conservative-rasterization
    This oversizing requires a change of the coordinate space that must be reverted in the fragment shader.
    This is done with `sizeNormalizer`.


    Debugging antialiasing is hard. I'm gonna leave here a few helpers:

    float referenceAntialias(vec2 p){
        float alpha=0.;
        for (float x=-0.75; x<1.; x+=0.5){
            for (float y=-0.75; y<1.; y+=0.5){
                vec2 p2 = p + vec2(x,y)*dp;
                if (length(p2)<1.){
                    alpha+=1.;
                }
            }
        }
        return alpha/16.;
    }
    float noAntialias(vec2 p){
        if (length(p)<1.){
            return 1.;
        }
        return 0.;
    }

    Use this to check that the affected antiliased pixels are ok:

    if (c.a==1.||c.a==0.){
        gl_FragColor = vec4(1,0,0,1);
        return;
    }

 */

export const VS = `

precision highp float;

attribute vec2 vertexPosition;
attribute vec2 featureID;

uniform vec2 vertexScale;
uniform vec2 vertexOffset;
uniform float orderMinWidth;
uniform float orderMaxWidth;

uniform sampler2D colorTex;
uniform sampler2D widthTex;
uniform sampler2D colorStrokeTex;
uniform sampler2D strokeWidthTex;
uniform sampler2D filterTex;
//TODO order bucket texture

varying highp vec4 color;
varying highp vec4 stroke;
varying highp float dp;
varying highp float sizeNormalizer;
varying highp float fillScale;
varying highp float strokeScale;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void) {
    color = texture2D(colorTex, featureID);
    stroke = texture2D(colorStrokeTex, featureID);
    float filtering = texture2D(filterTex, featureID).a;
    color.a *= filtering;
    stroke.a *= filtering;

    float size = 64.*texture2D(widthTex, featureID).a;
    float fillSize = size;
    float strokeSize = 64.*texture2D(strokeWidthTex, featureID).a;
    size+=strokeSize*0.5;
    fillScale=size/fillSize;
    strokeScale=size/max(0.001, (fillSize-strokeSize*0.5));
    if (fillScale==strokeScale){
        stroke.a=0.;
    }
    gl_PointSize = 1.;
    dp = 1.0/(size+1.);
    sizeNormalizer = (size+1.)/(size);

    vec4 p = vec4(vertexScale*vertexPosition-vertexOffset, 0.5, 1.);
    if (size==0. || (stroke.a==0. && color.a==0.) || size<orderMinWidth || size>orderMaxWidth){
        p.x=10000.;
    }
    vec2 k = vec2(16, 16);
    //p.xy=vec2(floor(p.x*k.x)/k.x, floor(p.y*k.y)/k.y);
    gl_Position  = p;//+vec4(rand(featureID), rand(featureID.yx), 0., 0.)/100.*0.;
}`;

export const FS = `
precision highp float;

varying lowp vec4 color;
varying lowp vec4 stroke;
varying highp float dp;
varying highp float sizeNormalizer;
varying highp float fillScale;
varying highp float strokeScale;

float distanceAntialias(vec2 p){
    return 1. - smoothstep(1.-dp*1.4142, 1.+dp*1.4142, length(p));
}

float n(vec2 p){
    return 1.;
}

void main(void) {
    vec2 p = (2.*gl_PointCoord-vec2(1.))*sizeNormalizer;
    vec4 c = color;

    vec4 s = stroke;

    c.a *= distanceAntialias(p*fillScale);
    c.rgb*=c.a;

    s.a *= distanceAntialias(p);
    s.a *= 1.-distanceAntialias((strokeScale)*p);
    s.rgb*=s.a;

    c=s+(1.-s.a)*c;

    gl_FragColor = vec4(n(2.*gl_PointCoord-vec2(1.)) /255.);
}`;