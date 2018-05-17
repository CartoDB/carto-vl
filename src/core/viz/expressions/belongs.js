import { implicitCast, checkType, checkLooseType, checkExpression } from './utils';
import BaseExpression from './base';

/**
 * Check if a categorical value belongs to a list of categories.
 *
 * @param {BaseString|string} value - Expression to be tested against the whitelist
 * @param {BaseString[]|string[]} categories - Multiple expression parameters that will form the whitelist
 * @return {BaseNumber} Numeric expression with the result of the check
 *
 * @example <caption>Display only cities where $type is 'metropolis' or 'capital'.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.in(s.prop('type'), ['metropolis', 'capital'])
 * });
 *
 * @example <caption>Display only cities where $type is 'metropolis' or 'capital'. (String)</caption>
 * const $type = s.prop('type');
 * const viz = new carto.Viz(`
 *   filter: in($type, ['metropolis', 'capital'])
 * `);
 *
 * @memberof carto.expressions
 * @name in
 * @function
 * @api
 */
export const In = generateBelongsExpression('in', IN_INLINE_MAKER, (p, cats) => cats.some(cat => cat == p) ? 1 : 0);

/**
 * Check if value does not belong to the categories list given by the categories parameters.
 *
 * @param {String|Property|string} value - Categorical expression to be tested against the categorical blacklist
 * @param {String[]|Property[]|string[]} categories - Multiple categorical expression parameters that will form the blacklist
 * @return {Number} Numeric expression with the result of the check
 *
 * @example <caption>Display only cities where $type is not 'metropolis' or 'capital'.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.nin(s.prop('type'), ['metropolis', 'capital'])
 * });
 *
 * @example <caption>Display only cities where $type is not 'metropolis' or 'capital'. (String)</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz(`
 *   filter: nin($type, ['metropolis', 'capital'])
 * `);
 *
 * @memberof carto.expressions
 * @name nin
 * @function
 * @api
 */
export const Nin = generateBelongsExpression('nin', NIN_INLINE_MAKER, (p, cats) => !cats.some(cat => cat == p) ? 1 : 0);

function IN_INLINE_MAKER(categories) {
    if (categories.length == 0) {
        return () => '0.';
    }
    return inline => `(${categories.map((cat, index) => `(${inline.value} == ${inline[`arg${index}`]})`).join(' || ')})? 1.: 0.`;
}

function NIN_INLINE_MAKER(categories) {
    if (categories.length == 0) {
        return () => '1.';
    }
    return inline => `(${categories.map((cat, index) => `(${inline.value} != ${inline[`arg${index}`]})`).join(' && ')})? 1.: 0.`;
}

function generateBelongsExpression(name, inlineMaker, jsEval) {
    return class BelongExpression extends BaseExpression {
        constructor(value, list) {
            value = implicitCast(value);
            list = implicitCast(list);

            checkExpression(name, 'value', 0, value);
            checkExpression(name, 'list', 1, list);

            checkLooseType(name, 'value', 0, 'category', value);
            list.map((item, index) => checkLooseType(name, '', index + 1, 'string', item));

            let children = { value };
            list.map((arg, index) => children[`arg${index}`] = arg);
            super(children);
            this.list = list;
            this.inlineMaker = inlineMaker(this.list);
            this.type = 'number';
        }
        eval(feature) {
            return jsEval(this.value.eval(feature), this.list.map(category => category.eval(feature)));
        }
        _compile(meta) {
            super._compile(meta);
            checkType(name, 'value', 0, 'category', this.value);
            this.list.map((cat, index) => checkType(name, '', index + 1, 'category', cat));
        }
    };
}
