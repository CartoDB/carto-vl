import AntiAliasingShader from './common/antialiasing/AntiAliasingShader';
import LineShader from './geometry/line/LineShader';
import PointShader from './geometry/point/PointShader';
import TriangleShader from './geometry/triangle/TriangleShader';
import StylerColorShader from './styler/StylerColorShader';
import StylerWidthShader from './styler/StylerWidthShader';
import StylerFilterShader from './styler/StylerFilterShader';

import * as symbolizer from './symbolizer/symbolizer';

const AABlender = AntiAliasingShader;

const renderer = {
    createPointShader: gl => new PointShader(gl),
    createTriShader: gl => new TriangleShader(gl),
    createLineShader: gl => new LineShader(gl),
    createStylerColorShader: gl => new StylerColorShader(gl),
    createStylerWidthShader: gl => new StylerWidthShader(gl),
    createStylerFilterShader: gl => new StylerFilterShader(gl),
};

export {
    renderer,
    symbolizer,
    AABlender
};
