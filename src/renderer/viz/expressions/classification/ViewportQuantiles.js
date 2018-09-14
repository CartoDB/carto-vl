import Classifier from './Classifier';
import { checkNumber, checkType, checkMaxArguments } from '../utils';
import { viewportHistogram } from '../../expressions';

/**
 * Classify `input` by using the quantiles method with `n` buckets.
 *
 * It will classify the input based on the filtered dataset, filtering by viewport and by `filter`.
 *
 * @param {Number} input - The input expression used in the quantiles
 * @param {number} n - Number of buckets to be returned
 * @return {Category}
 *
 * @example <caption>Use viewportQuantiles to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.viewportQuantiles(s.prop('density'), 5), s.palettes.PRISM)
 * });
 *
 * @example <caption>Use viewportQuantiles to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(viewportQuantiles($density, 5), PRISM)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportQuantiles
 * @function
 * @api
 */
export default class ViewportQuantiles extends Classifier {
    constructor (input, buckets) {
        checkMaxArguments(arguments, 2, 'viewportQuantiles');
        checkNumber('viewportQuantiles', 'buckets', 1, buckets);

        const children = { input, _histogram: viewportHistogram(input) };
        super(children, buckets);
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkType('viewportQuantiles', 'input', 0, ['number'], this.input);
    }

    _genBreakpoints () {
        const hist = this._histogram.value;

        const histogramBuckets = hist.length;
        const min = hist[0].x[0];
        const max = hist[histogramBuckets - 1].x[1];

        let prev = 0;
        const accumHistogram = hist.map(({ y }) => {
            prev += y;
            return prev;
        });

        let i = 0;
        const total = accumHistogram[histogramBuckets - 1];
        let brs = [];
        // TODO OPT: this could be faster with binary search
        this.breakpoints.map((breakpoint, index) => {
            for (i; i < histogramBuckets; i++) {
                if (accumHistogram[i] > (index + 1) / this.numCategories * total) {
                    break;
                }
            }
            const percentileValue = i / histogramBuckets * (max - min) + min;
            brs.push(percentileValue);
            breakpoint.expr = percentileValue;
        });
    }
}
