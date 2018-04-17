import { float } from '../functions';
import { implicitCast } from './utils';
import BaseExpression from './base';

// Each binary expression can have a set of the following signatures (OR'ed flags)
const UNSUPPORTED_SIGNATURE = 0;
const FLOATS_TO_FLOAT = 1;
const FLOAT_AND_COLOR_TO_COLOR = 2;
const COLORS_TO_COLOR = 4;
const CATEGORIES_TO_FLOAT = 8;

/**
 *
 * Multiply two numeric expressions.
 *
 * @param {carto.expressions.Expression | number} x numeric expression
 * @param {carto.expressions.Expression | number} y numeric expression
 * @return {carto.expressions.Expression} numeric expression
 *
 * @example <caption>Simple multiplication.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  width: s.mul(5, 5);  // Upon rendering, width will be evaluated internally to 25
 * });
 *
 * @memberof carto.expressions
 * @name mul
 * @function
 * @api
 */
export const FloatMul = genBinaryOp('mul',
    FLOATS_TO_FLOAT | FLOAT_AND_COLOR_TO_COLOR | COLORS_TO_COLOR,
    (x, y) => x * y,
    (x, y) => `(${x} * ${y})`
);

/**
 *
 * Divide two numeric expressions.
 *
 * @param {carto.expressions.Expression | number} numerator - Numerator of the division
 * @param {carto.expressions.Expression | number} denominator - Denominator of the division
 * @return {carto.expressions.Expression} numeric expression
 *
 * @example <caption>Number division.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  width: s.div(10, 2);   // Upon rendering, width will be evaluated internally to 5
 * });
 *
 * @memberof carto.expressions
 * @name div
 * @function
 * @api
 */
export const FloatDiv = genBinaryOp('div',
    FLOATS_TO_FLOAT | FLOAT_AND_COLOR_TO_COLOR | COLORS_TO_COLOR,
    (x, y) => x / y,
    (x, y) => `(${x} / ${y})`
);

/**
 *
 * Add two numeric expressions.
 *
 * @param {carto.expressions.Expression | number} x numeric expression
 * @param {carto.expressions.Expression | number} y numeric expression
 * @return {carto.expressions.Expression} numeric expression
 *
 * @example <caption>Number addition.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  width: s.add(10, 2);  // Upon rendering, width will be evaluated internally to 12
 * });
 *
 * @memberof carto.expressions
 * @name add
 * @function
 * @api
 */
export const FloatAdd = genBinaryOp('add',
    FLOATS_TO_FLOAT | COLORS_TO_COLOR,
    (x, y) => x + y,
    (x, y) => `(${x} + ${y})`
);

/**
 *
 * Substract two numeric expressions.
 *
 * @param {carto.expressions.Expression | number} minuend - The minuend of the subtraction
 * @param {carto.expressions.Expression | number} subtrahend - The subtrahend of the subtraction
 * @return {carto.expressions.Expression} numeric expression
 *
 * @example <caption>Number subtraction.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  width: s.sub(10, 2);  // Upon rendering, width will be evaluated internally to 8
 * });
 *
 * @memberof carto.expressions
 * @name sub
 * @function
 * @api
 */
export const FloatSub = genBinaryOp('sub',
    FLOATS_TO_FLOAT | COLORS_TO_COLOR,
    (x, y) => x - y,
    (x, y) => `(${x} - ${y})`
);

/**
 *
 * Modulus of two numeric expressions, mod returns a numeric expression with the value of x modulo y. This is computed as x - y * floor(x/y).
 *
 * @param {carto.expressions.Expression | number} x numeric expression
 * @param {carto.expressions.Expression | number} y numeric expression
 * @return {carto.expressions.Expression} numeric expression
 *
 * @example <caption>Number modulus.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  width: s.mod(10, 6);  // 4
 * });
 *
 * @memberof carto.expressions
 * @name mod
 * @function
 * @api
 */
export const FloatMod = genBinaryOp('mod',
    FLOATS_TO_FLOAT,
    (x, y) => x % y,
    (x, y) => `mod(${x}, ${y})`
);

/**
 *
 * Compute the base to the exponent power, return a numeric expression with the value of the first parameter raised to the power of the second.
 * The result is undefined if x<0 or if x=0 and y≤0.
 *
 * @param {carto.expressions.Expression | number} base numeric expression
 * @param {carto.expressions.Expression | number} exponent numeric expression
 * @return {carto.expressions.Expression} numeric expression with base ^ exponent
 *
 * @example <caption>Power of two numbers.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  width: s.pow(2, 3);  // 8
 * });
 *
 * @memberof carto.expressions
 * @name pow
 * @function
 * @api
 */
