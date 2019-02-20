import defaultSVGs from '../defaultSVGs';
import { checkType, checkInstance } from './utils';
import Property from './basic/property';
import CategoryIndex from './CategoryIndex';
import ListImage from './ListImage';
import SVG from './SVG';
import Base from './base';
import { OTHERS_GLSL_VALUE, DEFAULT_OPTIONS, DEFAULT_RAMP_OTHERS } from './constants';

const DEFAULT_RAMP_OTHERS_IMAGE = new SVG(defaultSVGs.circle);
export default class RampImage extends Base {
    _bindMetadata (metadata) {
        Base.prototype._bindMetadata.call(this, metadata);
        this.type = this.palette.childType;

        checkType('ramp', 'input', 0, 'category', this.input);
        checkInstance('ramp', 'palette', 1, ListImage, this.palette);

        if (this.others === DEFAULT_RAMP_OTHERS) {
            this.others = DEFAULT_RAMP_OTHERS_IMAGE;
        } else {
            checkType('ramp', 'others', 2, 'image', this.others);
        }

        if (this.input.isA(Property)) {
            this.input = new CategoryIndex(this.input);
            this.input._bindMetadata(metadata);
        }

        this.others._bindMetadata(metadata);
        this.childrenNames.push('others');
    }

    eval (feature) {
        const index = this.input.eval(feature);
        return this._calcEval(index);
    }

    _calcEval (input) {
        const index = Math.round(input * (this.input.numCategoriesWithoutOthers - 1));
        const paletteValues = this.palette.eval();
        return paletteValues[index] || this.others.eval();
    }

    getLegendData (options) {
        const config = Object.assign({}, DEFAULT_OPTIONS, options);
        const type = this.input.type;
        const legendData = this.input._getLegendData(config);
        const data = legendData.data.map(({ key, value }) => {
            value = this._calcEval(value);
            return { key, value };
        });

        return { type, ...legendData, data };
    }

    _applyToShaderSource (getGLSLforProperty) {
        const input = this.input._applyToShaderSource(getGLSLforProperty);
        const images = this.palette._applyToShaderSource(getGLSLforProperty);
        const others = this.others._applyToShaderSource(getGLSLforProperty);
        return {
            preface: this._prefaceCode(`
                uniform float rampImageMultiplier${this._uid};

                ${input.preface}
                ${images.preface}
                ${others.preface}

                vec4 rampImage${this._uid}(vec2 imageUV, float index){
                    if (index == ${OTHERS_GLSL_VALUE}){
                        return ${others.inline};
                    }
                    return ${images.inline}(imageUV, rampImageMultiplier${this._uid}*index);
                }
            `),
            inline: `rampImage${this._uid}(imageUV, ${input.inline})`
        };
    }

    _postShaderCompile (program, gl) {
        super._postShaderCompile(program, gl);
        this._getBinding(program)._multiplierLoc = gl.getUniformLocation(program, `rampImageMultiplier${this._uid}`);
    }

    _preDraw (program, drawMetadata, gl) {
        super._preDraw(program, drawMetadata, gl);
        gl.uniform1f(this._getBinding(program)._multiplierLoc, this.input.numCategoriesWithoutOthers - 1);
    }
}
