import BaseExpression from './base';
import { mul, pow, div, blend, linear, zoom, sub } from '../expressions';
import { implicitCast, checkType } from './utils';

// /**
//  * Scale a width value to keep feature width constant in real space (meters).
//  * This will change the width in pixels at different zoom levels to enforce the previous condition.
//  *
//  * @param {Number} width - pixel width at zoom level `zoomlevel`
//  * @param {Number} [zoomlevel=0] - zoomlevel at which `width` is relative to
//  * @return {Number}
//  *
//  * @example <caption>Keep feature width in meters constant with 25 pixels at zoom level 7.</caption>
//  * const s = carto.expressions;
//  * const viz = new carto.Viz({
//  *   width: s.scale(25, 7)
//  * });
//  *
//  * @example <caption>Keep feature width in meters constant with 25 pixels at zoom level 7. (String)</caption>
//  * const viz = new carto.Viz(`
//  *   width: s.scale(25, 7)
//  * `);
//  *
//  * @memberof carto.expressions
//  * @name zoomrange
//  * @function
//  * @api
//  */
export default class Zoomrange extends BaseExpression {
    constructor (zoomBreakpointList) {
        zoomBreakpointList = implicitCast(zoomBreakpointList);
        let impostor = null;
        // TODO var compatible
        // TODO check length > 1
        function genImpostor (list, numerator, denominator) {
            if (list.length === 1) {
                return 1;
            }
            const a = list[0];
            const b = list[1];
            list.shift();
            return blend(numerator / denominator,
                genImpostor(list, numerator + 1, denominator),
                linear(zoom(), pow(2, sub(a, 1)), pow(2, sub(b, 1)))
            );
        }
        impostor = genImpostor(zoomBreakpointList.elems, 0, zoomBreakpointList.elems.length - 1);
        super({
            _impostor: impostor
        });
        this.zoomBreakpointList = zoomBreakpointList;
        this.type = 'number';
        this.inlineMaker = inline => inline._impostor;
    }
    eval () {
        return this._impostor.eval();
    }
    _bindMetadata (metadata) {
        checkType('zoomrange', 'zoomBreakpointList', 0, 'number-array', this.zoomBreakpointList);
        super._bindMetadata(metadata);
    }
}