export const FloatPow = genBinaryOp('pow',
    FLOATS_TO_FLOAT,
    (x, y) => Math.pow(x, y),
    (x, y) => `pow(${x}, ${y})`
);

/**
 *
 * Compare if x is greater than y.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Expression | number} x numeric expression
 * @param {carto.expressions.Expression | number} y numeric expression
 * @return {carto.expressions.Expression} numeric expression
 *
 * @example <caption>Compare two numbers to show only elements with price > 30</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  filter: s.gt(s.property('price'), 30);
 * });
 *
 * @memberof carto.expressions
 * @name gt
 * @function
 * @api
 */
export const GreaterThan = genBinaryOp('greaterThan',
    FLOATS_TO_FLOAT,
    (x, y) => x > y ? 1 : 0,
    (x, y) => `(${x}>${y}? 1.:0.)`
);

/**
 *
 * Compare if x is greater than or equal to y.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Expression | number} x numeric expression
 * @param {carto.expressions.Expression | number} y numeric expression
 * @return {carto.expressions.Expression} numeric expression
 *
 * @example <caption>Compare two numbers to show only elements with price >= 30</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  filter: s.gte(s.property('price'), 30);
 * });
 *
 * @memberof carto.expressions
 * @name gte
 * @function
 * @api
 */
export const GreaterThanOrEqualTo = genBinaryOp('greaterThanOrEqualTo',
    FLOATS_TO_FLOAT,
    (x, y) => x >= y ? 1 : 0,
    (x, y) => `(${x}>=${y}? 1.:0.)`
);

/**
 *
 * Compare if x is lower than y.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Expression | number} x numeric expression
 * @param {carto.expressions.Expression | number} y numeric expression
 * @return {carto.expressions.Expression} numeric expression
 *
 * @example <caption>Compare two numbers to show only elements with price < 30</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  filter: s.lt(s.property('price'), 30);
 * });
 *
 * @memberof carto.expressions
 * @name lt
 * @function
 * @api
 */
export const LessThan = genBinaryOp('lessThan',
    FLOATS_TO_FLOAT,
    (x, y) => x < y ? 1 : 0,
    (x, y) => `(${x}<${y}? 1.:0.)`
);

/**
 *
 * Compare if x is lower than or equal to y.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Expression | number} x numeric expression
 * @param {carto.expressions.Expression | number} y numeric expression
 * @return {carto.expressions.Expression} numeric expression
 *
 * @example <caption>Compare two numbers to show only elements with price <= 30</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  filter: s.lte(s.property('price'), 30);
 * });
 *
 * @memberof carto.expressions
 * @name lte
 * @function
 * @api
 */
export const LessThanOrEqualTo = genBinaryOp('lessThanOrEqualTo',
    FLOATS_TO_FLOAT,
    (x, y) => x <= y ? 1 : 0,
    (x, y) => `(${x}<=${y}? 1.:0.)`
);

/**
 *
 * Compare if x is equal to a y.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Expression | number} x numeric expression
 * @param {carto.expressions.Expression | number} y numeric expression
 * @return {carto.expressions.Expression} numeric expression
 *
 * @example <caption>Compare two numbers to show only elements with price === 30</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  filter: s.eq(s.property('price'), 30);
 * });
 *
 * @memberof carto.expressions
 * @name eq
 * @function
 * @api
 */
export const Equals = genBinaryOp('equals',
    FLOATS_TO_FLOAT | CATEGORIES_TO_FLOAT,
    (x, y) => x == y ? 1 : 0,
    (x, y) => `(${x}==${y}? 1.:0.)`
);

/**
 *
 * Compare if x is different than y.
 *
 * This returns a number expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Expression | number} x numeric expression
 * @param {carto.expressions.Expression | number} y numeric expression
 * @return {carto.expressions.Expression} numeric expression
 *
 * @example <caption>Compare two numbers to show only elements with price !== 30</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *  filter: s.neq(s.property('price'), 30);
 * });
 *
 * @memberof carto.expressions
 * @name neq
 * @function
 * @api
 */
export const NotEquals = genBinaryOp('notEquals',
    FLOATS_TO_FLOAT | CATEGORIES_TO_FLOAT,
    (x, y) => x != y ? 1 : 0,
    (x, y) => `(${x}!=${y}? 1.:0.)`
);


