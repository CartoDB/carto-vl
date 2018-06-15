import BaseExpression from './base';
import { number } from '../functions';

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
    constructor(date) {
        if (!(date instanceof Date)) {
            if (typeof (date) === 'number') {
                const epoch = date;
                date = new Date(0);
                date.setUTCSeconds(epoch);
            } else {
                date = new Date(date);
            }
        }
        super({ _impostor: number(0) });
        // TODO improve type check
        this.type = 'time';
        this.date = date;
        this.inlineMaker = inline => inline._impostor;
    }
    _compile(meta) {
        this.metadata = meta;
        const inputMin = this.metadata.columns.find(c => c.name == this.dateProperty.name).min.getTime();
        const inputMax = this.metadata.columns.find(c => c.name == this.dateProperty.name).max.getTime();
        const inputDiff = inputMax - inputMin;

        const t = this.date.getTime();
        const tMapped = (t - inputMin) / inputDiff;

        this._impostor.expr = tMapped;
    }
    getMappedValue() {
        return this._impostor.expr;
    }
    get value() {
        return this.eval();
    }
    eval() {
        return this.date;
    }
    isAnimated() {
        return false;
    }
}
