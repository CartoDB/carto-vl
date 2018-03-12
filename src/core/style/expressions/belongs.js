import { implicitCast, checkType, checkLooseType } from './utils';
import Expression from './expression';


function IN_INLINE_MAKER(categories) {
    return inline => `(${categories.map((cat, index) => `(${inline.property} == ${inline[`arg${index}`]})`).join(' || ')})? 1.: 0.`;
}

function NIN_INLINE_MAKER(categories) {
    return inline => `(${categories.map((cat, index) => `(${inline.property} != ${inline[`arg${index}`]})`).join(' && ')})? 1.: 0.`;
}

/**
 *
 * Check if a categorical value belongs to a list of categories.
 *
 * @param {carto.style.expressions.expression | string} value - Categorical expression to be tested against the categorical whitelist
 * @param {...carto.style.expressions.expression | ...string} categories - Multiple categorical expression parameters that will form the whitelist
 * @return {carto.style.expressions.expression} numeric expression with the result of the check
 *
 * @example <caption>Display only cities where $type is "metropolis" or "capital".</caption>
 * const s = carto.style.expressions;
 * const $type = s.property('type');
 * const style = new carto.Style({
 *  filter: s.in($type, 'metropolis', 'capital');
 * });
 *
 * @memberof carto.style.expressions
 * @name in
 * @function
 * @api
 */
export const In = generateBelongsExpression('in', IN_INLINE_MAKER, (p, cats) => cats.some(cat => cat == p) ? 1 : 0);


/**
 *
 * Check if value does not belong to the categories list given by the categories parameters.
 *
 * @param {carto.style.expressions.Expression | string} value - Categorical expression to be tested against the categorical blacklist
 * @param {...carto.style.expressions.Expression | ...string} categories - Multiple categorical expression parameters that will form the blacklist
 * @return {carto.style.expressions.Expression} numeric expression with the result of the check
 *
 * @example <caption>Display only cities where $type is not "metropolis" nor "capital".</caption>
 * const s = carto.style.expressions;
 * const $type = s.property('type');
 * const style = new carto.Style({
 *  filter: s.nin($type, 'metropolis', 'capital');
 * });
 *
 * @memberof carto.style.expressions
 * @name nin
 * @function
 * @api
 */
export const Nin = generateBelongsExpression('nin', NIN_INLINE_MAKER, (p, cats) => !cats.some(cat => cat == p) ? 1 : 0);

function generateBelongsExpression(name, inlineMaker, jsEval) {

    return class BelongExpression extends Expression {
        constructor(value, ...categories) {
            value = implicitCast(value);
            categories = categories.map(implicitCast);

            checkLooseType(name, 'value', 0, 'category', value);
            categories.map((cat, index) => checkLooseType(name, '', index + 1, 'category', cat));

            let children = {
                value
            };
            categories.map((arg, index) => children[`arg${index}`] = arg);
            super(children);
            this.categories = categories;
            this.inlineMaker = inlineMaker(this.categories);
            this.type = 'float';
        }

        _compile(meta) {
            super._compile(meta);
            checkType(name, 'value', 0, 'category', this.value);
            this.categories.map((cat, index) => checkType(name, '', index + 1, 'category', cat));
        }

        eval(feature) {
            return jsEval(this.value.eval(feature), this.categories.map(category => category.eval(feature)));
        }
    };

}
