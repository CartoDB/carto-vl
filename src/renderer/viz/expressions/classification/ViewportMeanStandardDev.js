import Classifier from './Classifier';
import Property from '../basic/property';
import { checkNumber, checkInstance, checkType, checkExpression, checkMaxArguments } from '../utils';
import { viewportHistogram } from '../../expressions';
import { calculateBreakpoints } from './GlobalMeanStandardDev';
import { average, standardDeviation } from '../stats';

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
 *   color: s.ramp(s.viewportMeanStandardDev(s.prop('density'), 5), s.palettes.TEALROSE)
 * });
 *
 * @example <caption>Use viewport mean-standard deviation to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(viewportMeanStandardDev($density, 5), tealrose)
 * `);
 *
 * @example <caption>Use viewport custom mean-standard deviation to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.viewportMeanStandardDev(s.prop('density'), 7, 0.5), s.palettes.TEALROSE)
 * });
 *
 * @example <caption>Use viewport custom mean-standard deviation to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(viewportMeanStandardDev($density, 7, 0.5), tealrose)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportMeanStandardDev
 * @function
 * @api
 */

export default class ViewportMeanStandardDev extends Classifier {
    constructor (input, buckets, classSize = 1.0) {
        checkMaxArguments(arguments, 3, 'viewportMeanStandardDev');
        checkInstance('viewportMeanStandardDev', 'input', 0, Property, input && (input.property || input));
        checkNumber('viewportMeanStandardDev', 'buckets', 1, buckets);
        checkNumber('viewportMeanStandardDev', 'classSize', 2, classSize);

        const children = { input, _histogram: viewportHistogram(input) };
        super(children, buckets);
        this._classSize = classSize;
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkExpression('viewportMeanStandardDev', 'input', 0, this.input);
        checkType('viewportMeanStandardDev', 'input', 0, 'number', this.input);
    }

    _genBreakpoints () {
        const sample = this._getSampleFromHistogram();
        const avg = average(sample);
        const standardDev = standardDeviation(sample);
        // TODO this could be optimized calculating avg & standardDev from histogram itself

        const breaks = calculateBreakpoints(avg, standardDev, this.buckets, this._classSize);
        console.log(breaks);
        this.breakpoints.forEach((breakpoint, index) => {
            breakpoint.expr = breaks[index];
        });
    }

    _getSampleFromHistogram () {
        const hist = this._histogram.value;
        let sample = [];
        hist.forEach(({ x, y }) => {
            if (y === 0) {
                return;
            }
            const avg = (x[0] + x[1]) / 2.0;
            const repeat = Array(y).fill(avg);
            sample = sample.concat(repeat);
        });
        return sample;
    }
}
