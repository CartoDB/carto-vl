import BaseExpression from './base';

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
    isAnimated() {
        return false;
    }
    eval() {
        return this.date;
    }
}
