import BaseExpression from './base';
import { pow, blend, linear, zoom, sub } from '../expressions';
import { implicitCast, checkType } from './utils';

/**
 * Define a list of interpolated zoom ranges based on an input breakpoint list. Useful in combination with ramp (see examples).
 *
 * @param {Number[]} zoomBreakpointList - list of zoom breakpoints with at least two elements
 * @return {Number}
 *
 * @example <caption>Set the width to 1 at zoom levels < 7, set the width at 20 at zoom levels > 10, interpolate between 1 and 20 at zoom levels in the [7,10] range.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.ramp(s.zoomrange([7, 10]), [1, 20])
 * });
 *
 * @example <caption>Set the width to 1 at zoom levels < 7, set the width at 20 at zoom levels > 10, interpolate between 1 and 20 at zoom levels in the [7,10] range. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: width: ramp(zoomrange([7, 10]), [1, 20])
 * `);
 *
 * @memberof carto.expressions
 * @name zoomrange
 * @function
 * @api
 */
export default class Zoomrange extends BaseExpression {
    constructor (zoomBreakpointList) {
        zoomBreakpointList = implicitCast(zoomBreakpointList);

        super({});
        this.zoomBreakpointList = zoomBreakpointList;
        this.type = 'number';
        this.inlineMaker = inline => inline._impostor;
    }
    eval () {
        return this._impostor.eval();
    }
    _bindMetadata (metadata) {
        checkType('zoomrange', 'zoomBreakpointList', 0, 'number-array', this.zoomBreakpointList);
        if (this.zoomBreakpointList.elems.length < 2) {
            setTimeout(() => {
                throw new Error('zoomrange() function must receive a list with at least two elements');
            });
        }
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
        this._impostor = genImpostor([...this.zoomBreakpointList.elems], 0, this.zoomBreakpointList.elems.length - 1);
        this.childrenNames.push('_impostor');
        super._bindMetadata(metadata);
    }
}
