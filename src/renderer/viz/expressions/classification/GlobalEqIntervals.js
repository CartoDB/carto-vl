import Classifier from './Classifier';
import Property from '../basic/property';
import { checkNumber, checkInstance, checkType, checkExpression, checkMaxArguments } from '../utils';

/**
 * Classify `input` by using the equal intervals method with `n` buckets.
 *
 * It will classify the input based on the entire dataset without filtering by viewport or by `filter`.
 *
 * @param {Number} input - The input expression to classify
 * @param {number} n - Number of buckets
 * @return {Category}
 *
 * @example <caption>Use global equal intervals to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.globalEqIntervals(s.prop('density'), 5), s.palettes.PRISM)
 * });
 *
 * @example <caption>Use global equal intervals to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(globalEqIntervals($density, 5), PRISM)
 * `);
 *
 * @memberof carto.expressions
 * @name globalEqIntervals
 * @function
 * @api
 */
export default class GlobalEqIntervals extends Classifier {
    constructor (input, buckets) {
        checkMaxArguments(arguments, 2, 'globalEqIntervals');
        checkInstance('globalEqIntervals', 'input', 0, Property, input && (input.property || input));
        checkNumber('globalEqIntervals', 'buckets', 1, buckets);

        super({ input }, buckets);
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkExpression('globalEqIntervals', 'input', 0, this.input);
        checkType('globalEqIntervals', 'input', 0, 'number', this.input);
        const { min, max } = metadata.properties[this.input.name];
        this.min = min;
        this.max = max;
        this.breakpoints.map((breakpoint, index) => {
            const p = (index + 1) / this.numCategories;
            breakpoint.expr = min + (max - min) * p;
        });
    }
}
