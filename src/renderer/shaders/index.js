import AntiAliasingShader from './common/antialiasing/AntiAliasingShader';
import * as styler from './styler/stylerShaders';
import * as symbolizer from './symbolizer/symbolizerShaders';
import { gridShaderGLSL as grid } from './grid/gridShaders';

const AABlender = AntiAliasingShader;

export { styler, symbolizer, AABlender };

export default {
    styler,
    symbolizer,
    AABlender,
    grid
};
