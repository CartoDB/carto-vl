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

vec3 xyztosrgb(vec3 c) {
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
