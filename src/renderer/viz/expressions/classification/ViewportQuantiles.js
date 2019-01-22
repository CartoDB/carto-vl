import Classifier from './Classifier';
import { checkNumber, checkType, checkMaxArguments, checkMinArguments } from '../utils';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../../errors/carto-validation-error';

import { viewportHistogram } from '../../expressions';
import { DEFAULT_HISTOGRAM_SIZE } from './Classifier';

/**
 * Classify `input` by using the quantiles method with `n` buckets.
 *
 * It will classify the input based on the filtered dataset, filtering by viewport and by `filter`.
 *
 * @param {Number} input - The input expression used in the quantiles
 * @param {Number} n - Number of buckets to be returned
 * @param {Number?} histogramSize - Optional (DEFAULT_HISTOGRAM_SIZE = 1000).  Histogram 'size' used for calculations (the bigger, the more precision)
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
    constructor (input, buckets, histogramSize = DEFAULT_HISTOGRAM_SIZE) {
        checkMinArguments(arguments, 2, 'viewportQuantiles');
        checkMaxArguments(arguments, 3, 'viewportQuantiles');

        super({ input, buckets, _histogramSize: histogramSize });
    }

    _resolveAliases (aliases) {
        super._resolveAliases(aliases);

        this._histogramInitialization();
    }

    _histogramInitialization () {
        this._validateHistogramSizeIsProperNumber();

        const input = this.input;
        const histogramSize = this._histogramSize.value;
        const children = { _histogram: viewportHistogram(input, histogramSize) };
        this._initializeChildren(children);
    }

    _validateHistogramSizeIsProperNumber () {
        const histogramSize = this._histogramSize.value;
        checkNumber(this.expressionName, 'histogramSize', 2, histogramSize);
        if (histogramSize <= 0) {
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} The 'histogramSize' must be > 0, but ${histogramSize} was used`);
        }
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        checkType('viewportQuantiles', 'input', 0, 'number', this.input);
    }

    _validateInputIsNumericProperty () { /* noop */ }

    _genBreakpoints () {
        const histogram = this._histogram.value;
        if (histogram === undefined) { return; }

        const accumHistogram = this._getAccumHistogramFrom(histogram);
        const [min, max] = this._getMinMaxFrom(histogram);

        this._updateBreakpointsWith({ accumHistogram, min, max });
    }

    _updateBreakpointsWith ({ accumHistogram, min, max }) {
        const histogramBuckets = accumHistogram.length;

        let i = 0;
        const total = accumHistogram[histogramBuckets - 1];
        // TODO OPT: this could be faster with binary search
        this.breakpoints.map((breakpoint, index) => {
            for (i; i < histogramBuckets; i++) {
                if (accumHistogram[i] > (index + 1) / this.numCategories * total) {
                    break;
                }
            }
            const percentileValue = i / histogramBuckets * (max - min) + min;
            breakpoint.expr = percentileValue;
        });
    }

    _getAccumHistogramFrom (histogram) {
        let prev = 0;
        const accumHistogram = histogram.map(({ y }) => {
            prev += y;
            return prev;
        });
        return accumHistogram;
    }

    _getMinMaxFrom (histogram) {
        const min = histogram[0].x[0];
        const max = histogram[histogram.length - 1].x[1];

        return [min, max];
    }
}
