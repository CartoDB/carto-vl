import BaseExpression from '../base';
import { checkExpression, implicitCast, getOrdinalFromIndex, checkMaxArguments } from '../utils';
import ImageList from '../ImageList';
import ListGeneric from './ListGeneric';

const SUPPORTED_CHILD_TYPES = ['number', 'category', 'color', 'time', 'image'];

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
    }
    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        const childType = this.elems[0].type;
        this.type = `${childType}-list`;
        this.childType = childType;
        if (SUPPORTED_CHILD_TYPES.indexOf(childType) === -1) {
            throw new Error(`list(): invalid parameters type: ${childType}`);
        }
        this.elems.map((item, index) => {
            checkExpression('list', `item[${index}]`, index, item);
            if (item.type !== childType) {
                throw new Error(`list(): invalid ${getOrdinalFromIndex(index)} parameter, invalid argument type combination`);
            }
        });

        switch (this.elems[0].type) {
            case 'image':
                Object.setPrototypeOf(this, ImageList.prototype);
                break;
            default:
                Object.setPrototypeOf(this, ListGeneric.prototype);
                break;
        }
        return this._bindMetadata(metadata);
    }
}
