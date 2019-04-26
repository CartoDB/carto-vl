import Classifier from './Classifier';
import { checkExactNumberOfArguments, checkType } from '../utils';
import { CLUSTER_FEATURE_COUNT } from '../../../../constants/metadata';
import CartoValidationError, { CartoValidationErrorTypes } from '../../../../errors/carto-validation-error';

/**
 * Classify `input` by using the quantiles method with `n` buckets.
 *
 * It will classify the input based on the entire dataset without filtering by viewport or by `filter`.
 *
 * @param {Number} input - The input expression used in the quantiles
 * @param {number} n - Number of buckets to be returned
 * @return {Category}
 *
 * @example <caption>Use global quantiles to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.globalQuantiles(s.prop('density'), 5), s.palettes.CB_REDS)
 * });
 *
 * @example <caption>Use global quantiles to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(globalQuantiles($density, 5), CB_REDS)
 * `);
 *
 * @memberof carto.expressions
 * @name globalQuantiles
 * @function
 * @api
 */
export default class GlobalQuantiles extends Classifier {
    constructor (input, buckets) {
        checkExactNumberOfArguments(arguments, 2, 'globalQuantiles');
        super({ input, buckets });
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        checkType('globalQuantiles', 'input', 0, 'number', this.input);
        this._updateBreakpointsWith(metadata);
    }

    _validateInputIsNumericProperty () { /* noop */ }

    _updateBreakpointsWith (metadata) {
        if (this.input.propertyName === CLUSTER_FEATURE_COUNT) {
            throw new CartoValidationError(
                '\'clusterCount\' can not be used in GlobalQuantiles. Consider using ViewportQuantiles instead',
                CartoValidationErrorTypes.INCORRECT_TYPE
            );
        }

        const name = this.input.name;
        const copy = metadata.sample.map(s => s[name]);
        copy.sort((x, y) => x - y);

        this.breakpoints.map((breakpoint, index) => {
            const p = (index + 1) / this.numCategories;
            breakpoint.expr = copy[Math.floor(p * copy.length)];
        });
    }
}
