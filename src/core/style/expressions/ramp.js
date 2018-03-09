import Expression from './expression';
import { implicitCast, hexToRgb } from './utils';

export default class Ramp extends Expression {
    /**
    * Create a color ramp based on input property.
    * 
    * [TODO: detailed explanation]
    * 
    * @param {carto.style.expressions.property} TODO:
    * @param {carto.style.expressions.property} colorScheme - The color scheme that is going to be used in the ramp
    * @return {carto.style.expressions.expression} 
    * 
    * @example <caption> Display points with a different color depending on the `category` property. </caption>
    * const s = carto.style.expressions;
    * const style = new carto.Style({
    *  color: s.ramp(s.prop('category'), PRISM),
    * });
    * 
    * @memberof carto.style.expressions
    * @name ramp
    * @function
    * @api
    */
    constructor(input, palette, ...args) {
        if (args.length > 0) {
            throw new Error('ramp(input, palette) only accepts two parameters');
        }
        input = implicitCast(input);
        palette = implicitCast(palette);
        super({ input: input });
        this.minKey = 0;
        this.maxKey = 1;
        this.palette = palette;
    }
    _compile(meta) {
        super._compile(meta);
        this.type = 'color';
        if (this.input.type == 'category') {
            this.maxKey = this.input.numCategories - 1;
        }
    }
    _free(gl) {
        gl.deleteTexture(this.texture);
    }
    _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
        this._UID = uniformIDMaker();
        const input = this.input._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
        return {
            preface: input.preface + `
        uniform sampler2D texRamp${this._UID};
        uniform float keyMin${this._UID};
        uniform float keyWidth${this._UID};
        `,
            inline: `texture2D(texRamp${this._UID}, vec2((${input.inline}-keyMin${this._UID})/keyWidth${this._UID}, 0.5)).rgba`
        };
    }
    _getColorsFromPalette(input, palette) {
        if (palette.type == 'paletteGenerator') {
            let colors;
            if (input.numCategories) {
                // If we are not gonna pop the others we don't need to get the extra color
                const subPalette = (palette.tags.includes('qualitative') && !input.othersBucket) ? input.numCategories : input.numCategories - 1;
                if (palette.subPalettes[subPalette]) {
                    colors = palette.subPalettes[subPalette];
                } else {
                    // More categories than palettes, new colors will be created by linear interpolation
                    colors = palette.getLongestSubPalette();
                }
            } else {
                colors = palette.getLongestSubPalette();
            }
            // We need to remove the 'others' color if the palette has it (it is a qualitative palette) and if the input doesn't have a 'others' bucket
            if (palette.tags.includes('qualitative') && !input.othersBucket) {
                colors = colors.slice(0, colors.length - 1);
            }
            return colors;
        } else {
            return palette;
        }
    }
    _postShaderCompile(program, gl) {
        if (!this.init) {
            this.init = true;
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            const level = 0;
            const internalFormat = gl.RGBA;
            const width = 256;
            const height = 1;
            const border = 0;
            const srcFormat = gl.RGBA;
            const srcType = gl.UNSIGNED_BYTE;
            const pixel = new Uint8Array(4 * width);
            const colors = this._getColorsFromPalette(this.input, this.palette);
            // console.log(this.input.numCategories, this.input.othersBucket, colors, this);
            for (var i = 0; i < width; i++) {
                const vlowRaw = colors[Math.floor(i / width * (colors.length - 1))];
                const vhighRaw = colors[Math.ceil(i / width * (colors.length - 1))];
                const vlow = [hexToRgb(vlowRaw).r, hexToRgb(vlowRaw).g, hexToRgb(vlowRaw).b, 255];
                const vhigh = [hexToRgb(vhighRaw).r, hexToRgb(vhighRaw).g, hexToRgb(vhighRaw).b, 255];
                const m = i / width * (colors.length - 1) - Math.floor(i / width * (colors.length - 1));
                const v = vlow.map((low, index) => low * (1. - m) + vhigh[index] * m);
                pixel[4 * i + 0] = v[0];
                pixel[4 * i + 1] = v[1];
                pixel[4 * i + 2] = v[2];
                pixel[4 * i + 3] = v[3];
            }
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
        this.input._postShaderCompile(program, gl);
        this._texLoc = gl.getUniformLocation(program, `texRamp${this._UID}`);
        this._keyMinLoc = gl.getUniformLocation(program, `keyMin${this._UID}`);
        this._keyWidthLoc = gl.getUniformLocation(program, `keyWidth${this._UID}`);
    }
    _preDraw(drawMetadata, gl) {
        this.input._preDraw(drawMetadata, gl);
        gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this._texLoc, drawMetadata.freeTexUnit);
        gl.uniform1f(this._keyMinLoc, (this.minKey));
        gl.uniform1f(this._keyWidthLoc, (this.maxKey) - (this.minKey));
        drawMetadata.freeTexUnit++;
    }
    // TODO eval
}
