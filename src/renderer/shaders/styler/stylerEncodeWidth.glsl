vec2 encodeWidth(float x) {
    if (!(x<=0. || x>=0.) ){
        // Convert NaN widths to `0`
        // Do not remove this, some GPUs will convert NaN floats to 1. when
        // packing the shader output to a RGBA UNSIGNED BYTE textures
        x = 0.;
    }
    float high, low;
    x = clamp(x, 0., 1023.);
    high = floor(x/4.);
    low = (x-high*4.)/4.;
    return vec2(high/255., low);
}

$width_preface
