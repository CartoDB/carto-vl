import { implicitCast } from './utils';
import Expression from './expression';


function IN_INLINE_MAKER(categories) {
    return inline => `(${categories.map((cat, index) => `(${inline.property} == ${inline[`arg${index}`]})`).join(' || ')})? 1.: 0.`;
}

function NIN_INLINE_MAKER(categories) {
    return inline => `(${categories.map((cat, index) => `(${inline.property} != ${inline[`arg${index}`]})`).join(' && ')})? 1.: 0.`;
}

/**
 * Check if property belongs to the acceptedCategories list of categories
 * @param {*} property
 * @param {*} acceptedCategories
 * @memberof carto.style.expressions
 * @name in
 * @api
 */
export const In = generateBelongsExpression(IN_INLINE_MAKER, (p, cats) => cats.some(cat => cat == p) ? 1 : 0);

/**
 * Check if property does not belong to the categories list of categories
 * @param {*} property
 * @param {*} categories
 * @memberof carto.style.expressions
 * @name nin
 * @api
 */
export const Nin = generateBelongsExpression(NIN_INLINE_MAKER, (p, cats) => !cats.some(cat => cat == p) ? 1 : 0);

function generateBelongsExpression(inlineMaker, jsEval) {

    return class BelongExpression extends Expression {
        constructor(property, ...categories) {
            categories = categories.map(implicitCast);
            let children = {
                property
            };
            categories.map((arg, index) => children[`arg${index}`] = arg);
            super(children);
            this.categories = categories;
            this.inlineMaker = inlineMaker(this.categories);
        }

        _compile(meta) {
            super._compile(meta);
            if (this.property.type != 'category') {
                throw new Error('In() can only be performed to categorical properties');
            }
            this.categories.map(cat => {
                if (cat.type != 'category') {
                    throw new Error('In() can only be performed to categorical properties');
                }
            });
            this.type = 'float';
        }

        eval(feature) {
            return jsEval(this.property.eval(feature), this.categories.map(category => category.eval(feature)));
        }
    };

}
