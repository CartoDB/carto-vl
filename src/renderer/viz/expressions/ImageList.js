import Base from './base';
import { checkArray, checkLooseType, checkMaxArguments } from './utils';

/**
 * ImageList. Load an array of images and use them as a symbols.
 *
 * Note: images RGB color will be overridden if the viz `color` property is set.
 *
 * @internal
 */
export default class ImageList extends Base {
    constructor (imageArray) {
        checkMaxArguments(arguments, 1, 'imageList');
        checkArray('imageArray', 'imageArray', 0, imageArray);

        imageArray.forEach((image, i) => checkLooseType('imageArray', `imageArray[${i}]`, 0, 'image', image));

        const children = {};

        imageArray.forEach((image, i) => {
            children[`image${i}`] = image;
        });

        super(children);
        this.numImages = imageArray.length;
        this._images = imageArray;
        this.type = 'image';
    }

    _applyToShaderSource () {
        return {
            preface: this._prefaceCode(`
                uniform sampler2D atlas${this._uid};

                vec4 atlas${this._uid}Fn(vec2 imageUV, float cat) {
                    return texture2D(atlas${this._uid}, imageUV/16. + vec2(mod(cat, 16.), floor(cat/16.))/16. ).rgba;
                }
            `),
            inline: `atlas${this._uid}Fn`
        };
    }

    _postShaderCompile (program, gl) {
        this._getBinding(program).texLoc = gl.getUniformLocation(program, `atlas${this._uid}`);
    }

    _preDraw (program, drawMetadata, gl) {
        this.init = true;
        for (let i = 0; i < this.numImages; i++) {
            const image = this[`image${i}`];
            this.init = this.init && image.canvas;
        }

        if (this.init && !this.texture) {
            const textureAtlasSize = 4096;
            const imageSize = 256;

            gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
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
            for (let i = 0; i < this.numImages; i++) {
                const image = this[`image${i}`];
                // get image, push image to texture atlas
                gl.texSubImage2D(gl.TEXTURE_2D, 0, offsetX, offsetY, gl.RGBA, gl.UNSIGNED_BYTE, image.canvas);
                offsetX += imageSize;

                if (offsetX + imageSize > textureAtlasSize) {
                    offsetX = 0;
                    offsetY += imageSize;
                }

                image.canvas = null;
            }

            gl.generateMipmap(gl.TEXTURE_2D);
        }

        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this._getBinding(program).texLoc, drawMetadata.freeTexUnit);
            drawMetadata.freeTexUnit++;
        }
    }
}
