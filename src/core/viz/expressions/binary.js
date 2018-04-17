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
 * Multiply two numeric expressions.
 *
 * @param {carto.expressions.Base|number} x - Numeric expression
 * @param {carto.expressions.Base|number} y - Numeric expression
 * @return {carto.expressions.Base} Mumeric expression
 *
 * @example <caption>Simple multiplication.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.mul(5, 5);  // Upon rendering, width will be evaluated internally to 25
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name mul
 * @api
 */
export const FloatMul = genBinaryOp('mul',
    FLOATS_TO_FLOAT | FLOAT_AND_COLOR_TO_COLOR | COLORS_TO_COLOR,
    (x, y) => x * y,
    (x, y) => `(${x} * ${y})`
);

/**
 * Divide two numeric expressions.
 *
 * @param {carto.expressions.Base|number} numerator - Numerator of the division
 * @param {carto.expressions.Base|number} denominator - Denominator of the division
 * @return {carto.expressions.Base} Numeric expression
 *
 * @example <caption>Number division.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.div(10, 2);   // Upon rendering, width will be evaluated internally to 5
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name div
 * @api
 */
export const FloatDiv = genBinaryOp('div',
    FLOATS_TO_FLOAT | FLOAT_AND_COLOR_TO_COLOR | COLORS_TO_COLOR,
    (x, y) => x / y,
    (x, y) => `(${x} / ${y})`
);

/**
 * Add two numeric expressions.
 *
 * @param {carto.expressions.Base|number} x - Numeric expression
 * @param {carto.expressions.Base|number} y - Numeric expression
 * @return {carto.expressions.Base} Numeric expression
 *
 * @example <caption>Number addition.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.add(10, 2);  // Upon rendering, width will be evaluated internally to 12
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name add
 * @api
 */
export const FloatAdd = genBinaryOp('add',
    FLOATS_TO_FLOAT | COLORS_TO_COLOR,
    (x, y) => x + y,
    (x, y) => `(${x} + ${y})`
);

/**
 * Substract two numeric expressions.
 *
 * @param {carto.expressions.Base|number} minuend - The minuend of the subtraction
 * @param {carto.expressions.Base|number} subtrahend - The subtrahend of the subtraction
 * @return {carto.expressions.Base} Numeric expression
 *
 * @example <caption>Number subtraction.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.sub(10, 2);  // Upon rendering, width will be evaluated internally to 8
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name sub
 * @api
 */
export const FloatSub = genBinaryOp('sub',
    FLOATS_TO_FLOAT | COLORS_TO_COLOR,
    (x, y) => x - y,
    (x, y) => `(${x} - ${y})`
);

/**
 * Modulus of two numeric expressions, mod returns a numeric expression with the value of x modulo y. This is computed as x - y * floor(x/y).
 *
 * @param {carto.expressions.Base|number} x - Numeric expression
 * @param {carto.expressions.Base|number} y - Numeric expression
 * @return {carto.expressions.Base} Numeric expression
 *
 * @example <caption>Number modulus.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.mod(10, 6);  // 4
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name mod
 * @api
 */
export const FloatMod = genBinaryOp('mod',
    FLOATS_TO_FLOAT,
    (x, y) => x % y,
    (x, y) => `mod(${x}, ${y})`
);

/**
 * Compute the base to the exponent power, return a numeric expression with the value of the first parameter raised to the power of the second.
 * The result is undefined if x<0 or if x=0 and y≤0.
 *
 * @param {carto.expressions.Base|number} base - Numeric expression
 * @param {carto.expressions.Base|number} exponent - Numeric expression
 * @return {carto.expressions.Base} Numeric expression with base ^ exponent
 *
 * @example <caption>Power of two numbers.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.pow(2, 3);  // 8
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name pow
 * @api
 */
export const FloatPow = genBinaryOp('pow',
    FLOATS_TO_FLOAT,
    (x, y) => Math.pow(x, y),
    (x, y) => `pow(${x}, ${y})`
);

/**
 * Compare if x is greater than y.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Base|number} x - Numeric expression
 * @param {carto.expressions.Base|number} y - Numeric expression
 * @return {carto.expressions.Base} Numeric expression
 *
 * @example <caption>Compare two numbers to show only elements with price > 30</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.gt(s.prop('price'), 30);
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name gt
 * @api
 */
export const GreaterThan = genBinaryOp('greaterThan',
    FLOATS_TO_FLOAT,
    (x, y) => x > y ? 1 : 0,
    (x, y) => `(${x}>${y}? 1.:0.)`
);

/**
 * Compare if x is greater than or equal to y.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Base|number} x - Numeric expression
 * @param {carto.expressions.Base|number} y - Numeric expression
 * @return {carto.expressions.Base} Numeric expression
 *
 * @example <caption>Compare two numbers to show only elements with price >= 30</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.gte(s.prop('price'), 30);
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name gte
 * @api
 */
export const GreaterThanOrEqualTo = genBinaryOp('greaterThanOrEqualTo',
    FLOATS_TO_FLOAT,
    (x, y) => x >= y ? 1 : 0,
    (x, y) => `(${x}>=${y}? 1.:0.)`
);

