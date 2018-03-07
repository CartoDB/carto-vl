import Expression from './expression';

export default class Time extends Expression {
    constructor(date) {
        if (!(date instanceof Date)) {
            throw new Error('time(): invalid date parameter');
        }
        super({});
        this.type = 'time';
        this.date = date;
    }
    isAnimated() {
        return false;
    }
}
