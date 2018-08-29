import Classifier from './Classifier';
import Property from '../basic/property';
import { checkNumber, checkInstance, checkType, checkExpression, checkMaxArguments } from '../utils';

/**
 * Classify `input` by using the Jenks method with `n` buckets.
 *
 * It will classify the input based on the entire dataset without filtering by viewport or by `filter`.
 *
 * @param {Number} input - The input expression to classify
 * @param {number} n - Number of buckets
 * @return {Category}
 *
 * @example <caption>Use global jenks intervals to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.globalJenks(s.prop('density'), 5), s.palettes.CB_REDS)
 * });
 *
 * @example <caption>Use global jenks intervals to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(globalJenks($density, 5), CB_REDS)
 * `);
 *
 * @memberof carto.expressions
 * @name globalJenks
 * @function
 * @api
 */
export default class GlobalJenks extends Classifier {
    constructor (input, buckets) {
        checkMaxArguments(arguments, 2, 'globalJenks');
        checkInstance('globalJenks', 'input', 0, Property, input && (input.property || input));
        checkNumber('globalJenks', 'buckets', 1, buckets);

        super({ input }, buckets);
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkExpression('globalJenks', 'input', 0, this.input);
        checkType('globalJenks', 'input', 0, 'number', this.input);

        // TBD
    }
}
