import BaseExpression from './base';
import { checkExpression, checkLooseType, implicitCast, checkType } from './utils';
import { globalMin, globalMax } from '../functions';

/**
* Linearly interpolates the value of a given input between a minimum and a maximum. If `min` and `max` are not defined they will
* default to `globalMin(input)` and `globalMax(input)`.
*
* @param {Number|Date} input - The input to be evaluated and interpolated, can be a numeric property or a date property
* @param {Number|Date} [min=globalMin(input)] - Numeric or date expression pointing to the lower limit
* @param {Number|Date} [max=globalMax(input)] - Numeric or date expression pointing to the higher limit
* @return {Number|Date}
*
* @example <caption> Color by $speed using the CARTOColor Prism by assigning the first color in Prism to features with speeds of 10 or less, the last color in Prism to features with speeds of 100 or more and a interpolated value for the speeds in between.</caption>
* const s = carto.expressions;
* const viz = new carto.Viz({
*   color: s.ramp(s.linear(s.prop('speed'), 10, 100), s.palettes.PRISM)
* });
*
* @example <caption> Color by $speed using the CARTOColor Prism by assigning the first color in Prism to features with speeds of 10 or less, the last color in Prism to features with speeds of 100 or more and a interpolated value for the speeds in between. (String)</caption>
* const viz = new carto.Viz(`
*   color: ramp(linear($speed, 10, 100), PRISM)
* `);
*
* @memberof carto.expressions
* @name linear
* @function
* @api
*/
export default class Linear extends BaseExpression {
    constructor(input, min, max) {
        input = implicitCast(input);

        if (min == undefined && max == undefined) {
            min = globalMin(input);
            max = globalMax(input);
        }

        min = implicitCast(min);
        max = implicitCast(max);

        checkExpression('linear', 'input', 0, input);
        checkExpression('linear', 'min', 1, min);
        checkExpression('linear', 'max', 2, max);

        super({ input, min, max });

        checkLooseType('linear', 'input', 0, ['number', 'date'], this.input);
        checkLooseType('linear', 'min', 1, ['number', 'time'], this.min);
        checkLooseType('linear', 'max', 2, ['number', 'time'], this.max);
        // FIXME check type

        this.type = 'number';
    }
    eval(feature) {
        const v = this.input.eval(feature);
        let min = this.min.eval(feature);
        let max = this.max.eval(feature);
        if (this.input.type == 'date') {
            min = this.min.getMappedValue();
            max = this.max.getMappedValue();
        }
        return (v - min) / (max - min);
    }
    _compile(metadata) {
        this._metadata = metadata;
        if (this.min.type == 'time') {
            this.min.dateProperty = this.input;
            this.max.dateProperty = this.input;
        }
        super._compile(metadata);
        checkType('linear', 'input', 0, ['number', 'date'], this.input);
        checkType('linear', 'min', 1, ['number', 'time'], this.min);
        checkType('linear', 'max', 2, ['number', 'time'], this.max);
        // FIXME check type

        this.inlineMaker = (inline) => `((${inline.input}-${inline.min})/(${inline.max}-${inline.min}))`;
    }
}
