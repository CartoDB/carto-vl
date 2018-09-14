import { checkType, mix, fract } from './utils';

import Property from './basic/property';
import Linear from './linear';
import CIELabGLSL from './color/CIELab.glsl';
import CategoryIndex from './CategoryIndex';
import { OTHERS_GLSL_VALUE, OTHERS_INDEX, DEFAULT_OPTIONS, DEFAULT_RAMP_OTHERS } from './constants';
import Palette from './color/palettes/Palette';
import Base from './base';
import Constant from './basic/constant';
import NamedColor from './color/NamedColor';

export default class RampGeneric extends Base {
    _bindMetadata (metadata) {
        const DEFAULT_RAMP_OTHERS_NUMBER = new Constant(1);
        const DEFAULT_RAMP_OTHERS_COLOR = new NamedColor('gray');

        super._bindMetadata(metadata);

        this.type = this.palette.childType;
        if (this.others === DEFAULT_RAMP_OTHERS) {
            this.others = this.palette.type === 'number-list'
                ? DEFAULT_RAMP_OTHERS_NUMBER
                : DEFAULT_RAMP_OTHERS_COLOR;
        } else {
            checkType('ramp', 'others', 2, this.palette.childType, this.others);
        }

        if (this.input.isA(Property)) {
            this.input = this.input.type === 'number'
                ? new Linear(this.input)
                : new CategoryIndex(this.input);

            this.input._bindMetadata(metadata);
        }

        checkType('ramp', 'input', 0, ['number', 'category'], this.input);

        this.others._bindMetadata(metadata);
        this.childrenNames.push('others');
        this._metadata = metadata;
    }

    eval (feature) {
        const input = this.input.eval(feature);
        return this._calcEval(input, feature);
    }

    _calcEval (input, feature) {
        const { palette, others } = this._getPalette();
        const paletteValues = this.palette.isA(Palette)
            ? palette.map((color) => color.eval(feature))
            : this.palette.eval(feature);

        if (input === OTHERS_INDEX) {
            return others.eval(feature);
        }

        const maxValues = paletteValues.length - 1;
        const min = Math.floor(input * maxValues);
        const max = Math.ceil(input * maxValues);
        const m = fract(input * maxValues);

        return mix(paletteValues[min], paletteValues[max], m);
    }

    getLegend (options) {
        const config = Object.assign({}, DEFAULT_OPTIONS, options);
        const type = this.input.type;
        const legendData = this.input.getLegendData(config);
        const data = legendData.data.map(({key, value}) => {
            value = this._calcEval(value, undefined);
            return { key, value };
        });

        return { type, ...legendData, data };
    }

    _applyToShaderSource (getGLSLforProperty) {
        const input = this.input._applyToShaderSource(getGLSLforProperty);
        const { palette, others } = this._getPalette();
        const GLSLPalette = palette.map(color => color._applyToShaderSource(getGLSLforProperty));
        const GLSLOthers = others._applyToShaderSource(getGLSLforProperty);

        const rampFnReturnType = this.palette.type === 'number-list' ? 'float' : 'vec4';
        const inline = `ramp_color${this._uid}(${input.inline})`;
        const maxValues = GLSLPalette.length - 1;
        const preface = this._prefaceCode(`
            ${input.preface}
            ${CIELabGLSL}
            ${GLSLPalette.map(elem => elem.preface).join('\n')}
            ${GLSLOthers.preface}

            ${rampFnReturnType} ramp_colorBlend${this._uid}(float x){
                float minIndex = floor(x*${maxValues.toFixed(20)});
                float maxIndex = ceil(x*${maxValues.toFixed(20)});
                float m = fract(x*${maxValues.toFixed(20)});
                ${rampFnReturnType} min;
                ${rampFnReturnType} max;

                ${GLSLPalette.map((p, index) => `
                    if (minIndex == ${index}.){
                        min = ${p.inline};
                }`).join('\n')
}
                ${GLSLPalette.map((p, index) => `
                    if (maxIndex == ${index}.){
                        max = ${p.inline};
                }`).join('\n')
}

                return mix(min, max, m);
            }

            ${rampFnReturnType} ramp_color${this._uid}(float x){
                return x==${OTHERS_GLSL_VALUE}
                    ? ${GLSLOthers.inline}
                    : ramp_colorBlend${this._uid}(x);
            }`
        );

        return { preface, inline };
    }

    _getPalette () {
        return this.palette.isA(Palette)
            ? this._getColorPalette()
            : { palette: this.palette.elems, others: this.others };
    }

    _getColorPalette () {
        const subPalette = this.palette.getColors(this.input.numCategoriesWithoutOthers);

        return {
            palette: subPalette.colors,
            others: this._defaultOthers && subPalette.othersColor ? subPalette.othersColor : this.others
        };
    }
}
