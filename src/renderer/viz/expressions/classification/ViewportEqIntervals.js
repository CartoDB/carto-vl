import Classifier from './Classifier';
import { viewportMax, viewportMin } from '../../expressions';
import { checkNumber, checkType, checkMaxArguments } from '../utils';

/**
 * Classify `input` by using the equal intervals method with `n` buckets.
 *
 * It will classify the input based on the filtered dataset, filtering by viewport and by `filter`.
 *
 * @param {Number} input - The input expression to classify
 * @param {number} n - Number of buckets
 * @return {Category}
 *
 * @example <caption>Use viewport equal intervals to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.viewportEqIntervals(s.prop('density'), 5), s.palettes.PRISM)
 * });
 *
 * @example <caption>Use viewport equal intervals to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(viewportEqIntervals($density, 5), PRISM)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportEqIntervals
 * @function
 * @api
 */
export default class ViewportEqIntervals extends Classifier {
    constructor (input, buckets) {
        checkMaxArguments(arguments, 2, 'viewportEqIntervals');
        checkNumber('viewportEqIntervals', 'buckets', 1, buckets);

        const children = { input, _min: viewportMin(input), _max: viewportMax(input) };
        super(children, buckets);
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkType('viewportEqIntervals', 'input', 0, ['number'], this.input);
    }

    _genBreakpoints () {
        const min = this._min.eval();
        const max = this._max.eval();

        this.breakpoints.map((breakpoint, index) => {
            const p = (index + 1) / this.numCategories;
            breakpoint.expr = min + (max - min) * p;
        });
    }
}
