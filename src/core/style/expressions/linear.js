import Expression from './expression';

/**
* Linearly interpolates the value of a given property between min and max.
* 
* @param {carto.style.expressions.property} property - The property to be evaluated and interpolated
* @param {carto.style.expressions.expression} min - Numeric expression pointing to the lower limit
* @param {carto.style.expressions.expression} max - Numeric expression pointing to the higher limit
* @return {carto.style.expressions.expression} 
* 
* @example <caption> Display points with a different color depending on the `category` property. </caption>
* const s = carto.style.expressions;
* const style = new carto.Style({
*  color: s.ramp(s.linear(s.prop('speed', 10, 100), PRISM),
* });
* 
* @memberof carto.style.expressions
* @name ramp
* @function
* @api
*/
export default class Linear extends Expression {
    constructor(input, min, max) {
        super({ input, min, max });
    }
    _compile(metadata) {
        this.type = 'float';
        super._compile(metadata);
        this.inlineMaker = (inline) => `((${inline.input}-${inline.min})/(${inline.max}-${inline.min}))`;
    }
    eval(feature) {
        const v = this.input.eval(feature);
        const min = this.min.eval(feature);
        const max = this.max.eval(feature);
        return (v - min) / (max - min);
    }
}
