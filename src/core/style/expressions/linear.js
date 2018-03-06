import Expression from './expression';

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
