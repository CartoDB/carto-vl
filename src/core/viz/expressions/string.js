import BaseExpression from './base';
import { checkString } from './utils';

/**
 * Wrapper around strings.
 *
 * @param {string} input
 * @returns {String} category expression with the category name provided
 *
 * @memberof carto.expressions
 * @name string
 * @function
 * @api
 */
export default class BaseString extends BaseExpression {
    constructor(input) {
        checkString('string', 'input', 0, input);
        super({});
        this.expr = input;
        this.type = 'string';
    }
    eval() {
        return this.expr;
    }
}
