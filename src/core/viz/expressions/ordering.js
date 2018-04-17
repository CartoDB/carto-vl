import BaseExpression from './base';
import { checkInstance } from './utils';

export class Width extends BaseExpression {
    constructor() {
        super({});
        this.type = 'propertyReference';
    }
}

export class Asc extends BaseExpression {
    constructor(by) {
        super({});
        checkInstance('asc', 'by', 0, Width, by);
        this.type = 'orderer';
    }
}

export class Desc extends BaseExpression {
    constructor(by) {
        super({});
        checkInstance('desc', 'by', 0, Width, by);
        this.type = 'orderer';
    }
}

export class NoOrder extends BaseExpression {
    constructor() {
        super({});
        this.type = 'orderer';
    }
}
