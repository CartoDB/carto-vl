import defaultSVGs from '../defaultSVGs';
import { checkType, checkInstance } from './utils';
import Property from './basic/property';
import CategoryIndex from './CategoryIndex';
import ListImage from './ListImage';
import SVG from './SVG';
import Base from './base';

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
    }

    eval (feature) {
        // TODO
        const index = this._getIndex(feature);
        return this.palette[`image${index}`].eval();
    }
    _getIndex (feature) {
        // if (this.input.isA(Property)) {
        //     return this.input.getPropertyId(feature);
        // }

        // if (this.input.isA(Top)) {
        //     return this.input.property.getPropertyId(feature);
        // }

        // return this.input.eval(feature);
    }
    // inherited getlegend

    _applyToShaderSource (getGLSLforProperty) {
        const input = this.input._applyToShaderSource(getGLSLforProperty);
        const images = this.palette._applyToShaderSource(getGLSLforProperty);
        return {
            preface: input.preface + images.preface,
            inline: `${images.inline}(imageUV, ${input.inline})`
        };
    }
}
