import AntiAliasingShader from './common/antialiasing/AntiAliasingShader';
import * as styler from './styler/stylerShaders';
import * as symbolizer from './symbolizer/symbolizerShaders';
import * as labels from './labels/labelsShaders';

const AABlender = AntiAliasingShader;

export { styler, symbolizer, AABlender, labels };

export default {
    styler,
    symbolizer,
    labels,
    AABlender
};
