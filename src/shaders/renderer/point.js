//TODO Discuss size scaling constant, maybe we need to remap using an exponential map
//TODO profile discard performance impact

/*
    Z coordinate, Z test and blending

    Correct blending results can only be done by ordering the points in JS.

    However, without correct blending it's possible to set the Z coordinate in this shader,
    and it's possible to base it on the point size.
*/

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

uniform sampler2D colorTex;
uniform sampler2D widthTex;

varying lowp vec4 color;
varying highp float dp;
varying highp float sizeNormalizer;

void main(void) {
    float s = texture2D(widthTex, featureID).a;
    float size = ceil(s*64.);
    vec4 p = vec4(vertexScale*vertexPosition-vertexOffset, (s*0.9+0.05)*0.+0.5, 1.);
    if (s==0.){
        p.x=10000.;
    }
    gl_Position  = p;
    gl_PointSize = size+2.;
    dp = 1.0/(size+1.);
    sizeNormalizer = (size+1.)/(size);
    color = texture2D(colorTex, featureID);
}`;

export const FS = `
precision highp float;

varying lowp vec4 color;
varying highp float dp;
varying highp float sizeNormalizer;

float distanceAntialias(vec2 p){
    return 1. - smoothstep(1.-dp*1.4142, 1.+dp*1.4142, length(p));
}


void main(void) {
    vec2 p = (2.*gl_PointCoord-vec2(1.))*sizeNormalizer;
    vec4 c = color;
    c.a *= distanceAntialias(p);
    c.rgb*=c.a;
    gl_FragColor = c;
}`;