import Expression from './expression';

export default class Top extends Expression {
    constructor(property, buckets) {
        // TODO 'cat'
        super({ property: property });
        // TODO improve type check
        this.buckets = buckets; //TODO force fixed literal
    }
    _compile(metadata) {
        super._compile(metadata);
        if (this.property.type != 'category') {
            throw new Error(`top() first argument must be of type category, but it is of type '${this.property.type}'`);
        }
        this.type = 'category';
        this.numCategories = this.buckets + 1;
        this.othersBucket = true;
        this._meta = metadata;
    }
    _applyToShaderSource(getGLSLforProperty) {
        const property = this.property._applyToShaderSource(getGLSLforProperty);
        return {
            preface: this._prefaceCode(property.preface + `uniform sampler2D topMap${this._uid};\n`),
            inline: `(255.*texture2D(topMap${this._uid}, vec2(${property.inline}/1024., 0.5)).a)`
        };
    }
    eval(feature) {
        const p = this.property.eval(feature);
        const metaColumn = this._meta.columns.find(c => c.name == this.property.name);
        let ret;
        metaColumn.categoryNames.map((name, i) => {
            if (i==p){
                ret = i < this.buckets? i+1:0;
            }
        });
        return ret;
    }
    _postShaderCompile(program, gl) {
        if (!this.init) {
            if (this.buckets > this.property.numCategories) {
                this.buckets = this.property.numCategories;
            }
            this.init = true;
            this.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            const width = 1024;
            let pixels = new Uint8Array(4 * width);
            const metaColumn = this._meta.columns.find(c => c.name == this.property.name);
            metaColumn.categoryNames.map((name, i) => {
                if (i < this.buckets) {
                    pixels[4 * this._meta.categoryIDs[name] + 3] = (i + 1);
                }
            });
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                width, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                pixels);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
        this.property._postShaderCompile(program);
        this._getBinding(program)._texLoc = gl.getUniformLocation(program, `topMap${this._uid}`);
    }
    _preDraw(program, drawMetadata, gl) {
        this.property._preDraw(program, drawMetadata);
        gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this._getBinding(program)._texLoc, drawMetadata.freeTexUnit);
        drawMetadata.freeTexUnit++;
    }
    //TODO _free
}
