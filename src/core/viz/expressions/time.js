import BaseExpression from './base';

/**
 * Time contant expression
 *
 * @param {Date|string} date - The date from a JavaScript Date() object or encoded as a string
 * @return {carto.expressions.Base}
 *
 * @example
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.between(s.prop('date'), s.time('2022-03-09T00:00:00Z'), s.time('2033-08-12T00:00:00Z')
 * });
 *
 * @memberof carto.expressions
 * @name time
 * @function
 * @api
 */
export default class Time extends BaseExpression {
    constructor(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        super({});
        // TODO improve type check
        this.type = 'time';
        this.date = date;
        this.inlineMaker = () => undefined;
    }
    eval() {
        return this.date;
    }
    isAnimated() {
        return false;
    }
}
