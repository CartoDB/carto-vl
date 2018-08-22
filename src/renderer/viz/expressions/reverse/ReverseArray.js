import Base from '../base';

export default class ReverseArray extends Base {
    constructor (array) {
        super({
            array
        });
        this.type = array.type;
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
