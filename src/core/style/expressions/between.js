import Expression from './expression';

/** 
 * Check if a given value belongs to an inclusive range (including limits).
 */
export default class Between extends Expression {
    constructor(value, lowerLimit, upperLimit) {
        super({ value, lowerLimit, upperLimit });
        this.type = 'float';
    }

    _compile(meta) {
        super._compile(meta);
        if (this.value.type != 'float') {
            throw new Error('Between() can only be performed to float properties');
        }
        if (this.lowerLimit.type != 'float') {
            throw new Error('Between() can only be performed to float properties');
        }
        if (this.upperLimit.type != 'float') {
            throw new Error('Between() can only be performed to float properties');
        }
        this.inlineMaker = inline => `((${inline.value} >= ${inline.lowerLimit} &&  ${inline.value} <= ${inline.upperLimit}) ? 1. : 0.)`;
    }

    eval(feature) {
        const value = this.value.eval(feature);
        const lower = this.lowerLimit.eval(feature);
        const upper = this.upperLimit.eval(feature);
        return (value >= lower && value <= upper) ? 1 : 0;
    }
}
