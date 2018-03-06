import { implicitCast } from './utils';
import Expression from './expression';


/**
 * 
 * Compute the natural logarithm (base e) of a number x
 * 
 * @param {carto.style.expressions.float|number} x - Number to compute the natural logarithm
 * @return {carto.style.expressions.float}
 * 
 * @example <caption>Natural Logarithm.</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *  width: s.log(10);  // 2.302585092994046
 * });
 * 
 * @memberof carto.style.expressions
 * @name log
 * @function
 * @api
 */
export const Log = genUnaryOp(x => Math.log(x), x => `log(${x})`);

/**
 * 
 * Compute the square root of a number x
 * 
 * @param {carto.style.expressions.float|number} x - Number to compute the square root
 * @return {carto.style.expressions.float}
 * 
 * @example <caption>Square root.</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *  width: s.sqrt(4);  // 2
 * });
 * 
 * @memberof carto.style.expressions
 * @name sqrt
 * @function
 * @api
 */
export const Sqrt = genUnaryOp(x => Math.sqrt(x), x => `sqrt(${x})`);

/**
 * 
 * Compute the sine of a number x
 * 
 * @param {carto.style.expressions.float|number} x - Number to compute the sine in radians
 * @return {carto.style.expressions.float}
 * 
 * @example <caption>Sin</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *  width: s.sin(Math.PI/2);  // 1
 * });
 * 
 * @memberof carto.style.expressions
 * @name sin
 * @function
 * @api
 */
export const Sin = genUnaryOp(x => Math.sin(x), x => `sin(${x})`);

/**
 * 
 * Compute the cosine of a number x
 * 
 * @param {carto.style.expressions.float|number} x - Number to compute the cosine in radians
 * @return {carto.style.expressions.float}
 * 
 * @example <caption>Cos</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *  width: s.cos(0);  // 1
 * });
 * 
 * @memberof carto.style.expressions
 * @name cos
 * @function
 * @api
 */
export const Cos = genUnaryOp(x => Math.cos(x), x => `cos(${x})`);

/**
 * 
 * Compute the tangent of a number x
 * 
 * @param {carto.style.expressions.float|number} x - Number to compute the tangent in radians
 * @return {carto.style.expressions.float}
 * 
 * @example <caption>Tan</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *  width: s.tan(0);  // 0
 * });
 * 
 * @memberof carto.style.expressions
 * @name tan
 * @function
 * @api
 */
export const Tan = genUnaryOp(x => Math.tan(x), x => `tan(${x})`);

/**
 * 
 * Compute the sign of a number x, indicating whether the number is positive, negative or zero
 * This means this function will return 1 if the number is positive, -1 if the number is negative 0 if the number is 0 and
 * -0 if the number is -0.
 * 
 * @param {carto.style.expressions.float|number} x - Number to compute the sign
 * @return {carto.style.expressions.float}
 * 
 * @example <caption>Sign</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *  width: s.sign(100);  // 1
 * });
 * 
 * @memberof carto.style.expressions
 * @name sign
 * @function
 * @api
 */
export const Sign = genUnaryOp(x => Math.sign(x), x => `sign(${x})`);

/**
 * 
 * Compute the absolute value of a number x.
 * 
 * @param {carto.style.expressions.float|number} x - Number to compute the absolute value
 * @return {carto.style.expressions.float}
 * 
 * @example <caption>Abs</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *  width: s.abs(100);  // 1
 * });
 * 
 * @memberof carto.style.expressions
 * @name abs
 * @function
 * @api
 */
export const Abs = genUnaryOp(x => Math.abs(x), x => `abs(${x})`);

/**
 * 
 * Compute the logical negatioin of the given expression.
 * This is internally computed as 1 - x preserving boolean behaviour and allowing fuzzy logic.
 * 
 *  - When x is equal to 1 not(x) will be evaluated to 0
 *  - When x is equal to 0 not(x) will be evaluated to 1
 * 
 * @param {carto.style.expressions.float|number} x - Number to compute the absolute value
 * @return {carto.style.expressions.float}
 * 
 * @example <caption>Not</caption>
 * const s = carto.style.expressions;
 * const style = new carto.Style({
 *  width: s.not(0);  // 1
 * });
 * 
 * @memberof carto.style.expressions
 * @name not
 * @function
 * @api
 */
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
    };
}
