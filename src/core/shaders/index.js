import AntiAliasingShader from './common/AntiAliasingShader';

import LineShader from './geometry/LineShader';
import PointShader from './geometry/PointShader';
import TriangleShader from './geometry/TriangleShader';

import ColorShader from './style/ColorShader';
import WidthShader from './style/WidthShader';
import FilterShader from './style/FilterShader';


const AABlender = AntiAliasingShader;

const renderer = {
    createPointShader: gl => new PointShader(gl),
    createTriShader: gl => new TriangleShader(gl),
    createLineShader: gl => new LineShader(gl),
};

const styler = {
    createColorShader: (gl, preface, inline) => new ColorShader(gl, preface, inline),
    createWidthShader: (gl, preface, inline) => new WidthShader(gl, preface, inline),
    createFilterShader: (gl, preface, inline) => new FilterShader(gl, preface, inline)
};

export { renderer, styler, AABlender };
