import BaseExpression from './base';
import { checkExpression, checkLooseType, implicitCast, checkType } from './utils';

/**
* Linearly interpolates the value of a given input between min and max.
*
* @param {carto.expressions.Base} input - The input to be evaluated and interpolated, can be a numeric property or a date property
* @param {carto.expressions.Base} min - Numeric or date expression pointing to the lower limit
* @param {carto.expressions.Base} max - Numeric or date expression pointing to the higher limit
* @return {carto.expressions.Base}
*
* @example <caption> Display points with a different color depending on the `category` property. </caption>
* const s = carto.expressions;
* const viz = new carto.Viz({
*   color: s.ramp(s.linear(s.prop('speed'), 10, 100), s.PRISM),
* });
*
* @memberof carto.expressions
* @function
* @name linear
* @api
*/
export default class Linear extends BaseExpression {
    constructor(input, min, max) {
        input = implicitCast(input);
        min = implicitCast(min);
        max = implicitCast(max);

        checkExpression('linear', 'input', 0, input);
        checkExpression('linear', 'min', 1, min);
        checkExpression('linear', 'max', 2, max);

        super({ input, min, max });

        if (this.min.type != 'time') {
            checkLooseType('linear', 'input', 0, 'number', this.input);
            checkLooseType('linear', 'min', 1, 'number', this.min);
            checkLooseType('linear', 'max', 2, 'number', this.max);
        }
        this.type = 'number';
    }
    eval(feature) {
        const v = this.input.eval(feature);
        const min = this.min.eval(feature);
        const max = this.max.eval(feature);
        return (v - min) / (max - min);
    }
    _compile(metadata) {
        super._compile(metadata);

        if (this.input.type == 'date') {
            const min = this.min.eval().getTime();
            const max = this.max.eval().getTime();

            const inputMin = metadata.columns.find(c => c.name == this.input.name).min.getTime();
            const inputMax = metadata.columns.find(c => c.name == this.input.name).max.getTime();
            const inputDiff = inputMax - inputMin;

            const smin = (min - inputMin) / inputDiff;
            const smax = (max - inputMin) / inputDiff;
            this.inlineMaker = (inline) => `((${inline.input}-(${smin.toFixed(20)}))/(${(smax - smin).toFixed(20)}))`;

        } else {
            checkType('linear', 'input', 0, 'number', this.input);
            checkType('linear', 'min', 1, 'number', this.min);
            checkType('linear', 'max', 2, 'number', this.max);

            this.inlineMaker = (inline) => `((${inline.input}-${inline.min})/(${inline.max}-${inline.min}))`;
        }
    }
}
