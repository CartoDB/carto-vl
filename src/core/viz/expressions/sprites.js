import Base from './base';

export default class Sprites extends Base {
    constructor(...sprites) {
        const children = {};
        sprites.forEach((sprite, i) => children[`sprite${i}`] = sprite);
        super(children);
        this.numSprites = sprites.length;
        this.type = 'sprites';
    }
    _applyToShaderSource() {
        return {
            preface: this._prefaceCode(`
        uniform sampler2D atlas${this._uid};

        vec4 atlas${this._uid}Fn(vec2 spriteUV, float cat){
            /*if (true){
                return vec4(1,0,0,0.1);
            }else{
                return vec4(0,1,1,1);
            }*/
            return texture2D(atlas${this._uid}, spriteUV/16.  + vec2(mod(cat, 16.), floor(cat/16.))/16. ).rgba;
        }
        `),
            inline: `atlas${this._uid}Fn`
        };
    }
    _postShaderCompile(program, gl) {
        this._getBinding(program).texLoc = gl.getUniformLocation(program, `atlas${this._uid}`);
    }
    _preDraw(program, drawMetadata, gl) {
        this.init = true;
        for (let i = 0; i < this.numSprites; i++) {
            const sprite = this[`sprite${i}`];
            this.init = this.init && sprite.ready;
        }
        if (this.init && !this.ready) {
            const textureAtlasSize = 4096;
            const spriteSize = 256;

            this.init = true;
            this.texture = gl.createTexture();
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureAtlasSize, textureAtlasSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            let offsetX = 0;
            let offsetY = 0;
            for (let i = 0; i < this.numSprites; i++) {
                const sprite = this[`sprite${i}`];
                // get image, push image to texture atlas
                const canvas = sprite.image;
                gl.texSubImage2D(gl.TEXTURE_2D, 0, offsetX, offsetY, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
                offsetX += spriteSize;
                if (offsetX + spriteSize > textureAtlasSize) {
                    offsetX = 0;
                    offsetY += spriteSize;
                }
            }

            gl.generateMipmap(gl.TEXTURE_2D);
            this.ready = true;
        }
        if (this.ready) {
            gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this._getBinding(program).texLoc, drawMetadata.freeTexUnit);
            drawMetadata.freeTexUnit++;
        }
    }
}
