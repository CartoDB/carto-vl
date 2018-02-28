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
export const In = generateBelongsExpression(IN_INLINE_MAKER);

/**
 * Check if property does not belong to the acceptedCategories list of categories
 * @param {*} property 
 * @param {*} acceptedCategories 
 * @memberof carto.style.expressions
 * @name nin
 * @api
 */
export const Nin = generateBelongsExpression(NIN_INLINE_MAKER);




function generateBelongsExpression(inlineMaker) {

    return class BelongExpression extends Expression {
        constructor(property, ...acceptedCategories) {
            acceptedCategories = acceptedCategories.map(implicitCast);
            let children = {
                property
            };
            acceptedCategories.map((arg, index) => children[`arg${index}`] = arg);
            super(children);
            this.acceptedCategories = acceptedCategories;
            this.inlineMaker = inlineMaker(this.acceptedCategories);
        }

        _compile(meta) {
            super._compile(meta);
            if (this.property.type != 'category') {
                throw new Error('In() can only be performed to categorical properties');
            }
            this.acceptedCategories.map(cat => {
                if (cat.type != 'category') {
                    throw new Error('In() can only be performed to categorical properties');
                }
            });
            this.type = 'float';
        }
    };

}
