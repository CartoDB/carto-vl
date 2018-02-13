import Expression from './expression';
import { float } from '../functions';


export default class ViewportMax extends Expression {
    /**
     * @jsapi
     * @param {*} property
     */
    constructor(property) {
        super({ value: float(0) });
        this.property = property;
    }
    _compile(metadata) {
        super._compile(metadata);
        this.property._compile(metadata);
        this.type = 'float';
        super.inlineMaker = inline => inline.value;
    }
    _getMinimumNeededSchema() {
        return this.property._getMinimumNeededSchema();
    }
    _preDraw(drawMetadata, gl) {
        const column = drawMetadata.columns.find(c => c.name == this.property.name);
        this.value.expr = column.avg;
        console.log(column.avg);
        //console.log(column.max);
        this.value._preDraw(drawMetadata, gl);
    }
}