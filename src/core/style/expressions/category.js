import Expression from './expression';

export default class Category extends Expression {
    /**
     * @jsapi
     * @param {*} x
     */
    constructor(x) {
        if (typeof x !== 'string') {
            throw new Error(`Invalid arguments to Category(): ${x}`);
        }
        super({});
        this.expr = x;
    }
    _compile(metadata) {
        this.type = 'category';
        this._metadata = metadata;
    }
    _applyToShaderSource(uniformIDMaker) {
        this._uniformID = uniformIDMaker();
        return {
            preface: `uniform float cat${this._uniformID};\n`,
            inline: `cat${this._uniformID}`
        };
    }
    _postShaderCompile(program, gl) {
        this._uniformLocation = gl.getUniformLocation(program, `cat${this._uniformID}`);
    }
    _preDraw(drawMetadata, gl) {
        const id = this._metadata.categoryIDs[this.expr];
        gl.uniform1f(this._uniformLocation, id);
    }
    eval(){
        return this._metadata.categoryIDs[this.expr];
    }
    isAnimated() {
        return false;
    }
}