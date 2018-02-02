import Expression from './expression';

export default class Linear extends Expression {
    /**
     * @api
     * @description get the current timestamp
     */
    constructor(input, min, max) {
        super({ input, min, max });
        console.log(this);
    }
    _compile(metadata) {
        super._compile(metadata);
        this.inlineMaker = (inline) => `((${inline.input}-${inline.min})/(${inline.max}-${inline.min}))`;
    }
}
