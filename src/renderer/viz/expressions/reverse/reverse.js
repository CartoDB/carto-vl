import { implicitCast, checkMaxArguments, checkType } from '../utils';
import ReversePalette from './ReversePalette';
import ReverseArray from './ReverseArray';

/**
 * Reverse the provided item.
 *
 * @param {Palette|BaseArray} x - item to be reversed
 * @return {Palette|BaseArray}
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
export default function reverse (x) {
    checkMaxArguments(arguments, 1, 'reverse');
    x = implicitCast(x);
    checkType('reverse', 'x', 0, ['palette', 'number-list', 'category-list', 'color-list', 'time-list', 'image-list'], x);
    if (x.type === 'palette') {
        return new ReversePalette(x);
    } else {
        return new ReverseArray(x);
    }
}
