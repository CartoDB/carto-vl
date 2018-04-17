import BaseExpression from './base';
import { number } from '../functions';

export default class Now extends BaseExpression {
    /**
     * @description get the current timestamp
     */
    constructor() {
        super({ now: number(0) });
    }
    _compile(metadata) {
        super._compile(metadata);
        this.type = 'number';
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
