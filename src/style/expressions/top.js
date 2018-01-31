import Expression from './expression';

export default class Top extends Expression {
    constructor(property, buckets) {
        // TODO 'cat'
        super({ property: property });
        this.buckets = buckets; //TODO force fixed literal
    }
    _compile(metadata) {
        super._compile(metadata);
        if (this.property.type != 'category') {
            throw new Error(`top() first argument must be of type category, but it is of type '${this.property.type}'`);
        }
        this.type = 'category';
        this.numCategories = this.buckets;
    }
    _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
        this._UID = uniformIDMaker();
        const property = this.property._applyToShaderSource(uniformIDMaker, propertyTIDMaker);
        return {
            preface: property.preface + `uniform sampler2D topMap${this._UID};\n`,
            inline: `(255.*texture2D(topMap${this._UID}, vec2(${property.inline}/1024., 0.5)).a)`
        };
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
            for (let i = 0; i < this.buckets - 1; i++) {
                pixels[4 * i + 3] = (i + 1);
            }
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                width, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                pixels);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
        this.property._postShaderCompile(program);
        this._texLoc = gl.getUniformLocation(program, `topMap${this._UID}`);
    }
    _preDraw(l, gl) {
        this.property._preDraw(l);
        gl.activeTexture(gl.TEXTURE0 + l.freeTexUnit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this._texLoc, l.freeTexUnit);
        l.freeTexUnit++;
    }
    //TODO _free
}