// From pixels in [0.,1023.] to [0.,1.] in exponential-like form
vec2 encodeWidth(float x) {
    float high, low;
    x = min(x, 1023.);
    high = floor(x/4.);
    low = (x-high*4.)/4.;
    return vec2(high/255., low);
}

$width_preface
