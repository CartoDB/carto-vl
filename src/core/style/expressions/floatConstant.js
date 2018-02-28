import Expression from './expression';


export default class FloatConstant extends Expression {
    /**
     * @jsapi
     * @param {*} x
     */
    constructor(x) {
        if (!Number.isFinite(x)) {
            throw new Error(`Invalid arguments to Float(): ${x}`);
        }
        super({});
        this.expr = x;
        this.type = 'float';
        this.inlineMaker = ()=> `(${x.toFixed(20)})`;
    }

    eval(){
        return this.expr;
    }
}