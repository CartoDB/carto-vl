import BaseExpression from './base';
import * as util from '../../../utils/util';

/**
 * Define a time range: an interval between two time points.
 *
 * ISO-formatted strings (based on ISO 8601) are used to define ranges.
 * Since `timeRange` doesn't support arbitrary intervals, but only
 * intervals based on single units of time (e.g. a month, an hour),
 * we don't use the general ISO interval format, but simply an
 * abbreviated form of the date point format, so that '2018-03' represents
 * the month of March, 2018 (i.e. the interval 2018-03-01T00:00:00/2018-04-01T00:00:00).
 *
 * @param {String} value - abbreviated ISO-formatted interval
 * @return {TimeRange} It retuns a TimeRange object.
 *
 * @memberof carto.expressions
 * @name TimeRangeExpr
 * @function
 * @api
 */
export default class TimeRangeExpr extends BaseExpression {
    constructor (value) {
        // timeRange('2017-01') timeRange('2017-Q1')

        super({});
        this.type = 'timerange';
        this.range = util.castTimeRange(value);
        this.inlineMaker = () => undefined; // TODO...
    }

    get value () {
        return this.eval();
    }

    eval () {
        return this.range;
    }

    isAnimated () {
        return false;
    }

    isPlaying () {
        return false;
    }
}
