import { implicitCast, checkType, checkLooseType, checkExpression } from './utils';
import BaseExpression from './base';

/**
 * Check if a categorical value belongs to a list of categories.
 *
 * @param {Category} value - Categorical expression to be tested against the whitelist
 * @param {Category[]} list - Multiple expression parameters that will form the whitelist
 * @return {Number} Numeric expression with the result of the check
 *
 * @example <caption>Display only cities where $type is 'metropolis' or 'capital'.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.in(s.prop('type'), ['metropolis', 'capital'])
 * });
 *
 * @example <caption>Display only cities where $type is 'metropolis' or 'capital'. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: $type in ['metropolis', 'capital']
 * `);
 *
 * @memberof carto.expressions
 * @name in
 * @function
 * @api
 */
export const In = generateBelongsExpression('in', IN_INLINE_MAKER, (value, list) => list.some(item => item === value) ? 1 : 0);

function IN_INLINE_MAKER (list) {
    if (list.length === 0) {
        return () => '0.';
    }
    return inline => `((${list.map((cat, index) => `(${inline.value} == ${inline[`arg${index}`]})`).join(' || ')})? 1.: 0.)`;
}

/**
 * Check if value does not belong to the list of elements.
 *
 * @param {Category} value - Categorical expression to be tested against the blacklist
 * @param {Category[]} list - Multiple expression parameters that will form the blacklist
 * @return {Number} Numeric expression with the result of the check
 *
 * @example <caption>Display only cities where $type is not 'metropolis' or 'capital'.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.nin(s.prop('type'), ['metropolis', 'capital'])
 * });
 *
 * @example <caption>Display only cities where $type is not 'metropolis' or 'capital'. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: $type nin ['metropolis', 'capital']
 * `);
 *
 * @memberof carto.expressions
 * @name nin
 * @function
 * @api
 */
export const Nin = generateBelongsExpression('nin', NIN_INLINE_MAKER, (value, list) => list.some(item => item === value) ? 0 : 1);

function NIN_INLINE_MAKER (list) {
    if (list.length === 0) {
        return () => '1.';
    }
    return inline => `((${list.map((cat, index) => `(${inline.value} != ${inline[`arg${index}`]})`).join(' && ')})? 1.: 0.)`;
}

function generateBelongsExpression (name, inlineMaker, jsEval) {
    return class BelongExpression extends BaseExpression {
        constructor (value, list) {
            value = implicitCast(value);
            list = implicitCast(list);

            checkExpression(name, 'value', 0, value);
            checkExpression(name, 'list', 1, list);

            checkLooseType(name, 'value', 0, 'category', value);
            checkLooseType(name, 'list', 1, 'category-array', list);

            let children = { value };
            list.elems.map((arg, index) => {
                children[`arg${index}`] = arg;
            });
            super(children);
            this.list = list;
            this.inlineMaker = inlineMaker(this.list.elems);
            this.type = 'number';
        }
        eval (feature) {
            return jsEval(this.value.eval(feature), this.list.eval(feature));
        }
        _bindMetadata (meta) {
            super._bindMetadata(meta);
            checkType(name, 'value', 0, 'category', this.value);
            checkType(name, 'list', 1, 'category-array', this.list);
        }
    };
}
