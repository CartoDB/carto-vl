import Expression from './expression';
import { checkNumber } from './utils';


export default class FloatConstant extends Expression {
    /**
     * @jsapi
     * @param {*} x
     */
    constructor(x) {
        checkNumber('float', 'x', 0, x);
        super({});
        this.expr = x;
        this.type = 'float';
        this.inlineMaker = () => `(${x.toFixed(20)})`;
    }

    eval() {
        return this.expr;
    }
}
