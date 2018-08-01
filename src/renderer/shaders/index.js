import AntiAliasingShader from './common/antialiasing/AntiAliasingShader';
import LineShader from './geometry/line/LineShader';
import PointShader from './geometry/point/PointShader';
import PolygonShader from './geometry/polygon/PolygonShader';
import * as styler from './styler/stylerShaders';
import * as symbolizer from './symbolizer/symbolizerShaders';

const AABlender = AntiAliasingShader;

const renderer = {
    createLineShader: gl => new LineShader(gl),
    createPointShader: gl => new PointShader(gl),
    createPolygonShader: gl => new PolygonShader(gl)
};

export { renderer, styler, symbolizer, AABlender };

export default {
    renderer,
    styler,
    symbolizer,
    AABlender
};
