import BaseExpression from './base';
import { number } from '../expressions';

/**
 * Get the current zoom level. Multiplying by zoom() makes features constant in real-world space respect their size at zoom level 0.
 *
 * @return {Number}
 *
 * @example <caption>Show constant width in zoom.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.div(s.zoom(), 1000)
 * });
 *
 * @example <caption>Show constant width in zoom. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: zoom() / 1000
 * `);
 *
 * @memberof carto.expressions
 * @name zoom
 * @function
 * @api
 */
export default class Zoom extends BaseExpression {
    constructor () {
        super({ zoom: number(0) });
        this.type = 'number';
        super.inlineMaker = inline => inline.zoom;
    }
    eval () {
        return this.zoom.expr;
    }
    _preDraw (program, drawMetadata, gl) {
        this.zoom.expr = drawMetadata.zoom;
        this.zoom._preDraw(program, drawMetadata, gl);
    }
}
