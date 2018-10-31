import Base from '../base';
import { checkType } from '../utils';

export default class ReverseList extends Base {
    _bindMetadata (metadata) {
        checkType('reverse', 'array', 0, ['number-list', 'category-list', 'color-list', 'date-list', 'image-list'], this.input);

        this.type = this.input.type;
        this.childType = this.input.childType;
    }

    get elems () {
        return [...this.input.elems].reverse();
    }

    get value () {
        return this.elems.map(c => c.value);
    }

    eval (feature) {
        return this.elems.map(c => c.eval(feature));
    }
}
