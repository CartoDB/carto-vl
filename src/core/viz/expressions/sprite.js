import Base from './base';

export default class Sprite extends Base {
    constructor(url) {
        super({});
        this.type = 'color';
        this._url = url;
    }
    _fetch() {
        return new Promise((resolve, reject) => {
            this.image = new Image();
            this.image.onload = () => {
                this.image = getCanvasFromImage(this.image);
                this.ready = true;
                resolve();
                console.log('resolved!');
            };
            this.image.onerror = reject;
            this.image.src = this._url;
        });
    }
    _compile(meta) {
        super._compile(meta);
    }
    _free(gl) {
        gl.deleteTexture(this.texture);
    }
    _applyToShaderSource() {
        console.log('glsl!');
        return {
            preface: this._prefaceCode(`
        uniform sampler2D texSprite${this._uid};
        `),
            inline:
                `texture2D(texSprite${this._uid}, spriteUV).rgba`
        };
    }

    _postShaderCompile(program, gl) {
        this._getBinding(program)._texLoc = gl.getUniformLocation(program, `texSprite${this._uid}`);
    }
    _preDraw(program, drawMetadata, gl) {
        if (!this.init && this.ready) {
            this.init = true;
            this.texture = gl.createTexture();
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.generateMipmap(gl.TEXTURE_2D);
            console.log('preDRAW!');
        }
        if (this.ready) {
            gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this._getBinding(program)._texLoc, drawMetadata.freeTexUnit);
            drawMetadata.freeTexUnit++;
            console.log('DRAW!');
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

    const max = Math.min(Math.max(img.width, img.height), canvasSize);
    const width = img.width / max * canvasSize;
    const height = img.height / max * canvasSize;
    ctx.drawImage(img, (canvasSize - width) / 2, (canvasSize - height) / 2, width, height);
    console.log('canvas drawn!');

    return canvas;
}
