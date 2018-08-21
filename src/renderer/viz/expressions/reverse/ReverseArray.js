import Base from '../base';

/**
 * Reverse the provided Array.
 *
 * @param {BaseArray} array - Array to be reversed
 * @return {BaseArray}
 *
 * @example <caption>Invert a Color Array.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.prop('count'), s.reverse([s.namedColor('red'), s.namedColor('blue')]));
 * });
 *
 * @example <caption>Invert a Color Array (String).</caption>
 * const viz = new carto.Viz(`
 *   color: ramp($count, reverse([red, blue]))
 * `);
 *
 * @memberof carto.expressions
 * @name reverse
 * @function
 * @api
 */

export default class ReverseArray extends Base {
    constructor (array) {
        super({
            array
        });
        this.type = array.type;
    }
    get elems () {
        return [...this.array.elems].reverse();
    }
    get value () {
        return this.elems.map(c => c.value);
    }
    eval (feature) {
        return this.elems.map(c => c.eval(feature));
    }
}
