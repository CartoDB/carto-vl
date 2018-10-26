import BaseExpression from './base';
import * as util from '../../../utils/util';

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
}
