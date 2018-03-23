import Expression from './expression';
import { float } from '../functions';

export default class Now extends Expression {
    /**
     * @description get the current timestamp
     */
    constructor() {
        super({ now: float(0) });
    }
    _compile(metadata) {
        super._compile(metadata);
        this.type = 'float';
        super.inlineMaker = inline => inline.now;
    }
    _preDraw(...args) {
        this.now._preDraw(...args);
    }
    _setTimestamp(timestamp){
        this.now.expr = timestamp;
    }
    isAnimated() {
        return true;
    }
    eval(){
        return this.now.expr;
    }
}
