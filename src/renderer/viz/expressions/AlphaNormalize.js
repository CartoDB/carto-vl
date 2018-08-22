import BaseExpression from './base';
import { div, globalMax, opacity } from '../expressions';
import { checkMaxArguments, checkType, checkInstance, checkExpression } from './utils';
import Property from './basic/property';

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
        checkExpression('alphaNormalize', 'input', 0, input);
        checkExpression('alphaNormalize', 'normalizer', 1, normalizer);

        super({ _impostor: opacity(input, div(normalizer, globalMax(normalizer))) });
        this._input = input;
        this._normalizer = normalizer;
        this.type = 'color';
        this.inlineMaker = inline => inline._impostor;
    }

    _bindMetadata (meta) {
        this._input._bindMetadata(meta);
        this._normalizer._bindMetadata(meta);
        checkType('alphaNormalize', 'input', 0, 'color', this._input);
        checkType('alphaNormalize', 'normalizer', 1, 'number', this._normalizer);
        checkInstance('alphaNormalize', 'normalizer', 1, Property, this._normalizer);
        super._bindMetadata(meta);
    }

    get value () {
        return this.eval();
    }

    eval (f) {
        return this._impostor.eval(f);
    }
}
