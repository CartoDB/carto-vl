import Expression from './expression';
import { implicitCast, checkLooseType, checkExpression, checkType } from './utils';

export default class Sprite extends Expression {
    constructor(sprite) {
        super({});
        this.type = 'color';
        this.image = new Image();
        this.image.onload = () => this.ready = true;
        this.image.src = '/gopherbw.png';
    }
    _compile(meta) {
        super._compile(meta);
    }
    _free(gl) {
        gl.deleteTexture(this.texture);
    }
    _applyToShaderSource(uniformIDMaker) {
        this._UID = uniformIDMaker();
        return {
            preface: `
        uniform sampler2D texSprite${this._UID};
        `,
            inline:
                `(texture2D(texSprite${this._UID}, vec2(0.5)).rgba)`
        };
    }

    _postShaderCompile(program, gl) {
        this._texLoc = gl.getUniformLocation(program, `texSprite${this._UID}`);
    }
    _preDraw(drawMetadata, gl) {
        if (!this.init && this.ready) {
            console.log('ready!', this.image);
            this.init = true;
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        if (this.ready) {
            gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this._texLoc, drawMetadata.freeTexUnit);
            drawMetadata.freeTexUnit++;
        }
    }
    // TODO eval
}
