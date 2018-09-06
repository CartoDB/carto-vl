
class RampImage extends ???{
    constructor(){

    }
    loadImages () {
        return Promise.all([this.input.loadImages(), this.palette.loadImages()]);
    }

    eval(feature){
        // TODO
        const index = this._getIndex(feature);
        return this.palette[`image${index}`].eval();
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
    // inherited getlegend

    _bindMetadata (metadata) {
        super._bindMetadata(metadata); // FIXME
        this.type = this.palette.childType;
        if (this.others === 'default') {
            this.others = this.palette.type === 'number-array' ? constant(1) : new NamedColor('gray');
        } else {
            checkType('ramp', 'others', 2, this.palette.childType, this.others);
        }
        if (this.input.isA(Property)) {
            this.input = this.input.type === inputTypes.NUMBER
                ? new Linear(this.input)
                : new CategoryIndex(this.input);

            this.input._bindMetadata(metadata);
        }

            checkType('ramp', 'input', 0, inputTypes.CATEGORY, this.input);
            checkInstance('ramp', 'palette', 1, ImageList, this.palette);
    }

    _applyToShaderSource (getGLSLforProperty) {
        const input = this.input._applyToShaderSource(getGLSLforProperty);
        const images = this.palette._applyToShaderSource(getGLSLforProperty);
        return {
            preface: input.preface + images.preface,
            inline: `${images.inline}(imageUV, ${input.inline})`
        };
    }

}
