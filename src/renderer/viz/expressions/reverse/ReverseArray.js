import Base from '../base';

/**
 * TODO UPDATE DOC !!
 * Reverse the provided Array.
 *
 * @param {Palette} palette - Numeric expression to compute the natural logarithm
 * @return {Palette}
 *
 * @example <caption>Invert a Palette.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.ramp(s.prop('type'), s.reverse(s.palettes.PRISM));
 * });
 *
 * @example <caption>Invert a Palette. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp($type, reverse(PRISM))
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
