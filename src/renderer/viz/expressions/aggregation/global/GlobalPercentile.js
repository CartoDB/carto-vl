import BaseExpression from '../../base';
import { number } from '../../../expressions';
import { checkMaxArguments, checkExpression, implicitCast, checkType, checkInstance, checkFeatureIndependent } from '../../utils';
import Property from '../../basic/property';
/**
 * Return the Nth percentile of an numeric property for the entire source data.
 *
 * @param {Number} property - numeric property
 * @param {Number} percentile - Numeric expression in the [0, 100] range, must be feature independent
 * @return {Number} Result of the aggregation
 *
 * @example <caption>Assign the 90th percentile of the `amount` property for the entire dataset to a variable.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *      v_percentile: s.globalPercentile(s.prop('amount'), 90)
 *   }
 * });
 *
 * @example <caption>Assign the 90th percentile of the `amount` property for the entire dataset to a variable. (String)</caption>
 * const viz = new carto.Viz(`
 *   \@v_percentile: globalPercentile($amount, 90)
 * `);
 *
 * @memberof carto.expressions
 * @name globalPercentile
 * @function
 * @api
 */
export default class GlobalPercentile extends BaseExpression {
    constructor (property, percentile) {
        checkMaxArguments(arguments, 2, 'globalPercentile');
        property = implicitCast(property);
        percentile = implicitCast(percentile);
        checkExpression('globalPercentile', 'property', 0, property);
        checkExpression('globalPercentile', 'percentile', 1, percentile);

        super({ _value: number(0), property, percentile });
        this.type = 'number';
        super.inlineMaker = inline => inline._value;
    }

    isFeatureDependent () {
        return false;
    }

    eval () {
        const p = this.percentile.eval() / 100;
        return this._copySample[Math.floor(p * this._copySample.length)];
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkType('globalPercentile', 'property', 0, 'number', this.property);
        checkType('globalPercentile', 'percentile', 0, 'number', this.percentile);
        checkInstance('globalPercentile', 'property', 0, Property, this.property);
        checkFeatureIndependent('globalPercentile', 'percentile', 1, this.percentile);

        this._copySample = metadata.sample.map(s => s[this.property.name]);
        this._copySample.sort((x, y) => x - y);
    }

    _preDraw (...args) {
        this._value.expr = this.value;
        super._preDraw(...args);
    }

    _getMinimumNeededSchema () {
        return this.property._getMinimumNeededSchema();
    }
}
