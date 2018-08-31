import Classifier from './Classifier';
import Property from '../basic/property';
import { checkNumber, checkInstance, checkType, checkExpression, checkMaxArguments } from '../utils';
import { average, standardDeviation } from '../stats';

/**
 * Classify `input` by using the Mean-Standard Deviation method with `n` buckets.
 * It uses average and standard deviation to classify the dataset, using population formulas.
 * This method is suitable if data are normally (or near normal) distributed, and it is specially
 * appropiated for diverging datasets, where it can be well displayed using a diverging color scheme like TEALROSE
 *
 * It will classify the input based on the entire dataset without filtering by viewport or by `filter`.
 *
 * @param {Number} input - The input expression to classify
 * @param {number} n - Number of buckets
 * @param {number?} viz - Optional. The new Viz object
 * @return {Category}
 *
 * @example <caption>Use global standard deviation to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.globalMeanStandardDev(s.prop('density'), 5), s.palettes.TEALROSE)
 * });
 *
 * @example <caption>Use global standard deviation to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(globalMeanStandardDev($density, 5), TEALROSE)
 * `);
 *
 * @memberof carto.expressions
 * @name globalMeanStandardDev
 * @function
 * @api
 */
export default class GlobalMeanStandardDev extends Classifier {
    constructor (input, buckets) {
        checkMaxArguments(arguments, 2, 'globalMeanStandardDev');
        checkInstance('globalMeanStandardDev', 'input', 0, Property, input && (input.property || input));
        checkNumber('globalMeanStandardDev', 'buckets', 1, buckets);
        super({ input }, buckets);
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

        console.log(avg, standardDev);

        let breaks;
        let over = [];
        let under = [];
        let factor;

        const isEven = this.buckets % 2 === 0;

        factor = isEven ? 0.0 : 1.0; // even: starts with average
        do {
            // console.log('FACTOR: ', factor + 1);
            // console.log('>>>over: ', over);
            // console.log('>>>under: ', under);
            over.push(avg + (factor * standardDev));
            under.push(avg - (factor * standardDev));
            breaks = [...new Set(over.concat(under))].sort();
            factor++;
            // console.log('<<<over: ', over);
            // console.log('<<<under: ', under);
            // console.log('breaks: ', breaks);
            // console.log('enough: ', breaks.length + 1);
        } while (breaks.length + 1 < this.buckets);

        this.breakpoints.forEach((breakpoint, index) => {
            breakpoint.expr = breaks[index];
        });
    }
}
