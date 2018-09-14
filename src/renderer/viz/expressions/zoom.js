import BaseExpression from './base';
import { number } from '../expressions';
import { checkMaxArguments } from './utils';

/**
 * Get the current zoom level.
 *
 * @return {Number}
 *
 * @example <caption>Only show feature at zoom levels less than 7.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.lt(s.zoom(), 7)
 * });
 *
 * @example <caption>Only show feature at zoom levels less than 7. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: zoom() < 7
 * `);
 *
 * @memberof carto.expressions
 * @name zoom
 * @function
 * @api
 */
export default class Zoom extends BaseExpression {
    constructor () {
        checkMaxArguments(arguments, 0, 'zoom');

        super({ zoom: number(0) });
        this.type = 'number';
        super.inlineMaker = inline => inline.zoom;
    }
    eval () {
        return this.zoom.expr;
    }
    _preDraw (program, drawMetadata, gl) {
        this.zoom.expr = drawMetadata.zoomLevel;
        this.zoom._preDraw(program, drawMetadata, gl);
    }
}
