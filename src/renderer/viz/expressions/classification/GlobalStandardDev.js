import Classifier from './Classifier';
import Property from '../basic/property';
import { checkNumber, checkInstance, checkType, checkExpression, checkMaxArguments } from '../utils';
import { average, standardDeviation } from '../stats';

/**
 * Classify `input` by using the Mean-Standard Deviation method with `n` buckets.
 *
 * It will classify the input based on the entire dataset without filtering by viewport or by `filter`.
 *
 * It uses average and standard deviation (population formula) to classify the dataset.
 * When using an odd number of buckets, the central class has a double size (classSize * 2), to honour the number of required buckets
 *
 * This method is suitable if data are normally (or near normal) distributed, and it is specially
 * appropiated for diverging datasets, which can be well displayed using a diverging color scheme like TEALROSE
 *
 * @param {Number} input - The input expression to classify
 * @param {number} n - Number of buckets
 * @param {number?} classSize - Optional. The class size, defaults to 1.0 standard deviation (usual values are also 0.5 or 0.25)
 * @return {Category}
 *
 * @example <caption>Use global mean-standard deviation to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.globalStandardDev(s.prop('density'), 5), s.palettes.TEALROSE)
 * });
 *
 * @example <caption>Use global mean-standard deviation to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(globalStandardDev($density, 5), TEALROSE)
 * `);
 *
 * @example <caption>Use global custom mean-standard deviation to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.globalStandardDev(s.prop('density'), 7, 0.5), s.palettes.TEALROSE)
 * });
 *
 * @example <caption>Use global custom mean-standard deviation to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(globalStandardDev($density, 7, 0.5), TEALROSE)
 * `);
 *
 * @memberof carto.expressions
 * @name globalStandardDev
 * @function
 * @api
 */
export default class GlobalStandardDev extends Classifier {
    constructor (input, buckets, classSize = 1.0) {
        checkMaxArguments(arguments, 3, 'globalStandardDev');
        checkInstance('globalStandardDev', 'input', 0, Property, input && (input.property || input));
        checkNumber('globalStandardDev', 'buckets', 1, buckets);
        checkNumber('globalStandardDev', 'classSize', 2, classSize);

        if (classSize <= 0) {
            throw new RangeError(`The 'classSize must be > 0.0, but '${classSize}' was used.`);
        }

        super({ input }, buckets);
        this._classSize = classSize;
        this._sample = [];
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkExpression('globalStandardDev', 'input', 0, this.input);
        checkType('globalStandardDev', 'input', 0, 'number', this.input);

        const sample = metadata.sample.map(s => s[this.input.name]);
        const avg = average(sample);
        const standardDev = standardDeviation(sample);
        const breaks = calculateBreakpoints(avg, standardDev, this.numCategories, this._classSize);

        this.breakpoints.forEach((breakpoint, index) => {
            breakpoint.expr = breaks[index];
        });
    }
}

/**
 * Calculate breakpoints according to mean-standard deviation process
 *
 * @export
 * @param {Number} avg - average
 * @param {Number} stDev - standard deviation
 * @param {Number} buckets - number of buckets
 * @param {Number} classSize - in standard deviation units (usually 1.0, 0.5, 0.25...)
 * @returns {Number[]}
 */
export function calculateBreakpoints (avg, stDev, buckets, classSize) {
    let breaks;
    let over = [];
    let under = [];
    const isEven = buckets % 2 === 0;
    let factor = isEven ? 0.0 : 1.0; // if odd, central class is double sized
    do {
        const step = factor * (stDev * classSize);
        over.push(avg + step);
        under.push(avg - step);
        breaks = [...new Set(over.concat(under))];
        breaks.sort((a, b) => a - b);
        factor++;
    } while (breaks.length < buckets - 1);

    return breaks;
}
