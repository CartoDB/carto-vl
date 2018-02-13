import Expression from './expression';
import { float } from '../functions';

export default class Zoom extends Expression {
    /**
     * @api
     * @description get the current zoom level
     */
    constructor() {
        super({ zoom: float(0) });
    }
    _compile(metadata) {
        super._compile(metadata);
        this.type = 'float';
        super.inlineMaker = inline => inline.zoom;
    }
    _preDraw(drawMetadata, gl) {
        this.zoom.expr = drawMetadata.zoom;
        this.zoom._preDraw(drawMetadata, gl);
    }
}