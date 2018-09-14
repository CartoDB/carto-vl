import Classifier from './Classifier';
import { checkNumber, checkType, checkMaxArguments } from '../utils';
import { viewportHistogram } from '../../expressions';
import { calculateBreakpoints } from './GlobalStandardDev';

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
 * @param {number} n - Number of buckets
 * @param {number?} classSize - Optional. The class size, defaults to 1.0 standard deviation (usual values are also 0.5 or 0.25)
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
    constructor (input, buckets, classSize = 1.0) {
        checkMaxArguments(arguments, 3, 'viewportStandardDev');
        checkNumber('viewportStandardDev', 'buckets', 1, buckets);
        checkNumber('viewportStandardDev', 'classSize', 2, classSize);

        if (classSize <= 0) {
            throw new RangeError(`The 'classSize' must be > 0.0, but '${classSize}' was used.`);
        }

        const children = { input, _histogram: viewportHistogram(input) };
        super(children, buckets);
        this._classSize = classSize;
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkType('viewportStandardDev', 'input', 0, ['number'], this.input);
    }

    _genBreakpoints () {
        const avg = this._averageFrom(this._histogram.value);
        const stdev = this._standardDevFrom(this._histogram.value, avg);
        const breaks = calculateBreakpoints(avg, stdev, this.numCategories, this._classSize);

        this.breakpoints.forEach((breakpoint, index) => {
            breakpoint.expr = breaks[index];
        });
    }

    _averageFrom (histogram) {
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

    _standardDevFrom (histogram, average) {
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
