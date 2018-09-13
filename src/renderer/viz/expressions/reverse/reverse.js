import { implicitCast, checkMaxArguments } from '../utils';
import ReversePalette from './ReversePalette';
import ReverseList from './ReverseList';

/**
 * Reverse the provided item.
 *
 * @param {Palette|List} x - item to be reversed
 * @return {Palette|List}
 *
 * @example <caption>Invert a Palette.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.prop('type'), s.reverse(s.palettes.PRISM));
 * });
 *
 * @example <caption>Invert a Palette (String).</caption>
 * const viz = new carto.Viz(`
 *   color: ramp($type, reverse(PRISM))
 * `);
 *
 * @example <caption>Invert a List.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.prop('count'), s.reverse([s.namedColor('red'), s.namedColor('blue')]));
 * });
 *
 * @example <caption>Invert a List (String).</caption>
 * const viz = new carto.Viz(`
 *   color: ramp($count, reverse([red, blue]))
 * `);
 *
 * @memberof carto.expressions
 * @name reverse
 * @function
 * @api
 */
export default function reverse (list) {
    checkMaxArguments(arguments, 1, 'reverse');
    list = implicitCast(list);

    if (list.type === 'palette') {
        return new ReversePalette(list);
    } else {
        return new ReverseList(list);
    }
}
