import { clamp } from './expressions/utils';

export function sRGBToCielab (srgb) {
    return XYZToCieLab(sRGBToXYZ(srgb));
}
export function cielabToSRGB (cielab) {
    return XYZToSRGB(cielabToXYZ(cielab));
}

export function interpolateRGBAinCieLAB (rgbColorA, rgbColorB, m) {
    const cielabColorA = sRGBToCielab({
        r: rgbColorA.r / 255,
        g: rgbColorA.g / 255,
        b: rgbColorA.b / 255,
        a: rgbColorA.a
    });

    const cielabColorB = sRGBToCielab({
        r: rgbColorB.r / 255,
        g: rgbColorB.g / 255,
        b: rgbColorB.b / 255,
        a: rgbColorB.a
    });

    const cielabInterpolated = {
        l: (1 - m) * cielabColorA.l + m * cielabColorB.l,
        a: (1 - m) * cielabColorA.a + m * cielabColorB.a,
        b: (1 - m) * cielabColorA.b + m * cielabColorB.b,
        alpha: (1 - m) * cielabColorA.alpha + m * cielabColorB.alpha
    };

    const rgbaColor = cielabToSRGB(cielabInterpolated);

    return {
        r: Math.round(rgbaColor.r * 255),
        g: Math.round(rgbaColor.g * 255),
        b: Math.round(rgbaColor.b * 255),
        a: rgbaColor.a
    };
}

// Following functionality has been inspired by http://www.getreuer.info/home/colorspace
// License:
/*
License (BSD)
Copyright © 2005–2010, Pascal Getreuer
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE U
*/

// Convert sRGB to CIE XYZ with the D65 white point
function sRGBToXYZ (srgb) {
    // Poynton, "Frequently Asked Questions About Color," page 10
    // Wikipedia: http://en.wikipedia.org/wiki/SRGB
    // Wikipedia: http://en.wikipedia.org/wiki/CIE_1931_color_space
    const { r, g, b, a } = sRGBToLinearRGB(srgb);
    return {
        x: (0.4123955889674142161 * r + 0.3575834307637148171 * g + 0.1804926473817015735 * b),
        y: (0.2125862307855955516 * r + 0.7151703037034108499 * g + 0.07220049864333622685 * b),
        z: (0.01929721549174694484 * r + 0.1191838645808485318 * g + 0.9504971251315797660 * b),
        a
    };
}

function sRGBToLinearRGB ({ r, g, b, a }) {
    // http://en.wikipedia.org/wiki/SRGB
    const inverseGammaCorrection = t =>
        t <= 0.0404482362771076 ? t / 12.92 : Math.pow((t + 0.055) / 1.055, 2.4);
    return {
        r: inverseGammaCorrection(r),
        g: inverseGammaCorrection(g),
        b: inverseGammaCorrection(b),
        a
    };
}
function linearRGBToSRGB ({ r, g, b, a }) {
    // http://en.wikipedia.org/wiki/SRGB
    const gammaCorrection = t =>
        t <= 0.0031306684425005883 ? 12.92 * t : 1.055 * Math.pow(t, 0.416666666666666667) - 0.055;
    return {
        r: gammaCorrection(r),
        g: gammaCorrection(g),
        b: gammaCorrection(b),
        a
    };
}

const WHITEPOINT_D65_X = 0.950456;
const WHITEPOINT_D65_Y = 1.0;
const WHITEPOINT_D65_Z = 1.088754;

// Convert CIE XYZ to CIE L*a*b* (CIELAB) with the D65 white point
function XYZToCieLab ({ x, y, z, a }) {
    // Wikipedia: http://en.wikipedia.org/wiki/Lab_color_space

    const xn = WHITEPOINT_D65_X;
    const yn = WHITEPOINT_D65_Y;
    const zn = WHITEPOINT_D65_Z;

    const f = t =>
        t >= 8.85645167903563082e-3
            ? Math.pow(t, 0.333333333333333) : (841.0 / 108.0) * t + 4.0 / 29.0;

    return {
        l: 116 * f(y / yn) - 16,
        a: 500 * (f(x / xn) - f(y / yn)),
        b: 200 * (f(y / yn) - f(z / zn)),
        alpha: a
    };
}

// Convert CIE XYZ to sRGB with the D65 white point
function XYZToSRGB ({ x, y, z, a }) {
    // Poynton, "Frequently Asked Questions About Color," page 10
    // Wikipedia: http://en.wikipedia.org/wiki/SRGB
    // Wikipedia: http://en.wikipedia.org/wiki/CIE_1931_color_space

    // Convert XYZ to linear RGB
    const r = clamp(3.2406 * x - 1.5372 * y - 0.4986 * z, 0, 1);
    const g = clamp(-0.9689 * x + 1.8758 * y + 0.0415 * z, 0, 1);
    const b = clamp(0.0557 * x - 0.2040 * y + 1.0570 * z, 0, 1);

    return linearRGBToSRGB({ r, g, b, a });
}

// Convert CIE L*a*b* (CIELAB) to CIE XYZ with the D65 white point
function cielabToXYZ ({ l, a, b, alpha }) {
    // Wikipedia: http://en.wikipedia.org/wiki/Lab_color_space

    const f = t =>
        ((t >= 0.206896551724137931)
            ? ((t) * (t) * (t)) : (108.0 / 841.0) * ((t) - (4.0 / 29.0)));

    return {
        x: WHITEPOINT_D65_X * f((l + 16) / 116 + a / 500),
        y: WHITEPOINT_D65_Y * f((l + 16) / 116),
        z: WHITEPOINT_D65_Z * f((l + 16) / 116 - b / 200),
        a: alpha
    };
}
