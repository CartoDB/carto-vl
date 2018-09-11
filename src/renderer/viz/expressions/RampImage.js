import defaultSVGs from '../defaultSVGs';
import { checkType, checkInstance } from './utils';
import Property from './basic/property';
import CategoryIndex from './CategoryIndex';
import ListImage from './ListImage';
import SVG from './SVG';
import Base from './base';
import { OTHERS_GLSL_VALUE, DEFAULT_OPTIONS } from './constants';

export default class RampImage extends Base {
    _bindMetadata (metadata) {
        Base.prototype._bindMetadata.call(this, metadata);
        this.type = this.palette.childType;

        if (this.others === 'default') {
            this.others = new SVG(defaultSVGs.circle);
        } else {
            checkType('ramp', 'others', 2, 'image', this.others);
        }

        if (this.input.isA(Property)) {
            this.input = new CategoryIndex(this.input);
            this.input._bindMetadata(metadata);
        }

        checkType('ramp', 'input', 0, 'category', this.input);
        checkInstance('ramp', 'palette', 1, ListImage, this.palette);

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
        return paletteValues[index] ? paletteValues[index] : this.others.eval();
    }

    getLegend (options) {
        const config = Object.assign({}, DEFAULT_OPTIONS, options);
        const type = this.input.type;
        const legendData = this.input.getLegendData(config);
        const data = legendData.data.map(({key, value}) => {
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

                vec4 rampImage${this._uid}(float index, vec2 imageUV){
                    if (index == ${OTHERS_GLSL_VALUE}){
                        return ${others.inline};
                    }
                    return ${images.inline}(imageUV, rampImageMultiplier${this._uid}*index);
                }
            `),
            inline: `rampImage${this._uid}(${input.inline}, imageUV)`
        };
    }

    _postShaderCompile (program, gl) {
        super._postShaderCompile(program, gl);
        this._multiplierLoc = gl.getUniformLocation(program, `rampImageMultiplier${this._uid}`);
    }

    _preDraw (program, drawMetadata, gl) {
        super._preDraw(program, drawMetadata, gl);
        gl.uniform1f(this._multiplierLoc, this.input.numCategoriesWithoutOthers - 1);
    }
}
