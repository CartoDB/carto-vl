import Base from '../base';
import { checkType, checkExpression } from '../utils';

export default class ReverseList extends Base {
    constructor (array) {
        super({array});

        checkExpression('reverseList', 'array', 0, array);

        if (this.array.elems) {
            const childType = this.array.elems[0].type;
            this.type = `${childType}-list`;
        }
    }

    _bindMetadata (metadata) {
        this.array._bindMetadata(metadata);

        checkType('reverse', 'array', 0, ['palette', 'number-list', 'category-list', 'color-list', 'time-list', 'image-list'], this.array);

        this.type = this.array.type;
        this.childType = this.array.childType;

        super._bindMetadata(metadata);
    }

    get elems () {
        return [...this.array.elems].reverse();
    }

    get value () {
        return this.elems.map(c => c.value);
    }

    eval (feature) {
        return this.elems.map(c => c.eval(feature));
    }
}
