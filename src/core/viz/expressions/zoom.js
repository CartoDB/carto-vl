import Expression from './expression';
import { float } from '../functions';

export default class Zoom extends Expression {
    /**
     * @description get the current zoom level
     */
    constructor() {
        super({ zoom: float(0) });
        this.type = 'float';
    }
    _compile(metadata) {
        super._compile(metadata);
        super.inlineMaker = inline => inline.zoom;
    }
    _preDraw(program, drawMetadata, gl) {
        this.zoom.expr = drawMetadata.zoom;
        this.zoom._preDraw(program, drawMetadata, gl);
    }
    eval() {
        return this.zoom.expr;
    }
}
