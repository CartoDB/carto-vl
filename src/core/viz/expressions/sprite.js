import Base from './base';

function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext('2d');

    const max = Math.min(Math.max(img.width, img.height), 256);
    const width = img.width / max * 256;
    const height = img.height / max * 256;
    ctx.drawImage(img, (256 - width) / 2, (256 - height) / 2, width, height);


    return canvas;
}

export default class Sprite extends Base {
    constructor(sprite) {
        super({});
        this.type = 'color';
        this.image = new Image();
        this.image.onload = () => {
            if (sprite.endsWith('.svg')) {
                this.image = getBase64Image(this.image);
            }
            this.ready = true;
        };
        this.image.src = sprite;
    }
    _compile(meta) {
        super._compile(meta);
    }
    _free(gl) {
        gl.deleteTexture(this.texture);
    }
    _applyToShaderSource() {
        return {
            preface: `
        uniform sampler2D texSprite${this._UID};

        vec4 sampleSprite${this._UID}(vec2 spriteUV){
            vec4 c = texture2D(texSprite${this._UID}, spriteUV).rgba;
            return vec4(c.rgb*c.a, c.a);
        }
        `,
            inline:
                `sampleSprite${this._UID}(spriteUV)`
        };
    }

    _postShaderCompile(program, gl) {
        this._getBinding(program)._texLoc = gl.getUniformLocation(program, `texSprite${this._UID}`);
    }
    _preDraw(program, drawMetadata, gl) {
        if (!this.init && this.ready) {
            console.log('ready!', this.image);
            document.body.appendChild(this.image);
            this.init = true;
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        if (this.ready) {
            gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this._getBinding(program)._texLoc, drawMetadata.freeTexUnit);
            drawMetadata.freeTexUnit++;
        }
    }
    // TODO eval
}
