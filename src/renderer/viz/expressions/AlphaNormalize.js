import BaseExpression from './base';
import { number, div, globalMax, opacity } from '../expressions';
import { checkMaxArguments } from './utils';

/**
 * Override the opacity (alpha channel) of a color to normalize the input color by a normalizer property.
 *
 * This is implemented as `opacity(input, normalizer/globalMax(normalizer))
 *
 * @param {Color} input - input color to normalize
 * @param {Number} normalizer - numeric property that will be used to normalize the input color
 * @return {Color}
 *
 * @example <caption>Normalize an input property ($winner_party) by a second property ($voters).</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.alphaNormalize(
 *              s.ramp(s.prop('winner_party'), [red, blue]),
 *              s.prop('voters')
 *          )
 * });
 *
 * @example <caption>Normalize an input property ($winner_party) by a second property ($voters). (String)</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: alphaNormalize(
 *              ramp($winner_party, [red, blue]),
 *              $voters
 *          )
 * });
 *
 * @memberof carto.expressions
 * @name alphaNormalize
 * @function
 * @api
 */
export default class AlphaNormalize extends BaseExpression {
    constructor (input, normalizer) {
        checkMaxArguments(arguments, 2, 'alphaNormalize');

        super({ _impostor: opacity(input, div(normalizer, globalMax(normalizer))) });
        this.type = 'color';
        this.inlineMaker = inline => inline._impostor;
    }

    get value () {
        return this.eval();
    }

    eval (f) {
        return this._impostor.eval(f);
    }
}
