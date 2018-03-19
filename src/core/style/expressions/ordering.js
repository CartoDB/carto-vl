import Expression from './expression';
import { checkInstance } from './utils';

export class Width extends Expression {
    constructor() {
        super({});
        this.type = 'propertyReference';
    }
}

export class Asc extends Expression {
    constructor(by) {
        super({});
        checkInstance('asc', 'by', 0, Width, by);
        this.type = 'orderer';
    }
}

export class Desc extends Expression {
    constructor(by) {
        super({});
        checkInstance('asc', 'by', 0, Width, by);
        this.type = 'orderer';
    }
}

export class NoOrder extends Expression {
    constructor() {
        super({});
        this.type = 'orderer';
    }
}
