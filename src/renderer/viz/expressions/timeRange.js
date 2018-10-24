import BaseExpression from './base';
import * as util from '../../../utils/util';

export default class TimeRangeExpr extends BaseExpression {
    constructor (start, end) {
        // timeRange('2017-01') timeRange('2017-Q1') timeRange(Date(..), Date(...))

        super({});
        // TODO improve type check
        this.type = 'timerange';
        this.range = util.timeRange(start, end);
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
}
