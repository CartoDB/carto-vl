import Base from './base';
/**
 * Text. Add a text Text to a feature
 *
 * @param {string} input
 *
 * @example <caption>Add a text Text</caption>
 * // TODO
 * @example <caption>Add a text Text (String)</caption>
 * // TODO
 * @memberof carto.expressions
 * @name Text
 * @function
 * @api
*/

export default class Text extends Base {
    constructor (input, x = 10, y = 10) {
        super({ input });
        this.type = 'text';
        this.canvas = _createCanvasForText(this.input, x, y);
    }

    _compile (meta) {
        super._compile(meta);
    }

    _free (gl) {
        if (this.texture) {
            gl.deleteTexture(this.texture);
        }
    }

    _applyToShaderSource () {
        return {
            preface: this._prefaceCode(`uniform sampler2D texSprite${this._uid};`),
            inline: `texture2D(texSprite${this._uid}, canvasUV).rgba` // FIXME
        };
    }

    _postShaderCompile (program, gl) {
        this._getBinding(program)._texLoc = gl.getUniformLocation(program, `texSprite${this._uid}`);
    }

    _preDraw (program, drawMetadata, gl) {
        if (!this.init && this.canvas) {
            this.init = true;
            gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
            this.texture = gl.createTexture();
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.generateMipmap(gl.TEXTURE_2D);
            this.canvas = null;
        }

        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this._getBinding(program)._texLoc, drawMetadata.freeTexUnit);
            drawMetadata.freeTexUnit++;
        }
    }
}

function _createCanvasForText (input, x, y) {
    const CANVAS_SIZE = 256;
    const canvas = document.createElement('canvas');
    const p = document.createElement('p');
    const ctx = canvas.getContext('2d');
    const text = input.expr;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    p.text = text;
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px Verdana'; // FIXME
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillText(text, x, y);
    ctx.restore();

    return canvas;
}
