import { checkType, checkInstance, mix, fract } from './utils';

import NamedColor from './color/NamedColor';
import Property from './basic/property';
import ListImage from './ListImage';
import Linear from './linear';
import Top from './top';
import CIELabGLSL from './color/CIELab.glsl';
import CategoryIndex from './CategoryIndex';
import { constant } from '../expressions';
import { OTHERS_GLSL_VALUE } from './constants';
import Palette from './color/palettes/Palette';
import Base from './base';

const DEFAULT_OTHERS_NAME = 'CARTOVL_OTHERS';
const MAX_SAMPLES = 100;
const DEFAULT_SAMPLES = 10;

const DEFAULT_OPTIONS = {
    defaultOthers: DEFAULT_OTHERS_NAME,
    samples: DEFAULT_SAMPLES
};

const paletteTypes = {
    PALETTE: 'palette',
    COLOR_ARRAY: 'color-list',
    NUMBER_ARRAY: 'number-list',
    IMAGE_LIST: 'image-list'
};

const rampTypes = {
    COLOR: 'color',
    NUMBER: 'number'
};

const inputTypes = {
    NUMBER: 'number',
    CATEGORY: 'category'
};

export default class RampGeneric extends Base {
    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        this.type = this.palette.childType;
        if (this.others === 'default') {
            this.others = this.palette.type === 'number-list' ? constant(1) : new NamedColor('gray');
        } else {
            checkType('ramp', 'others', 2, this.palette.childType, this.others);
        }
        if (this.input.isA(Property)) {
            this.input = this.input.type === inputTypes.NUMBER
                ? new Linear(this.input)
                : new CategoryIndex(this.input);

            this.input._bindMetadata(metadata);
        }

        checkType('ramp', 'input', 0, Object.values(inputTypes), this.input);

        if (this.palette.type === paletteTypes.IMAGE_LIST) {
            checkType('ramp', 'input', 0, inputTypes.CATEGORY, this.input);
            checkInstance('ramp', 'palette', 1, ListImage, this.palette);
        }

        this._properties = metadata.properties;
        this._texCategories = null;
        this._GLtexCategories = null;
        this._metadata = metadata;
    }

    eval (feature) {
        const input = this.input.eval(feature);
        const palette = this.palette.isA(Palette)
            ? this.palette.eval(feature).getColors(this.input.numCategories)
            : this.palette.eval(feature);

        const maxValues = palette.length - 1;
        const min = Math.floor(input * maxValues);
        const max = Math.ceil(input * maxValues);
        const m = fract(input * maxValues);

        return mix(palette[min], palette[max], m);
    }

    _getFeatureIndex (feature) {
        return this.input.eval(feature);
    }

    _getIndex (feature) {
        if (this.input.isA(Property)) {
            return this.input.getPropertyId(feature);
        }

        if (this.input.isA(Top)) {
            return this.input.property.getPropertyId(feature);
        }

        return this.input.eval(feature);
    }

    getLegend (options) {
        const config = Object.assign({}, DEFAULT_OPTIONS, options);
        const type = this.input.type;

        if (config.samples > MAX_SAMPLES) {
            throw new Error(`The maximum number of samples for a legend is ${MAX_SAMPLES}`);
        }

        if (this.input.type === inputTypes.NUMBER) {
            const { data, min, max } = this._getLegendNumeric(config);
            return { type, min, max, data };
        }

        if (this.input.type === inputTypes.CATEGORY) {
            const data = this._getLegendCategories(config);
            return { type, data };
        }
    }

    _getLegendNumeric (config) {
        const name = this.input.getPropertyName();
        const min = this.input.min.eval();
        const max = this.input.max.eval();
        const INC = (max - min) / config.samples;
        const data = [];

        for (let i = min; i < max; i += INC) {
            const feature = _buildFeature(name, i);
            const key = i;
            const value = this.eval(feature);

            data.push({ key, value });
        }

        return { data, min, max };
    }

    _getLegendCategories (config) {
        const name = this.input.getPropertyName();
        const categories = this._metadata.properties[name].categories;
        const maxNumCategories = this.input.numCategories - 1;
        const legend = [];

        for (let i = 0; i <= maxNumCategories; i++) {
            const category = categories[i];

            if (category) {
                const feature = Object.defineProperty({},
                    name,
                    { value: category.name }
                );

                const key = category.name && i < maxNumCategories
                    ? category.name
                    : config.defaultOthers;

                const value = this.eval(feature);
                legend.push({ key, value });
            }
        }

        return legend;
    }

    // _evalNumberArray (feature, index) {
    //     const max = this.input.type === inputTypes.CATEGORY
    //         ? this.input.numCategories - 1
    //         : 1;

    //     const m = index / max;

    //     for (let i = 0; i < this.palette.elems.length - 1; i++) {
    //         const rangeMin = i / (this.palette.elems.length - 1);
    //         const rangeMax = (i + 1) / (this.palette.elems.length - 1);

    //         if (m > rangeMax) {
    //             continue;
    //         }

    //         const rangeM = (m - rangeMin) / (rangeMax - rangeMin);
    //         const a = this.palette.elems[i].eval(feature);
    //         const b = this.palette.elems[i + 1].eval(feature);
    //         return mix(a, b, clamp(rangeM, 0, 1));
    //     }

    //     throw new Error('Unexpected condition on ramp._evalNumberArray()');
    // }

    _applyToShaderSource (getGLSLforProperty) {
        const input = this.input._applyToShaderSource(getGLSLforProperty);

        let palette;
        let others;

        if (this.palette.isA(Palette)) {
            const subPalette = this.palette.getColors(this.input.numCategories);
            palette = subPalette.colors;
            others = subPalette.othersColor || this.others;
        } else {
            palette = this.palette.elems;
            others = this.others;
        }

        const GLSLPalette = palette.map(color => color._applyToShaderSource(getGLSLforProperty));
        const GLSLOthers = others._applyToShaderSource(getGLSLforProperty);
        // CHECK interpolate when numCats>=colors, discard colors otherwise

        const GLSLBlend = this.palette.type === 'number-list'
            ? this._generateGLSLBlend(GLSLPalette.map(elem => elem.inline))
            : this._generateGLSLBlend(GLSLPalette.map(elem => `sRGBAToCieLAB(${elem.inline})`));
        const inline = `ramp_color${this._uid}(${input.inline})`;
        const preface = `
                    ${CIELabGLSL}
                    ${GLSLPalette.map(elem => elem.preface).join('\n')}
                    ${GLSLOthers.preface}

                    vec4 ramp_color${this._uid}(float x){
                        return x==${OTHERS_GLSL_VALUE}
                            ? ${GLSLOthers.inline}
                            : cielabToSRGBA(${GLSLBlend});
                    }`;

        return { preface: this._prefaceCode(input.preface + preface), inline };
    }

    _generateGLSLBlend (list, index = 0) {
        const currentColor = list[index];

        if (index === list.length - 1) {
            return currentColor;
        }

        const nextBlend = this._generateGLSLBlend(list, index + 1);

        return _mixClampGLSL(currentColor, nextBlend, index, list.length);
    }
}

function _buildFeature (name, value) {
    const enumerable = true;

    return Object.defineProperty({}, name, { value, enumerable });
}

function _mixClampGLSL (currentColor, nextBlend, index, listLength) {
    const min = (index / (listLength - 1)).toFixed(20);
    const max = (1 / (listLength - 1)).toFixed(20);
    const clamp = `clamp((x - ${min})/${max}, 0., 1.)`;

    return `mix(${currentColor}, ${nextBlend}, ${clamp})`;
}
