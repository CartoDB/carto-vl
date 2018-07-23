import BaseExpression from './base';
import { number, mul } from '../expressions';
import { implicitCast, checkType } from './utils';

/**
 * Scale a width value to keep feature width constant in real space (meters).
 * This will change the width in pixels at different zoom levels to enforce the previous condition.
 *
 * @param {Number} input - pixel width at zoom level 0
 * @return {Number}
 *
 * @example <caption>Keep feature width in meters constant.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.scale(0.1)
 * });
 *
 * @example <caption>Keep feature width in meters constant. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: s.scale(0.1)
 * `);
 *
 * @memberof carto.expressions
 * @name scale
 * @function
 * @api
 */
export default class Scale extends BaseExpression {
    constructor (input) {
        input = implicitCast(input);
        super({
            scale: mul(input, number(0))
        });
        this.type = 'number';
    }
    eval () {
        return this.scale.eval();
    }
    _compile (metadata) {
        checkType('scale', 'input', 0, 'number', this.scale.a);
        super._compile(metadata);
        super.inlineMaker = inline => inline.scale;
    }
    _preDraw (program, drawMetadata, gl) {
        this.scale.b.expr = drawMetadata.scale;
        super._preDraw(program, drawMetadata, gl);
    }
}
