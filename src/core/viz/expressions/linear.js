import Expression from './expression';
import { checkExpression, checkLooseType, implicitCast, checkType } from './utils';

/**
* Linearly interpolates the value of a given input between min and max.
*
*
* @param {carto.style.expressions.expression} input - The input to be evaluated and interpolated, can be a numeric property or a date property
* @param {carto.style.expressions.expression} min - Numeric or date expression pointing to the lower limit
* @param {carto.style.expressions.expression} max - Numeric or date expression pointing to the higher limit
* @return {carto.style.expressions.expression}
*
* @example <caption> Display points with a different color depending on the `category` property. </caption>
* const s = carto.style.expressions;
* const style = new carto.Viz({
*  color: s.ramp(s.linear(s.prop('speed', 10, 100), PRISM),
* });
*
* @memberof carto.style.expressions
* @name linear
* @function
* @api
*/
export default class Linear extends Expression {
    constructor(input, min, max) {
        input = implicitCast(input);
        min = implicitCast(min);
        max = implicitCast(max);

        checkExpression('linear', 'input', 0, input);
        checkExpression('linear', 'min', 1, min);
        checkExpression('linear', 'max', 2, max);

        super({ input, min, max });

        if (this.min.type != 'time') {
            checkLooseType('linear', 'input', 0, 'float', this.input);
            checkLooseType('linear', 'min', 1, 'float', this.min);
            checkLooseType('linear', 'max', 2, 'float', this.max);
        }
        this.type = 'float';
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
            checkType('linear', 'input', 0, 'float', this.input);
            checkType('linear', 'min', 1, 'float', this.min);
            checkType('linear', 'max', 2, 'float', this.max);

            this.inlineMaker = (inline) => `((${inline.input}-${inline.min})/(${inline.max}-${inline.min}))`;
        }
    }
    eval(feature) {
        const v = this.input.eval(feature);
        const min = this.min.eval(feature);
        const max = this.max.eval(feature);
        return (v - min) / (max - min);
    }
}
