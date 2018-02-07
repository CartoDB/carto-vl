import Expression from './expression';
import { float } from '../functions';

export default class Opacity extends Expression {
    /**
     * @api
     * @description Override the input color opacity
     * @param {*} color input color
     * @param {*} opacity new opacity
     */
    constructor(a, b) {
        if (Number.isFinite(b)) {
            b = float(b);
        }
        super({ a: a, b: b });
    }
    _compile(meta) {
        super._compile(meta);
        if (!(this.a.type == 'color' && this.b.type == 'float')) {
            throw new Error(`Opacity cannot be performed between '${this.a.type}' and '${this.b.type}'`);
        }
        this.type = 'color';
        this.inlineMaker = inlines => `vec4((${inlines.a}).rgb, ${inlines.b})`;
    }
}