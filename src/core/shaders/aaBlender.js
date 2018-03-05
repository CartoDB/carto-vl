
export const VS = `

precision highp float;
attribute vec2 vertex;

varying  vec2 uv;

void main(void) {
    uv = vertex*0.5+vec2(0.5);
    gl_Position = vec4(vertex, 0.5, 1.);
}
`;

export const FS = `

precision highp float;

varying  vec2 uv;

uniform sampler2D aaTex;
uniform sampler2D ramp;
uniform float K;
uniform vec2 offset;
uniform vec2 scale;

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d ){
    return a + b*cos( 6.28318*(c*t+d) );
}


// Compute the 4 cubic weights for a value 'v' inside the [0,1] range,
// resulting vec4 would be equal to vec4(w0, w1, w2, w3)
// where the cubic interpolation: f(x) = w0*f_(i-1) + w1*f_(i) + w2*f_(i+1) + w3*f_(i+2)
// where 'f_(i-1)' is the function evaluated at the integer point i-1
// where 'f_(i)'   is the function evaluated at the integer point i
// where 'f_(i+1)' is the function evaluated at the integer point i+1
// where 'f_(i+2)' is the function evaluated at the integer point i+2
// being 'i' the floor of the point 'x' where we want to compute a interpolated f(x)
vec4 weight(float v){
    float v2 = v*v;
    float v3 = v*v2;

    float w0 =    -v3 + 3.*v2 - 3.*v + 1.; // 1/6*(-x³+3x²-3x+1) = 1/6*(1-x)^3
    float w1 =  3.*v3 - 6.*v2 +        4.;
    float w2 = -3.*v3 + 3.*v2 + 3.*v + 1.;
    float w3 =     v3                    ;
    return vec4(w0,w1,w2,w3)/6.;
}

vec4 textureBicubic(sampler2D sampler, vec2 texCoords, vec2 texSize){
    // Based on https://developer.nvidia.com/gpugems/GPUGems2/gpugems2_chapter20.html algorithm
    // Bi-cubic texture sampling requires 16 texture look-ups, to avoid that cost this implementation
    // Uses 4 weighted bi-linear texture look-ups.

    // We'll work on [0, textureResolution] space instead of the [0,1] space to improve readability,
    // We'll need to go back to the [0,1] space after this
    vec2 invTexSize = 1.0 / texSize;
    texCoords = texCoords * texSize - 0.5;

    // We'll use the fractional part to get the appropriate cubic weights
    vec2 texCoordsFract = fract(texCoords);
    vec2 texCoordsFloor = texCoords - texCoordsFract;

    vec4 weightsX = weight(texCoordsFract.x);
    vec4 weightsY = weight(texCoordsFract.y);

    // Compute bilinear offset to the texture coordinates by weighting the original cubic weights
    vec2 offset00 = vec2(-0.5, -0.5) + vec2(weightsX.y, weightsY.y)/vec2(weightsX.x+weightsX.y, weightsY.x+weightsY.y);
    vec2 offset01 = vec2(-0.5, +1.5) + vec2(weightsX.y, weightsY.w)/vec2(weightsX.x+weightsX.y, weightsY.z+weightsY.w);
    vec2 offset10 = vec2(+1.5, -0.5) + vec2(weightsX.w, weightsY.y)/vec2(weightsX.z+weightsX.w, weightsY.x+weightsY.y);
    vec2 offset11 = vec2(+1.5, +1.5) + vec2(weightsX.w, weightsY.w)/vec2(weightsX.z+weightsX.w, weightsY.z+weightsY.w);

    // Go back to the [0,1] texture space
    vec4 sample00 = texture2D(sampler, (texCoordsFloor.xy + offset00)*invTexSize.xy);
    vec4 sample10 = texture2D(sampler, (texCoordsFloor.xy + offset10)*invTexSize.xy);
    vec4 sample01 = texture2D(sampler, (texCoordsFloor.xy + offset01)*invTexSize.xy);
    vec4 sample11 = texture2D(sampler, (texCoordsFloor.xy + offset11)*invTexSize.xy);

    // Compute the weights of each bilinear sample.
    float wx = (weightsX.x + weightsX.y) / (weightsX.x + weightsX.y + weightsX.z + weightsX.w);
    float wy = (weightsY.x + weightsY.y) / (weightsY.x + weightsY.y + weightsY.z + weightsY.w);

    // Final weight
    return mix(
       mix(sample11, sample01, wx),
       mix(sample10, sample00, wx),
    wy);
}

void main(void) {
    vec4 aa = textureBicubic(aaTex, vec2(0.5)+0.5*((uv*2.-vec2(1.))*scale)    +offset/2., vec2(128.));
    aa.a*=K;
    aa.a=log(aa.a);
    vec3 c = palette(aa.a, vec3(0.5, 0.5, 0.5),
                            vec3(0.5, 0.5, 0.5),
                            vec3(2.0, 1.0, 0.0),
                            vec3(0.50, 0.20, 0.25)
                        );
    //c= texture2D(ramp, vec2(aa.a, 0.5)).rgb;
    gl_FragColor = vec4(aa.a*c, aa.a);
    //aa;//vec4(aa.rgb*aa.a, aa.a);
}
`;