/**
 *
 * Perform a binary OR between two numeric expressions.
 * If the numbers are different from 0 or 1 this performs a [fuzzy or operation](https://en.wikipedia.org/wiki/Fuzzy_logic#Fuzzification).
 * This fuzzy behavior will allow transitions to work in a continuos, non-discrete, fashion.
 *
 * This returns a number expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Expression | number} x numeric expression
 * @param {carto.expressions.Expression | number} y numeric expression
 * @return {carto.expressions.Expression} numeric expression
 *
 * @example <caption>Show only elements with price < 30 or price > 1000</caption>
 * const s = carto.expressions;
 * const $price = s.property('price');
 * const viz = new carto.Viz({
 *  filter: s.or(
 *      s.lt($price, 30)
 *      s.gt($price, 1000)
 * });
 *
 * @memberof carto.expressions
 * @name or
 * @function
 * @api
 */
export const Or = genBinaryOp('or',
    FLOATS_TO_FLOAT,
    (x, y) => Math.min(x + y, 1),
    (x, y) => `min(${x} + ${y}, 1.)`
);

/**
 *
 * Perform a binary AND between two numeric expressions.
 * If the numbers are different from 0 or 1 this performs a [fuzzy or operation](https://en.wikipedia.org/wiki/Fuzzy_logic#Fuzzification).
 * This fuzzy behavior will allow transitions to work in a continuos, non-discrete, fashion.
 *
 * This returns a number expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Expression | number} x numeric expression
 * @param {carto.expressions.Expression | number} y numeric expression
 * @return {carto.expressions.Expression} numeric expression
 *
 * @example <caption>Show only elements with price < 30 AND category === 'fruit'</caption>
 * const s = carto.expressions;
 * const $price = s.property('price');
 * const $category = s.property('category');
 *
 * const viz = new carto.Viz({
 *  filter: s.and(
 *      s.lt($price, 30)
 *      s.eq($category, 'fruit')
 * });
 *
 * @memberof carto.expressions
 * @name and
 * @function
 * @api
 */
export const And = genBinaryOp('and',
    FLOATS_TO_FLOAT,
    (x, y) => Math.min(x * y, 1),
    (x, y) => `min(${x} * ${y}, 1.)`
);

function genBinaryOp(name, allowedSignature, jsFn, glsl) {
    return class BinaryOperation extends BaseExpression {
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

            const signature = getSignature(a, b);
            if (signature !== undefined) {
                if (signature == UNSUPPORTED_SIGNATURE || !(signature & allowedSignature)) {
                    throw new Error(`${name}(): invalid parameter types\n'x' type was ${a.type}, 'y' type was ${b.type}`);
                }
            }

            super({ a: a, b: b });
            this.type = getReturnTypeFromSignature(signature);
        }
        _compile(meta) {
            super._compile(meta);
            const [a, b] = [this.a, this.b];

            const signature = getSignature(a, b);
            if (signature == UNSUPPORTED_SIGNATURE || !(signature & allowedSignature)) {
                throw new Error(`${name}(): invalid parameter types\n'x' type was ${a.type}, 'y' type was ${b.type}`);
            }
            this.type = getReturnTypeFromSignature(signature);

            this.inlineMaker = inline => glsl(inline.a, inline.b);
        }
        eval(feature) {
            return jsFn(this.a.eval(feature), this.b.eval(feature));
        }
    };
}

function getSignature(a, b) {
    if (!a.type || !b.type) {
        return undefined;
    } else if (a.type == 'float' && b.type == 'float') {
        return FLOATS_TO_FLOAT;
    } else if (a.type == 'float' && b.type == 'color') {
        return FLOAT_AND_COLOR_TO_COLOR;
    } else if (a.type == 'color' && b.type == 'float') {
        return FLOAT_AND_COLOR_TO_COLOR;
    } else if (a.type == 'color' && b.type == 'color') {
        return COLORS_TO_COLOR;
    } else if (a.type == 'category' && b.type == 'category') {
        return CATEGORIES_TO_FLOAT;
    } else {
        return UNSUPPORTED_SIGNATURE;
    }
}

function getReturnTypeFromSignature(signature) {
    switch (signature) {
        case FLOATS_TO_FLOAT:
            return 'float';
        case FLOAT_AND_COLOR_TO_COLOR:
            return 'color';
        case COLORS_TO_COLOR:
            return 'color';
        case CATEGORIES_TO_FLOAT:
            return 'float';
        default:
            return undefined;
    }
}
