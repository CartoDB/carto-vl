import { checkMaxArguments, implicitCast, checkExpression } from '../utils';
import ReversePalette from './ReversePalette';
import ReverseList from './ReverseList';
import Base from '../base';

/**
 * Reverse the provided item.
 *
 * @param {Palette|List} input - item to be reversed
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
export default class Reverse extends Base {
    constructor (input) {
        checkMaxArguments(arguments, 1, 'reverse');
        input = implicitCast(input);
        checkExpression('reverse', 'input', 0, input);
        super({ input });
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        if (this.input.type === 'palette') {
            Object.setPrototypeOf(this, ReversePalette.prototype);
        } else {
            Object.setPrototypeOf(this, ReverseList.prototype);
        }

        return this._bindMetadata(metadata);
    }
}
