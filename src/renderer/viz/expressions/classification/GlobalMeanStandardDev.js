import Classifier from './Classifier';
import Property from '../basic/property';
import { checkNumber, checkInstance, checkType, checkExpression, checkMaxArguments } from '../utils';
import { average, standardDeviation } from '../stats';

/**
 * Classify `input` by using the Mean-Standard Deviation method with `n` buckets.
 * It uses average and standard deviation (population formula) to classify the dataset.
 * When using an odd number of buckets, the central class has a double size (classSize * 2), to honour the number of required buckets
 *
 * This method is suitable if data are normally (or near normal) distributed, and it is specially
 * appropiated for diverging datasets, which can be well displayed using a diverging color scheme like TEALROSE
 *
 * It will classify the input based on the entire dataset without filtering by viewport or by `filter`.
 *
 * @param {Number} input - The input expression to classify
 * @param {number} n - Number of buckets
 * @param {number?} classSize - Optional. The class size, defaults to 1.0 standard deviation (usual values are also 0.5 or 0.25)
 * @return {Category}
 *
 * @example <caption>Use global mean-standard deviation to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.globalMeanStandardDev(s.prop('density'), 5), s.palettes.TEALROSE)
 * });
 *
 * @example <caption>Use global mean-standard deviation to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(globalMeanStandardDev($density, 5), TEALROSE)
 * `);
 *
 * @example <caption>Use global custom mean-standard deviation to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.globalMeanStandardDev(s.prop('density'), 7, 0.5), s.palettes.TEALROSE)
 * });
 *
 * @example <caption>Use global custom mean-standard deviation to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(globalMeanStandardDev($density, 7, 0.5), TEALROSE)
 * `);
 *
 * @memberof carto.expressions
 * @name globalMeanStandardDev
 * @function
 * @api
 */
export default class GlobalMeanStandardDev extends Classifier {
    constructor (input, buckets, classSize = 1.0) {
        checkMaxArguments(arguments, 3, 'globalMeanStandardDev');
        checkInstance('globalMeanStandardDev', 'input', 0, Property, input && (input.property || input));
        checkNumber('globalMeanStandardDev', 'buckets', 1, buckets);
        checkNumber('globalMeanStandardDev', 'classSize', 2, classSize);

        super({ input }, buckets);
        this._classSize = classSize;
        this._sample = [];
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkExpression('globalMeanStandardDev', 'input', 0, this.input);
        checkType('globalMeanStandardDev', 'input', 0, 'number', this.input);
        this._sample = metadata.sample.map(s => s[this.input.name]);
    }

    _genBreakpoints () {
        const avg = average(this._sample);
        const standardDev = standardDeviation(this._sample);
        let breaks;
        let over = [];
        let under = [];

        const isEven = this.buckets % 2 === 0;
        let factor = isEven ? 0.0 : 1.0; // if odd, central class is double sized
        do {
            over.push(avg + (factor * standardDev * this._classSize));
            under.push(avg - (factor * standardDev * this._classSize));
            breaks = [...new Set(over.concat(under))].sort();
            factor++;
        } while (breaks.length + 1 < this.buckets);

        this.breakpoints.forEach((breakpoint, index) => {
            breakpoint.expr = breaks[index];
        });
    }
}
