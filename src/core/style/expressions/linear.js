import Expression from './expression';

export default class Linear extends Expression {
    /**
     * @description get the current timestamp
     */
    constructor(input, min, max) {
        super({ input, min, max });
    }
    _compile(metadata) {
        this.type = 'float';
        super._compile(metadata);
        this.inlineMaker = (inline) => `((${inline.input}-${inline.min})/(${inline.max}-${inline.min}))`;
    }
}
