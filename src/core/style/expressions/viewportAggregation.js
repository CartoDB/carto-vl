import Expression from './expression';
import { float } from '../functions';


export default class ViewportMax extends Expression {
    /**
     * @jsapi
     * @param {*} property
     */
    constructor(property) {
        super({value: float(0)});
        this.property = property;
    }
    _compile(metadata) {
        super._compile(metadata);
        this.type = 'float';
        super.inlineMaker = inline => inline.value;
    }
    _preDraw(obj, gl, tile) {
        this.value.expr = 3;
        console.log(tile);
        this.value._preDraw(obj, gl, tile);
    }
}