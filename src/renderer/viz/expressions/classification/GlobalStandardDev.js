import Classifier from './Classifier';
import Property from '../basic/property';
import { checkNumber, checkInstance, checkType, checkExpression, checkMaxArguments } from '../utils';
// import { average, standardDeviation } from '../stats';

/**
 * Classify `input` by using the Standard Deviation method with `n` buckets.
 * It uses average and standard deviation to classify the dataset, using population formulas.
 * This method is suitable if data are normally (or near normal) distributed, and it is specially
 * appropiated for diverging datasets, where it can be well displayed using a diverging color scheme like TEALROSE
 *
 * It will classify the input based on the entire dataset without filtering by viewport or by `filter`.
 *
 * @param {Number} input - The input expression to classify
 * @param {number} n - Number of buckets
 * @return {Category}
 *
 * @example <caption>Use global standard deviation to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.globalStandardDev(s.prop('density'), 5), s.palettes.TEALROSE)
 * });
 *
 * @example <caption>Use global standard deviation to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(globalStandardDev($density, 5), TEALROSE)
 * `);
 *
 * @memberof carto.expressions
 * @name globalStandardDev
 * @function
 * @api
 */
export default class GlobalStandardDev extends Classifier {
    constructor (input, buckets) {
        checkMaxArguments(arguments, 2, 'globalStandardDev');
        checkInstance('globalStandardDev', 'input', 0, Property, input && (input.property || input));
        checkNumber('globalStandardDev', 'buckets', 1, buckets);
        super({ input }, buckets);
        this._sample = [];
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkExpression('globalStandardDev', 'input', 0, this.input);
        checkType('globalStandardDev', 'input', 0, 'number', this.input);
        this._sample = metadata.sample.map(s => s[this.input.name]);
    }

    _genBreakpoints () {
        // const avg = average(this._sample);
        // const standardDev = standardDeviation(this._sample);

        // TODO
        this.breakpoints.forEach((breakpoint, index) => {
            breakpoint.expr = 0; // fullBreaks[index + 1];
        });
    }
}
