import BaseExpression from '../base';
import { checkExpression, implicitCast, getOrdinalFromIndex, checkMaxArguments } from '../utils';
import ListImage from '../ListImage';
import ListGeneric from './ListGeneric';
import { Variable } from './variable';

const SUPPORTED_CHILD_TYPES = ['number', 'category', 'color', 'time', 'image', 'variable'];

/**
 * Wrapper around arrays. Explicit usage is unnecessary since CARTO VL will wrap implicitly all arrays using this function.
 *
 * @param {Number[]|Category[]|Color[]|Date[]|Image[]} elements
 * @returns {List}
 *
 * @memberof carto.expressions
 * @name array
 * @function
 * @api
 */
export default class List extends BaseExpression {
    constructor (elems) {
        checkMaxArguments(arguments, 1, 'list');

        if (!elems) {
            throw new Error('list(): invalid parameters: must receive at least one argument');
        }

        if (!window.Array.isArray(elems)) {
            elems = [elems];
        }

        elems = elems.map(implicitCast);

        if (!elems.length) {
            throw new Error('list(): invalid parameters: must receive at least one argument');
        }

        elems.map((item, index) => {
            checkExpression('list', `item[${index}]`, index, item);
        });

        super(elems);
        this.elems = elems;
        this._setTypes();
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        this._setTypes();

        switch (this.elems[0].type) {
            case 'image':
                Object.setPrototypeOf(this, ListImage.prototype);
                break;
            default:
                Object.setPrototypeOf(this, ListGeneric.prototype);
                break;
        }

        return this._bindMetadata(metadata);
    }

    get value () {
        return this.elems.map(c => c.value);
    }

    eval (feature) {
        return this.elems.map(c => c.eval(feature));
    }

    _setTypes () {
        this.childType = this.elems[0].type;
        this.type = `${this.childType}-list`;

        if (SUPPORTED_CHILD_TYPES.indexOf(this.childType) === -1) {
            throw new Error(`list(): invalid parameters type: ${this.childType}`);
        }

        this.elems.map((item, index) => {
            checkExpression('list', `item[${index}]`, index, item);

            if (item.type !== this.childType) {
                throw new Error(`list(): invalid ${getOrdinalFromIndex(index + 1)} parameter type, invalid argument type combination`);
            }
        });
    }
}
