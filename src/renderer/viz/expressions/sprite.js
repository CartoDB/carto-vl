import Base from './base';
import { checkString } from './utils';

/**
 * Sprite. Load an image and use it as a symbol.
 *
 * Note: sprite RGB color will be overridden if the viz `color` property is set.
 *
 * @param {string} url - Image path
 *
 * @example <caption>Load a svg image.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   symbol: s.sprite('./marker.svg')
 * });
 *
 * @example <caption>Load a svg image. (String)</caption>
 * const viz = new carto.Viz(`
 *    symbol: sprite('./marker.svg')
 * `);
 * @memberof carto.expressions
 * @name sprite
 * @function
 * @api
*/

export class Sprite extends Base {
    constructor(url) {
        checkString('sprite', 'url', 0, url);
        super({});
        this.type = 'sprite';
        this.canvas = null;
        this._url = url;
        this._promise = new Promise((resolve, reject) => {
            this.image = new Image();
            this.image.onload = () => {
                this.canvas = getCanvasFromImage(this.image);
                this.image = null;
                resolve();
            };
            this.image.onerror = reject;
            this.image.src = this._url;
            this.image.crossOrigin = 'anonymous';
        });
    }

    loadSprites() {
        this.count = this.count + 1 || 1;
        return this._promise;
    }

    _compile(meta) {
        super._compile(meta);
    }

    _free(gl) {
        if (this.texture) {
            gl.deleteTexture(this.texture);
        }
    }

    _applyToShaderSource() {
        return {
            preface: this._prefaceCode(`uniform sampler2D texSprite${this._uid};`),
            inline: `texture2D(texSprite${this._uid}, spriteUV).rgba`
        };
    }

    _postShaderCompile(program, gl) {
        this._getBinding(program)._texLoc = gl.getUniformLocation(program, `texSprite${this._uid}`);
    }

    _preDraw(program, drawMetadata, gl) {
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
    // TODO eval
}

function getCanvasFromImage(img) {
    const canvasSize = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const ctx = canvas.getContext('2d');

    const max = Math.max(img.width, img.height);
    const width = img.width / max * canvasSize;
    const height = img.height / max * canvasSize;

    ctx.drawImage(img, 1 + (canvasSize - width) / 2, 1 + (canvasSize - height) / 2, width - 2, height - 2);

    return canvas;
}

export class SVG extends Sprite {
    constructor(svg) {
        super('data:image/svg+xml,' + encodeURIComponent(svg));
    }
}

