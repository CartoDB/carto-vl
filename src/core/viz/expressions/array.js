import BaseExpression from './base';
import { checkType, checkExpression, implicitCast } from './utils';

/**
 * Wrapper around arrays.
 *
 * @param {Array} elements
 * @returns {Array}
 *
 * @memberof carto.expressions
 * @name array
 * @function
 * @api
 */
export default class BaseArray extends BaseExpression {
    constructor(elems) {
        elems = elems || [];
        if (!Array.isArray(elems)) {
            elems = [elems];
        }
        elems = elems.map(implicitCast);
        if (!elems.length) {
            throw new Error('array(): invalid parameters: must receive at least one argument');
        }
        const type = elems[0].type;
        if (type == undefined) {
            throw new Error('array(): invalid parameters, must be formed by constant expressions, they cannot depend on feature properties');
        }
        checkType('array', 'colors[0]', 0, ['color', 'string', 'number', 'time'], elems[0]);
        elems.map((item, index) => {
            checkExpression('array', `item[${index}]`, index, item);
            if (item.type == undefined) {
                throw new Error('array(): invalid parameters, must be formed by constant expressions, they cannot depend on feature properties');
            }
            if (item.type != type) {
                throw new Error('array(): invalid parameters, invalid argument type combination');
            }
        });
        super({});
        this.type = type;
        this.expr = elems;
        try {
            this.expr.map(c => c.eval());
        } catch (error) {
            throw new Error('Arrays must be formed by constant expressions, they cannot depend on feature properties');
        }
    }
    eval() {
        return this.expr.map(c => c.eval());
    }
}
