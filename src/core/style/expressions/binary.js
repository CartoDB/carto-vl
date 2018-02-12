import { float } from '../functions';
import { implicitCast } from './utils';
import Expression from './expression';

// Binary ops
export const FloatMul = genBinaryOp((x, y) => x * y, (x, y) => `(${x} * ${y})`);
export const FloatDiv = genBinaryOp((x, y) => x / y, (x, y) => `(${x} / ${y})`);
export const FloatAdd = genBinaryOp((x, y) => x + y, (x, y) => `(${x} + ${y})`);
export const FloatSub = genBinaryOp((x, y) => x - y, (x, y) => `(${x} - ${y})`);
export const FloatMod = genBinaryOp((x, y) => x % y, (x, y) => `mod(${x}, ${y})`);
export const FloatPow = genBinaryOp((x, y) => Math.pow(x, y), (x, y) => `pow(${x}, ${y})`);

export const GreaterThan = genBinaryOp((x, y) => x > y ? 1 : 0, (x, y) => `(${x}>${y}? 1.:0.)`);
export const GreaterThanOrEqualTo = genBinaryOp((x, y) => x >= y ? 1 : 0, (x, y) => `(${x}>=${y}? 1.:0.)`);

export const LessThan = genBinaryOp((x, y) => x < y ? 1 : 0, (x, y) => `(${x}<${y}? 1.:0.)`);
export const LessThanOrEqualTo = genBinaryOp((x, y) => x <= y ? 1 : 0, (x, y) => `(${x}<=${y}? 1.:0.)`);

export const Equals = genBinaryOp((x, y) => x == y ? 1 : 0, (x, y) => `(${x}==${y}? 1.:0.)`);
export const NotEquals = genBinaryOp((x, y) => x != y ? 1 : 0, (x, y) => `(${x}!=${y}? 1.:0.)`);

function genBinaryOp(jsFn, glsl) {
    return class BinaryOperation extends Expression {
        /**
         * @jsapi
         * @name BinaryOperation
         * @hideconstructor
         * @augments Expression
         * @constructor
         * @param {*} a
         * @param {*} b
         */
        constructor(a, b) {
            if (Number.isFinite(a) && Number.isFinite(b)) {
                return float(jsFn(a, b));
            }
            a = implicitCast(a);
            b = implicitCast(b);
            if (typeof a === 'string') {
                [a, b] = [b, a];
            }
            if (typeof b === 'string') {
                super({ a: a, auxFloat: float(0) });
                this.b = b;
            } else {
                super({ a: a, b: b });
            }

        }
        _compile(meta) {
            super._compile(meta);
            const [a, b] = [this.a, this.b];
            this.inlineMaker = inline => glsl(inline.a, inline.b);
            // TODO this logic is operation dependant
            if (typeof b === 'string' && a.type == 'category' && a.name) {
                const id = meta.categoryIDs[b];
                this.auxFloat.expr = id;
                this.type = 'float';
                this.inlineMaker = inline => glsl(inline.a, inline.auxFloat);
            } else if (a.type == 'float' && b.type == 'float') {
                this.type = 'float';
            } else if (a.type == 'color' && b.type == 'color') {
                this.type = 'color';
            } else if (a.type == 'color' && b.type == 'float') {
                this.type = 'color';
            } else if (a.type == 'category' && b.type == 'category') {
                this.type = 'float';
            } else {
                throw new Error(`Binary operation cannot be performed between types '${a.type}' and '${b.type}'`);
            }
        }
    };
}