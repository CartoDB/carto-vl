import BaseExpression from './base';
import { pow, blend, linear, zoom } from '../expressions';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../errors/carto-validation-error';
import { implicitCast, checkType, checkExpression } from './utils';

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
        checkExpression('zoomrange', 'zoomBreakpointList', 0, zoomBreakpointList);
        this.zoomBreakpointList = zoomBreakpointList;
        this.type = 'number';
        this.inlineMaker = inline => inline._impostor;
    }

    _bindMetadata (metadata) {
        this.zoomBreakpointList._bindMetadata(metadata);
        checkType('zoomrange', 'zoomBreakpointList', 0, 'number-list', this.zoomBreakpointList);
        if (this.zoomBreakpointList.elems.length < 2) {
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} zoomrange() function must receive a list with at least two elements.`);
        }

        const breakpointListCopy = [...this.zoomBreakpointList.elems];

        this._impostor = _genImpostor(breakpointListCopy, 0, breakpointListCopy.length - 1);
        this.childrenNames.push('_impostor');
        super._bindMetadata(metadata);
    }

    eval (feature) {
        return this._impostor.eval(feature);
    }
}

function _genImpostor (list, numerator, denominator) {
    if (list.length === 1) {
        return 1;
    }

    const a = list[0];
    const b = list[1];
    list.shift();

    return blend(numerator / denominator,
        _genImpostor(list, numerator + 1, denominator),
        linear(pow(2, zoom()), pow(2, a), pow(2, b))
    );
}
