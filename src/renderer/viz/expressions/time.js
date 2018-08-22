import BaseExpression from './base';
import * as util from '../../../utils/util';
import { checkMaxArguments } from './utils';

/**
 * Time contant expression
 *
 * @param {Date|string} date - The date from a JavaScript Date() object or encoded as a string
 * @return {Date}
 *
 * @example <caption>Filter by a date between dates.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   filter: s.between(s.prop('date'), s.time('2022-03-09T00:00:00Z'), s.time('2033-08-12T00:00:00Z')
 * });
 *
 * @example <caption>Filter by a date between dates. (String)</caption>
 * const viz = new carto.Viz(`
 *   filter: time('2022-03-09T00:00:00Z') < $date < time('2033-08-12T00:00:00Z')
 * `);
 *
 * @memberof carto.expressions
 * @name time
 * @function
 * @api
 */
export default class Time extends BaseExpression {
    constructor (date) {
        checkMaxArguments(arguments, 1, 'time');

        super({});
        // TODO improve type check
        this.type = 'time';
        this.date = util.castDate(date);
        this.inlineMaker = () => undefined;
    }

    get value () {
        return this.eval();
    }

    eval () {
        return this.date;
    }

    isAnimated () {
        return false;
    }
}
