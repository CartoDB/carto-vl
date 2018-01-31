import Expression from './expression';
import { float } from '../functions';

// To support literals (string and numeric) out of the box we need to cast them implicitly on constructors
export function implicitCast(value) {
    if (Number.isFinite(value)) {
        return float(value);
    }
    // TODO we need to encapsulate strings as categories
    return value;
}

export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


export function genBinaryOp(jsFn, glsl) {
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
            if (typeof b === 'string' && a.type == 'category' && a.name) {
                let id = meta.columns.find(c => c.name == a.name).categoryNames.indexOf(b);
                this.auxFloat.expr = id;
                this.type = 'float';
                this.inlineMaker = inline => glsl(inline.a, inline.auxFloat);
            } else if (a.type == 'float' && b.type == 'float') {
                this.type = 'float';
            } else if (a.type == 'color' && b.type == 'color') {
                this.type = 'color';
            } else if (a.type == 'color' && b.type == 'float') {
                this.type = 'color';
            } else {
                throw new Error(`Binary operation cannot be performed between types '${a.type}' and '${b.type}'`);
            }
        }
    };
}


export function genUnaryOp(jsFn, glsl) {
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
    };
}