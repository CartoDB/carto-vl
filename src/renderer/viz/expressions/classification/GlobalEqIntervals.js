import Classifier from './Classifier';
import { checkExactNumberOfArguments } from '../utils';
import { CLUSTER_FEATURE_COUNT } from '../../../../constants/metadata';
import CartoValidationError, { CartoValidationErrorTypes } from '../../../../errors/carto-validation-error';

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
        checkExactNumberOfArguments(arguments, 2, 'globalEqIntervals');
        super({ input, buckets });
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        this._updateBreakpointsWith(metadata);
    }

    _updateBreakpointsWith (metadata) {
        if (this.input.propertyName === CLUSTER_FEATURE_COUNT) {
            throw new CartoValidationError(
                '\'clusterCount\' can not be used in GlobalEqIntervals. Consider using ViewportEqIntervals instead',
                CartoValidationErrorTypes.INCORRECT_TYPE
            );
        }

        const name = this.input.name;
        const { min, max } = metadata.stats(name);
        this.min = min;
        this.max = max;

        this.breakpoints.map((breakpoint, index) => {
            const p = (index + 1) / this.numCategories;
            breakpoint.expr = min + (max - min) * p;
        });
    }
}
