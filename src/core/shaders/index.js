import AntiAliasingShader from './common/AntiAliasingShader';

import LineShader from './geometry/LineShader';
import PointShader from './geometry/PointShader';
import TriangleShader from './geometry/TriangleShader';

import ColorShader from './style/ColorShader';
import WidthShader from './style/WidthShader';
import FilterShader from './style/FilterShader';



const AABlender = AntiAliasingShader;

const renderer = {
    createPointShader: function (gl) {
        return new PointShader(gl);
    },
    createTriShader: function (gl) {
        return new TriangleShader(gl);
    },
    createLineShader: function (gl) {
        return new LineShader(gl);
    }
};

const styler = {
    createColorShader: function (gl, preface, inline) {
        return new ColorShader(gl, preface, inline);
    },
    createWidthShader: function (gl, preface, inline) {
        return new WidthShader(gl, preface, inline);
    },
    createFilterShader: function (gl, preface, inline) {
        return new FilterShader(gl, preface, inline);
    }
};

export { renderer, styler, AABlender };
