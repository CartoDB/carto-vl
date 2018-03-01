import { implicitCast } from './utils';
import Expression from './expression';


export const Log = genUnaryOp(x => Math.log(x), x => `log(${x})`);
export const Sqrt = genUnaryOp(x => Math.sqrt(x), x => `sqrt(${x})`);
export const Sin = genUnaryOp(x => Math.sin(x), x => `sin(${x})`);
export const Cos = genUnaryOp(x => Math.cos(x), x => `cos(${x})`);
export const Tan = genUnaryOp(x => Math.tan(x), x => `tan(${x})`);
export const Sign = genUnaryOp(x => Math.sign(x), x => `sign(${x})`);
export const Abs = genUnaryOp(x => Math.abs(x), x => `abs(${x})`);
export const Not = genUnaryOp(x => 1 - x, x => `1.0 - ${x}`);

function genUnaryOp(jsFn, glsl) {
    return class UnaryOperation extends Expression {
        constructor(a) {
            a = implicitCast(a);
            super({ a: a });
        }
        _compile(meta) {
            super._compile(meta);
            if (this.a.type != 'float') {
                throw new Error(`Binary operation cannot be performed to '${this.a.type}'`);
            }
            this.type = 'float';
            this.inlineMaker = inlines => glsl(inlines.a);
        }
        eval(feature) {
            return jsFn(this.a.eval(feature));
        }
    };
}
