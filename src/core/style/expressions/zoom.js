import Expression from './expression';
import { float } from '../functions';

export default class Zoom extends Expression {
    /**
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
    _preDraw(o, gl) {
        this.zoom.expr = o.zoom;
        this.zoom._preDraw(o, gl);
    }
}
