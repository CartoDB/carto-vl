import BaseExpression from './base';
import { number } from '../functions';

export default class Zoom extends BaseExpression {
    /**
     * @description get the current zoom level
     */
    constructor() {
        super({ zoom: number(0) });
        this.type = 'number';
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
