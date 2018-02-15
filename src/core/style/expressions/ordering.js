import Expression from './expression';

export class Width extends Expression {
    constructor() {
        super({});
        this.type = 'propertyReference';
    }
}

export class Asc extends Expression {
    constructor(by) {
        super({});
        if (!(by instanceof Width)) {
            throw new Error('Asc() only accepts \'width()\' for now');
        }
        this.type = 'orderer';
    }
}

export class Desc extends Expression {
    constructor(by) {
        super({});
        if (!(by instanceof Width)) {
            throw new Error('Desc() only accepts \'width()\' for now');
        }
        this.type = 'orderer';
    }
}

export class NoOrder extends Expression {
    constructor() {
        super({});
        this.type = 'orderer';
    }
}