/**
 * Compare if x is lower than y.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Base|number} x - Numeric expression
 * @param {carto.expressions.Base|number} y - Numeric expression
 * @return {carto.expressions.Base} Numeric expression
 *
 * @example <caption>Compare two numbers to show only elements with price < 30</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.lt(s.prop('price'), 30);
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name lt
 * @api
 */
export const LessThan = genBinaryOp('lessThan',
    FLOATS_TO_FLOAT,
    (x, y) => x < y ? 1 : 0,
    (x, y) => `(${x}<${y}? 1.:0.)`
);

/**
 * Compare if x is lower than or equal to y.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Base|number} x - Numeric expression
 * @param {carto.expressions.Base|number} y - Numeric expression
 * @return {carto.expressions.Base} Numeric expression
 *
 * @example <caption>Compare two numbers to show only elements with price <= 30</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.lte(s.prop('price'), 30);
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name lte
 * @api
 */
export const LessThanOrEqualTo = genBinaryOp('lessThanOrEqualTo',
    FLOATS_TO_FLOAT,
    (x, y) => x <= y ? 1 : 0,
    (x, y) => `(${x}<=${y}? 1.:0.)`
);

/**
 * Compare if x is equal to a y.
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Base|number} x - Numeric expression
 * @param {carto.expressions.Base|number} y - Numeric expression
 * @return {carto.expressions.Base} Numeric expression
 *
 * @example <caption>Compare two numbers to show only elements with price === 30</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.eq(s.prop('price'), 30);
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name eq
 * @api
 */
export const Equals = genBinaryOp('equals',
    FLOATS_TO_FLOAT | CATEGORIES_TO_FLOAT,
    (x, y) => x == y ? 1 : 0,
    (x, y) => `(${x}==${y}? 1.:0.)`
);

/**
 * Compare if x is different than y.
 *
 * This returns a number expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Base|number} x - Numeric expression
 * @param {carto.expressions.Base|number} y - Numeric expression
 * @return {carto.expressions.Base} Numeric expression
 *
 * @example <caption>Compare two numbers to show only elements with price !== 30</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.neq(s.prop('price'), 30);
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name neq
 * @api
 */
export const NotEquals = genBinaryOp('notEquals',
    FLOATS_TO_FLOAT | CATEGORIES_TO_FLOAT,
    (x, y) => x != y ? 1 : 0,
    (x, y) => `(${x}!=${y}? 1.:0.)`
);

/**
 * Perform a binary OR between two numeric expressions.
 * If the numbers are different from 0 or 1 this performs a [fuzzy or operation](https://en.wikipedia.org/wiki/Fuzzy_logic#Fuzzification).
 * This fuzzy behavior will allow transitions to work in a continuos, non-discrete, fashion.
 *
 * This returns a number expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Base|number} x - Numeric expression
 * @param {carto.expressions.Base|number} y - Numeric expression
 * @return {carto.expressions.Base} Numeric expression
 *
 * @example <caption>Show only elements with price < 30 or price > 1000</caption>
 * const s = carto.expressions;
 * const $price = s.prop('price');
 * const viz = new carto.Viz({
 *   filter: s.or(
 *     s.lt($price, 30),
 *     s.gt($price, 1000)
 *   )
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name or
 * @api
 */
export const Or = genBinaryOp('or',
    FLOATS_TO_FLOAT,
    (x, y) => Math.min(x + y, 1),
    (x, y) => `min(${x} + ${y}, 1.)`
);

/**
 * Perform a binary AND between two numeric expressions.
 * If the numbers are different from 0 or 1 this performs a [fuzzy or operation](https://en.wikipedia.org/wiki/Fuzzy_logic#Fuzzification).
 * This fuzzy behavior will allow transitions to work in a continuos, non-discrete, fashion.
 *
 * This returns a number expression where 0 means `false` and 1 means `true`.
 *
 * @param {carto.expressions.Base|number} x - Numeric expression
 * @param {carto.expressions.Base|number} y - Numeric expression
 * @return {carto.expressions.Base} Numeric expression
 *
 * @example <caption>Show only elements with price < 30 AND category === 'fruit'</caption>
 * const s = carto.expressions;
 * const $price = s.prop('price');
 * const $category = s.prop('category');
 *
 * const viz = new carto.Viz({
 *   filter: s.and(
 *     s.lt($price, 30),
 *     s.eq($category, 'fruit')
 *   )
 * });
 *
 * @memberof carto.expressions
 * @function
 * @name and
 * @api
 */
export const And = genBinaryOp('and',
    FLOATS_TO_FLOAT,
    (x, y) => Math.min(x * y, 1),
    (x, y) => `min(${x} * ${y}, 1.)`
);

function genBinaryOp(name, allowedSignature, jsFn, glsl) {
    return class BinaryOperation extends BaseExpression {
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
        eval(feature) {
            return jsFn(this.a.eval(feature), this.b.eval(feature));
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
