import Classifier from './Classifier';
import { checkNumber, checkType, checkMaxArguments, checkMinArguments } from '../utils';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../../errors/carto-validation-error';

import { viewportHistogram } from '../../expressions';
import { calculateBreakpoints } from './GlobalStandardDev';
import { DEFAULT_HISTOGRAM_SIZE } from './Classifier';

/**
 * Classify `input` by using the Mean-Standard Deviation method with `n` buckets.
 *
 * It will classify the input based on the filtered dataset, filtering by viewport and by `filter`.
 *
 * It uses average and standard deviation (population formula) to classify the dataset.
 * When using an odd number of buckets, the central class has a double size (classSize * 2), to honour the number of required buckets
 *
 * This method is suitable if data are normally (or near normal) distributed, and it is specially
 * appropiated for diverging datasets, which can be well displayed using a diverging color scheme like TEALROSE
 *
 *
 * @param {Number} input - The input expression to classify
 * @param {Number} n - Number of buckets
 * @param {Number?} classSize - Optional. The class size, defaults to 1.0 standard deviation (usual values are also 0.5 or 0.25)
 * @param {Number?} histogramSize - Optional (DEFAULT_HISTOGRAM_SIZE = 1000).  Histogram 'size' used for calculations (the bigger, the more precision)
 * @return {Category}
 *
 * @example <caption>Use viewport mean-standard deviation to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.viewportStandardDev(s.prop('density'), 5), s.palettes.TEALROSE)
 * });
 *
 * @example <caption>Use viewport mean-standard deviation to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(viewportStandardDev($density, 5), tealrose)
 * `);
 *
 * @example <caption>Use viewport custom mean-standard deviation to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.viewportStandardDev(s.prop('density'), 7, 0.5), s.palettes.TEALROSE)
 * });
 *
 * @example <caption>Use viewport custom mean-standard deviation to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(viewportStandardDev($density, 7, 0.5), tealrose)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportStandardDev
 * @function
 * @api
 */

export default class ViewportStandardDev extends Classifier {
    constructor (input, buckets, classSize = 1.0, histogramSize = DEFAULT_HISTOGRAM_SIZE) {
        checkMinArguments(arguments, 2, 'viewportStandardDev');
        checkMaxArguments(arguments, 4, 'viewportStandardDev');

        super({ input, buckets, _classSize: classSize, _histogramSize: histogramSize });
    }

    _resolveAliases (aliases) {
        super._resolveAliases(aliases);

        this._validateClassSizeIsProperNumber();
        this._histogramInitialization();
    }

    _histogramInitialization () {
        this._validateHistogramSizeIsProperNumber();

        const input = this.input;
        const histogramSize = this._histogramSize.value;
        const children = { _histogram: viewportHistogram(input, histogramSize) };
        this._initializeChildren(children);
    }

    _validateClassSizeIsProperNumber () {
        const classSize = this._classSize.value;
        checkNumber(this.expressionName, 'classSize', 2, classSize);
        if (classSize <= 0) {
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} The 'classSize' must be > 0.0, but ${classSize} was used.`);
        }
    }

    _validateHistogramSizeIsProperNumber () {
        const histogramSize = this._histogramSize.value;
        checkNumber(this.expressionName, 'histogramSize', 3, histogramSize);
        if (histogramSize <= 0) {
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} The 'histogramSize' must be > 0, but ${histogramSize} was used`);
        }
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        checkType('viewportStandardDev', 'input', 0, 'number', this.input);
    }

    _validateInputIsNumericProperty () { /* noop */ }

    _genBreakpoints () {
        const histogram = this._histogram.value;
        if (histogram === undefined) { return; }

        const avg = this._getAverageFrom(histogram);
        const stdev = this._getStandardDevFrom(histogram, avg);

        this._updateBreakpointsWith({ avg, stdev });
    }

    _updateBreakpointsWith ({ avg, stdev }) {
        const breaks = calculateBreakpoints(avg, stdev, this.numCategories, this._classSize.value);

        this.breakpoints.forEach((breakpoint, index) => {
            breakpoint.expr = breaks[index];
        });
    }

    _getAverageFrom (histogram) {
        let sumFrequencies = 0.0;
        let sumMidValueFrequencies = 0.0;
        histogram.forEach(({ x, y }) => {
            sumFrequencies += y;

            const midValue = (x[0] + x[1]) / 2.0;
            sumMidValueFrequencies += midValue * y;
        });

        const avg = sumMidValueFrequencies / sumFrequencies;
        return avg;
    }

    _getStandardDevFrom (histogram, average) {
        let sumFrequencies = 0.0;
        let sumPowDifferences = 0.0;
        histogram.forEach(({ x, y }) => {
            sumFrequencies += y;

            const midValue = (x[0] + x[1]) / 2.0;
            const diff = (midValue - average);
            sumPowDifferences += y * diff * diff;
        });

        const variance = sumPowDifferences / sumFrequencies;
        return Math.sqrt(variance);
    }
}
