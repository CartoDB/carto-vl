import Expression from './expression';
import { implicitCast, hexToRgb } from './utils';
import { float } from '../functions';

export default class Ramp extends Expression {
    /**
     * @api
     * @description Creates a color ramp based on input and within the range defined by *minKey* and *maxKey*
     * @param {*} input
     * @param {*} palette
     * @param {*} minKey Optional
     * @param {*} maxKey Optional
     */
    constructor(input, palette, minKey, maxKey) {
        input = implicitCast(input);
        minKey = implicitCast(minKey);
        maxKey = implicitCast(maxKey);
        var values = implicitCast(palette);
        super({ input: input });
        if (minKey === undefined) {
            minKey = float(0);
            maxKey = float(1);
        }
        this.minKey = minKey.expr;
        this.maxKey = maxKey.expr;
        this.values = values;
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
            const values = this.values;
            for (var i = 0; i < width; i++) {
                const vlowRaw = values[Math.floor(i / width * (values.length - 1))];
                const vhighRaw = values[Math.ceil(i / width * (values.length - 1))];
                const vlow = [hexToRgb(vlowRaw).r, hexToRgb(vlowRaw).g, hexToRgb(vlowRaw).b, 255];
                const vhigh = [hexToRgb(vhighRaw).r, hexToRgb(vhighRaw).g, hexToRgb(vhighRaw).b, 255];
                const m = i / width * (values.length - 1) - Math.floor(i / width * (values.length - 1));
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
    _preDraw(l, gl) {
        this.input._preDraw(l, gl);
        gl.activeTexture(gl.TEXTURE0 + l.freeTexUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this._texLoc, l.freeTexUnit);
        gl.uniform1f(this._keyMinLoc, (this.minKey));
        gl.uniform1f(this._keyWidthLoc, (this.maxKey) - (this.minKey));
        l.freeTexUnit++;
    }
}