// From pixels in [0.,255.] to [0.,1.] in exponential-like form
float encodeWidth(float x) {
    if (x<16.){
        x = x*4.;
    }else if (x<80.){
        x = (x-16.)+64.;
    }else{
        x = (x-80.)*0.5 + 128.;
    }
    return x / 255.;
}

$width_preface
