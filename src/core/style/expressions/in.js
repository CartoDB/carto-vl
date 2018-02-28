import { implicitCast } from './utils';
import Expression from './expression';

/**
 * Check if property belongs to the acceptedCategories list of categories
 * @param {*} property 
 * @param {*} acceptedCategories 
 * @memberof carto.style.expressions
 * @name in
 * @api
 */
export default class In extends Expression {
    constructor(property, ...acceptedCategories) {
        acceptedCategories = acceptedCategories.map(implicitCast);
        let children = {
            property
        };
        acceptedCategories.map((arg, index) => children[`arg${index}`] = arg);
        super(children);
        this.acceptedCategories = acceptedCategories;
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
        this.inlineMaker = inline =>
            // Returns a float (1. = true, 0. = false)
            `(${this.acceptedCategories.map((cat, index) => `(${inline.property} == ${inline[`arg${index}`]})`).join(' || ')})? 1.: 0.`
        ;
    }
}
