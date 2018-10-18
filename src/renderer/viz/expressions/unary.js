import { implicitCast, checkType, checkMaxArguments } from './utils';
import BaseExpression from './base';
import { FP32_DESIGNATED_NULL_VALUE } from './constants';

/**
 * Compute the natural logarithm (base e) of a number x.
 *
 * @param {Number} x - Numeric expression to compute the natural logarithm
 * @return {Number}
 *
 * @example <caption>Natural Logarithm.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.log(10)  // 2.302585092994046
 * });
 *
 * @example <caption>Natural Logarithm. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: log(10)
 * `);
 *
 * @memberof carto.expressions
 * @name log
 * @function
 * @api
 */
export const Log = genUnaryOp('log', x => Math.log(x), x => `log(${x})`);

/**
 * Compute the square root of a number x.
 *
 * @param {Number} x - Numeric expression to compute the square root
 * @return {Number}
 *
 * @example <caption>Square root.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.sqrt(4)  // 2
 * });
 *
 * @example <caption>Square root. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: sqrt(4)
 * `);
 *
 * @memberof carto.expressions
 * @name sqrt
 * @function
 * @api
 */
export const Sqrt = genUnaryOp('sqrt', x => Math.sqrt(x), x => `sqrt(${x})`);

/**
 * Compute the sine of a number x.
 *
 * @param {Number} x - Numeric expression to compute the sine in radians
 * @return {Number}
 *
 * @example <caption>Sin.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.sin(Math.PI/2)  // 1
 * });
 *
 * @example <caption>Sin. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: sin(PI/2)
 * `);
 *
 * @memberof carto.expressions
 * @name sin
 * @function
 * @api
 */
export const Sin = genUnaryOp('sin', x => Math.sin(x), x => `sin(${x})`);

/**
 * Compute the cosine of a number x.
 *
 * @param {Number} x - Numeric expression to compute the cosine in radians
 * @return {Number}
 *
 * @example <caption>Cos.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.cos(0)  // 1
 * });
 *
 * @example <caption>Cos. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: cos(0)
 * `);
 *
 * @memberof carto.expressions
 * @name cos
 * @function
 * @api
 */
export const Cos = genUnaryOp('cos', x => Math.cos(x), x => `cos(${x})`);

/**
 * Compute the tangent of a number x.
 *
 * @param {Number} x - Numeric expression to compute the tangent in radians
 * @return {Number}
 *
 * @example <caption>Tan.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.tan(0)  // 0
 * });
 *
 * @example <caption>Tan. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: tan(0)
 * `);
 *
 * @memberof carto.expressions
 * @name tan
 * @function
 * @api
 */
export const Tan = genUnaryOp('tan', x => Math.tan(x), x => `tan(${x})`);

/**
 * Compute the sign of a number x, indicating whether the number is positive, negative or zero
 * This means this function will return 1 if the number is positive, -1 if the number is negative
 * 0 if the number is 0 and -0 if the number is -0.
 *
 * @param {Number} x - Numeric expression to compute the sign
 * @return {Number}
 *
 * @example <caption>Sign.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.sign(100)  // 1
 * });
 *
 * @example <caption>Sign. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: sign(100)
 * `);
 *
 * @memberof carto.expressions
 * @name sign
 * @function
 * @api
 */
export const Sign = genUnaryOp('sign', x => Math.sign(x), x => `sign(${x})`);

/**
 * Compute the absolute value of a number x.
 *
 * @param {Number} x - Numeric expression to compute the absolute value
 * @return {Number}
 *
 * @example <caption>Abs.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.abs(-100)  // 100
 * });
 *
 * @example <caption>Abs. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: abs(-100) // 100
 * `);
 *
 * @memberof carto.expressions
 * @name abs
 * @function
 * @api
 */
export const Abs = genUnaryOp('abs', x => Math.abs(x), x => `abs(${x})`);

/**
 * Check if a numerical or categorical property is missing (NULL value).
 *
 * This returns a numeric expression where 0 means `false` and 1 means `true`.
 *
 * @example <caption>Filter NULL values of the `numeric` property.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.not(s.isNull(s.prop('numeric')))
 * });
 *
 * @example <caption>Filter NULL values of the `numeric` property. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: not(isNull($numeric))
 * `);
 *
 * @param {Number} x - Numeric expression to check
 * @return {Number}
 *
 * @memberof carto.expressions
 * @name isNull
 * @function
 * @api
 */
export const IsNull = genUnaryOp('isNull',
    x => x === null ? 1 : 0,
    x => `((${x} == ${FP32_DESIGNATED_NULL_VALUE.toFixed(20)}) ? 1. : 0.)`,
    ['number', 'category']// TODO force property
);

/**
 * Compute the logical negation of the given expression.
 * This is internally computed as 1 - x preserving boolean behavior and allowing fuzzy logic.
 *
 *  - When x is equal to 1 not(x) will be evaluated to 0
 *  - When x is equal to 0 not(x) will be evaluated to 1
 *
 * @param {Number} x - Number to compute the not value
 * @return {Number}
 *
 * @example <caption>Not.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.not(0)  // 1
 * });
 *
 * @example <caption>Not. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: not(0)
 * `);
 *
 * @memberof carto.expressions
 * @name not
 * @function
 * @api
 */
export const Not = genUnaryOp('not', x => 1 - x, x => `(1.0 - ${x})`);

/**
 * Compute the floor of the given expression.
 * Find the nearest integer less than or equal to the expression value.
 *
 *  - When x is equal to 0.8 floor(x) will be evaluated to 0
 *  - When x is equal to 1.3 floor(x) will be evaluated to 1
 *
 * @param {Number} x - Number to compute the floor value
 * @return {Number}
 *
 * @example <caption>Floor.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.floor(5.9)  // 5
 * });
 *
 * @example <caption>Floor. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: floor(5.9)
 * `);
 *
 * @memberof carto.expressions
 * @name floor
 * @function
 * @api
 */
export const Floor = genUnaryOp('floor', x => Math.floor(x), x => `floor(${x})`);

/**
 * Compute the ceil of the given expression.
 * Find the nearest integer that is greater than or equal to the expression value.
 *
 *  - When x is equal to 0.8 ceil(x) will be evaluated to 1
 *  - When x is equal to 1.3 ceil(x) will be evaluated to 2
 *
 * @param {Number} x - Number to compute the ceil value
 * @return {Number}
 *
 * @example <caption>Ceil.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.ceil(5.1);  // 6
 * });
 *
 * @example <caption>Ceil. (String)</caption>
 * const viz = new carto.Viz(`
 *   width: ceil(5.1)
 * `);
 *
 * @memberof carto.expressions
 * @name ceil
 * @function
 * @api
 */
export const Ceil = genUnaryOp('ceil', x => Math.ceil(x), x => `ceil(${x})`);

function genUnaryOp (name, jsFn, glsl, validTypes = 'number') {
    return class UnaryOperation extends BaseExpression {
        constructor (a) {
            checkMaxArguments(arguments, 1, name);

            a = implicitCast(a);
            super({
                a
            });
            this.type = 'number';
            this.expressionName = name;
            this.inlineMaker = inlines => glsl(inlines.a);
        }
        get value () {
            return this.eval();
        }
        eval (feature) {
            return jsFn(this.a.eval(feature));
        }
        _bindMetadata (meta) {
            super._bindMetadata(meta);
            checkType(name, 'x', 0, validTypes, this.a);
        }
    };
}
