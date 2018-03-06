import Expression from './expression';
import { float } from '../functions';

const nowInit = Date.now();

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
        this._setTimestamp();
        this.now._preDraw(...args);
    }
    _setTimestamp(){
        this.now.expr = (Date.now() - nowInit) / 1000.;
    }
    isAnimated() {
        return true;
    }
    eval(){
        this._setTimestamp();
        return this.now.expr;
    }
}
