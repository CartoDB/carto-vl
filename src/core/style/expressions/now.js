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
        this.now.expr = (Date.now() - nowInit) / 1000.;
        this.now._preDraw(...args);
    }
    isAnimated() {
        return true;
    }
}
