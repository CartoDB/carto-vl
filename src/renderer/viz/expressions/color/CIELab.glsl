#ifndef CIELAB_TO_SRGBA
#define CIELAB_TO_SRGBA

const mat3 XYZ_2_RGB = (mat3(
    3.2404542,-1.5371385,-0.4985314,
    -0.9692660, 1.8760108, 0.0415560,
    0.0556434,-0.2040259, 1.0572252
));
const float SRGB_GAMMA = 1.0 / 2.2;

vec3 rgb_to_srgb_approx(vec3 rgb) {
    return pow(rgb, vec3(SRGB_GAMMA));
}

float f1(float t){
    const float sigma = 6./29.;
    if (t>sigma){
        return t*t*t;
    }else{
        return 3.*sigma*sigma*(t-4./29.);
    }
}

vec3 cielabtoxyz(vec3 c) {
    const float xn = 95.047/100.;
    const float yn = 100./100.;
    const float zn = 108.883/100.;
    return vec3(xn*f1((c.x+16.)/116.  + c.y/500. ),
                yn*f1((c.x+16.)/116.),
                zn*f1((c.x+16.)/116.  - c.z/200. )
            );
}

vec3 xyztorgb(vec3 c){
    return c * XYZ_2_RGB;
}

vec3 xyztosrgb(vec3 c) { // FIXME naming
    return rgb_to_srgb_approx(xyztorgb(c));
}

vec4 cielabToSRGBA(vec4 cielab){
    return vec4(xyztosrgb(cielabtoxyz(
        vec3(
            clamp(cielab.r, 0., 100.),
            clamp(cielab.g, -128., 128.),
            clamp(cielab.b, -128., 128.)
        )
    )), cielab.a);
}
#endif


#ifndef SRGBA_TO_CIELAB
#define SRGBA_TO_CIELAB
vec4 sRGBToXYZ (vec4 srgba);
vec4 sRGBToLinearRGB (vec4 srgba);
float inverseGammaCorrection(float t);
vec4 XYZToCieLab (vec4 xyza);
float XYZToCieLabAux(float t);

vec4 sRGBAToCieLAB(vec4 srgba){
    return XYZToCieLab(sRGBToXYZ(srgba));
}

// Convert sRGB to CIE XYZ with the D65 white point
vec4 sRGBToXYZ (vec4 srgba) {
    // Poynton, "Frequently Asked Questions About Color," page 10
    // Wikipedia: http://en.wikipedia.org/wiki/SRGB
    // Wikipedia: http://en.wikipedia.org/wiki/CIE_1931_color_space
    vec4 rgba = sRGBToLinearRGB(srgba);
    return vec4(
        (0.4123955889674142161 * rgba.r + 0.3575834307637148171 * rgba.g + 0.1804926473817015735 * rgba.b),
        (0.2125862307855955516 * rgba.r + 0.7151703037034108499 * rgba.g + 0.07220049864333622685 * rgba.b),
        (0.01929721549174694484 * rgba.r + 0.1191838645808485318 * rgba.g + 0.9504971251315797660 * rgba.b),
        rgba.a
    );
}

vec4 sRGBToLinearRGB (vec4 srgba) {
    // http://en.wikipedia.org/wiki/SRGB
    return vec4(
        inverseGammaCorrection(srgba.r),
        inverseGammaCorrection(srgba.g),
        inverseGammaCorrection(srgba.b),
        srgba.a
    );
}

float inverseGammaCorrection(float t) {
    return t <= 0.0404482362771076 ? t / 12.92 : pow((t + 0.055) / 1.055, 2.4);
}


float WHITEPOINT_D65_X = 0.950456;
float WHITEPOINT_D65_Y = 1.0;
float WHITEPOINT_D65_Z = 1.088754;

// Convert CIE XYZ to CIE L*a*b* (CIELAB) with the D65 white point
vec4 XYZToCieLab (vec4 xyza) {
    // Wikipedia: http://en.wikipedia.org/wiki/Lab_color_space

    float xn = WHITEPOINT_D65_X;
    float yn = WHITEPOINT_D65_Y;
    float zn = WHITEPOINT_D65_Z;

    return vec4(
        116. * XYZToCieLabAux(xyza.y / yn) - 16.,
        500. * (XYZToCieLabAux(xyza.x / xn) - XYZToCieLabAux(xyza.y / yn)),
        200. * (XYZToCieLabAux(xyza.y / yn) - XYZToCieLabAux(xyza.z / zn)),
        xyza.a
    );
}

float XYZToCieLabAux(float t) {
    return t >= 8.85645167903563082e-3
            ? pow(t, 0.333333333333333) : (841.0 / 108.0) * t + 4.0 / 29.0;
}

#endif
