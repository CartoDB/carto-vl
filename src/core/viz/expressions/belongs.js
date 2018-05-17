import { implicitCast, checkType, checkLooseType, checkExpression } from './utils';
import BaseExpression from './base';

/**
 * Check if a value belongs to a list of elements.
 *
 * @param {string} value - Expression to be tested against the whitelist
 * @param {string[]} list - Multiple expression parameters that will form the whitelist
 * @return {Number} Numeric expression with the result of the check
 *
 * @example <caption>Display only cities where $type is 'metropolis' or 'capital'.</caption>
 * const e = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: e.in(e.prop('type'), ['metropolis', 'capital'])
 * });
 *
 * @example <caption>Display only cities where $type is 'metropolis' or 'capital'. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: in($type, ['metropolis', 'capital'])
 * `);
 *
 * @memberof carto.expressions
 * @name in
 * @function
 * @api
 */
export const In = generateBelongsExpression('in', IN_INLINE_MAKER, (value, list) => list.some(item => item == value) ? 1 : 0);

function IN_INLINE_MAKER(list) {
    if (list.length == 0) {
        return () => '0.';
    }
    return inline => `(${list.map((cat, index) => `(${inline.value} == ${inline[`arg${index}`]})`).join(' || ')})? 1.: 0.`;
}

/**
 * Check if value does not belong to the list of elements.
 *
 * @param {carto.expressions.Property} value - Expression to be tested against the blacklist
 * @param {String[]} list - Multiple expression parameters that will form the blacklist
 * @return {carto.expressions.Number} Numeric expression with the result of the check
 *
 * @example <caption>Display only cities where $type is not 'metropolis' or 'capital'.</caption>
 * const e = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: e.nin(e.prop('type'), ['metropolis', 'capital'])
 * });
 *
 * @example <caption>Display only cities where $type is not 'metropolis' or 'capital'. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: nin($type, ['metropolis', 'capital'])
 * `);
 *
 * @memberof carto.expressions
 * @name nin
 * @function
 * @api
 */
export const Nin = generateBelongsExpression('nin', NIN_INLINE_MAKER, (value, list) => list.some(item => item == value) ? 0 : 1);

function NIN_INLINE_MAKER(list) {
    if (list.length == 0) {
        return () => '1.';
    }
    return inline => `(${list.map((cat, index) => `(${inline.value} != ${inline[`arg${index}`]})`).join(' && ')})? 1.: 0.`;
}

function generateBelongsExpression(name, inlineMaker, jsEval) {
    return class BelongExpression extends BaseExpression {
        constructor(value, list) {
            value = implicitCast(value);
            list = implicitCast(list);

            checkExpression(name, 'value', 0, value);
            checkExpression(name, 'list', 1, list);

            checkLooseType(name, 'value', 0, 'string', value);
            checkType(name, 'list', 1, 'string-array', list);

            let children = { value };
            list.expr.map((arg, index) => children[`arg${index}`] = arg);
            super(children);
            this.list = list;
            this.inlineMaker = inlineMaker(this.list.expr);
            this.type = 'number';
        }
        eval(feature) {
            return jsEval(this.value.eval(feature), this.list.eval());
        }
        _compile(meta) {
            super._compile(meta);
            checkType(name, 'value', 0, 'string', this.value);
            checkType(name, 'list', 1, 'string-array', this.list);
        }
    };
}
