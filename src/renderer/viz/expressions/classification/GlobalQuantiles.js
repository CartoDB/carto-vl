import Classifier, { DEFAULT_HISTOGRAM_SIZE } from './Classifier';
import { checkMinArguments, checkMaxArguments } from '../utils';
import { globalHistogram } from '../../expressions';

/**
 * Classify `input` by using the quantiles method with `n` buckets.
 *
 * It will classify the input based on the entire dataset without filtering by viewport or by `filter`.
 *
 * @param {Number} input - The input expression used in the quantiles
 * @param {number} n - Number of buckets to be returned
 * @return {Category}
 *
 * @example <caption>Use global quantiles to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.globalQuantiles(s.prop('density'), 5), s.palettes.CB_REDS)
 * });
 *
 * @example <caption>Use global quantiles to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(globalQuantiles($density, 5), CB_REDS)
 * `);
 *
 * @memberof carto.expressions
 * @name globalQuantiles
 * @function
 * @api
 */
export default class GlobalQuantiles extends Classifier {
    constructor (input, buckets, histogramSize = DEFAULT_HISTOGRAM_SIZE) {
        checkMinArguments(arguments, 2, 'globalQuantiles');
        checkMaxArguments(arguments, 3, 'globalQuantiles');

        super({ input, buckets, _histogramSize: histogramSize });
    }

    _histogramInitialization () {
        const input = this.input;
        const histogramSize = this._histogramSize.value;

        this._histogram = globalHistogram(input, histogramSize);
    }

    _resolveAliases (aliases) {
        super._resolveAliases(aliases);

        this._histogramInitialization();
    }

    _bindMetadata (metadata) {
        this._metadata = metadata;
        this._genBreakpoints();
    }

    _genBreakpoints () {
        const histogram = this._histogram.value;
        if (histogram === undefined || !histogram.length) { return; }

        const [min, max] = this._getMinMaxFrom(histogram);

        this._updateBreakpointsWith({ histogram, min, max });
    }

    _updateBreakpointsWith ({ histogram, min, max }) {
        const histogramBuckets = histogram.length;

        let i = 0;
        const total = histogram[histogramBuckets - 1];
        // TODO OPT: this could be faster with binary search
        this.breakpoints.map((breakpoint, index) => {
            for (i; i < histogramBuckets; i++) {
                if (histogram[i] > (index + 1) / this.numCategories * total) {
                    break;
                }
            }
            const percentileValue = i / histogramBuckets * (max - min) + min;
            breakpoint.expr = percentileValue;
        });
    }

    _getMinMaxFrom (histogram) {
        const min = histogram[0].x[0];
        const max = histogram[histogram.length - 1].x[1];

        return [min, max];
    }
}
