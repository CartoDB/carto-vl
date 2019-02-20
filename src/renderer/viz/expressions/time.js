import BaseExpression from './base';
import * as util from '../../../utils/util';
import { checkMaxArguments, throwInvalidType } from './utils';

/**
 * Time constant expression
 *
 * @param {Date|string|number} date - The date from a JavaScript Date() object or a date encoded as a string or the number of milliseconds since Epoch.
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
        this.type = 'date';
        try {
            this.date = util.castDate(date);
        } catch (error) {
            throwInvalidType('time', 'date', 0, 'Date or string or number', 'other type');
        }
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

    isPlaying () {
        return false;
    }
}
