// From pixels in [0.,255.] to [0.,1.] in exponential-like form
float encodeWidth(float x) {
    x*=0.25; // Cover a maximum near 1000
    x+=4.; // Don't leave small, yet noticeable, (1-4) widths in the zero-clamped zone of the exponent
    float exponent = clamp(floor(log2(x)), 0., 7.);
    float fraction = x/pow(2., exponent) - 1.; // Result in [0,1] range
    float encodedExponent = exponent * 32.; // Skip first 5 bits
    float encodedFraction = clamp(fraction * 32., 0., 31.); // Don't overflow the first 5 bits
    return (encodedExponent + encodedFraction) / 255.;
}

$width_preface
