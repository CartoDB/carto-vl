import BaseExpression from './base';
import { mul, pow, div } from '../expressions';
import { implicitCast, checkType } from './utils';

/**
 * Scale a width value to keep feature width constant in real space (meters).
 * This will change the width in pixels at different zoom levels to enforce the previous condition.
 *
 * @param {Number} width - pixel width at zoom level `zoomlevel`
 * @param {Number} [zoomlevel=0] - zoomlevel at which `width` is relative to
 * @return {Number}
 *
 * @example <caption>Keep feature width in meters constant with 25 pixels at zoom level 7.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.scaled(25, 7)
 * });
 *
 * @example <caption>Keep feature width in meters constant with 25 pixels at zoom level 7. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: s.scaled(25, 7)
 * `);
 *
 * @memberof carto.expressions
 * @name scaled
 * @function
 * @api
 */
export default class Scaled extends BaseExpression {
    constructor (width, zoomlevel = 0) {
        width = implicitCast(width);
        zoomlevel = implicitCast(zoomlevel);
        super({
            scale: div(mul(width, 0), pow(2, zoomlevel))
        });
        this.type = 'number';
        this.inlineMaker = inline => inline.scale;
    }
    eval () {
        return this.scale.eval();
    }
    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkType('scaled', 'width', 0, 'number', this.scale.a.a);
        checkType('scaled', 'zoomlevel', 1, 'number', this.scale.b);
    }
    _preDraw (program, drawMetadata, gl) {
        this.scale.a.b.expr = Math.pow(2, drawMetadata.zoomLevel);
        super._preDraw(program, drawMetadata, gl);
    }
}
