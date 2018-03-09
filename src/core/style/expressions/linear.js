import Expression from './expression';

export default class Linear extends Expression {
    constructor(input, min, max) {
        super({ input, min, max });
    }
    _compile(metadata) {
        this.type = 'float';
        super._compile(metadata);
        if (this.input.type == 'date') {
            const min = this.min.eval().getTime();
            const max = this.max.eval().getTime();

            const inputMin = metadata.columns.find(c => c.name == this.input.name).min.getTime();
            const inputMax = metadata.columns.find(c => c.name == this.input.name).max.getTime();
            const inputDiff = inputMax - inputMin;

            const smin = (min - inputMin) / inputDiff;
            const smax = (max - inputMin) / inputDiff;
            this.inlineMaker = (inline) => `((${inline.input}-${smin.toFixed(20)})/(${(smax - smin).toFixed(20)}))`;

        } else {
            this.inlineMaker = (inline) => `((${inline.input}-${this.min.value.expr})/(${inline.max}-${inline.min}))`;
        }
    }
    eval(feature) {
        const v = this.input.eval(feature);
        const min = this.min.eval(feature);
        const max = this.max.eval(feature);
        return (v - min) / (max - min);
    }
}
