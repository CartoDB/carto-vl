import Base from '../base';
import { checkExpression, implicitCast, getOrdinalFromIndex, checkMaxArguments } from '../utils';
import ListImage from '../ListImage';
import ListGeneric from './ListGeneric';
import ListTransform from '../ListTransform';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../../errors/carto-validation-error';

const SUPPORTED_CHILD_TYPES = ['number', 'category', 'color', 'date', 'image', 'transformation'];

/**
 * Wrapper around arrays. Explicit usage is unnecessary since CARTO VL will wrap implicitly all arrays using this function.
 *
 * When used with Transformation expressions, the returned value will be a Transformation that will chain each single transformation one after another.
 *
 * @example <caption>Rotate then translate.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   symbol: s.CROSS
 *   transform: [s.rotate(90), s.translate(10, 20)]
 * });
 *
 * @example <caption>Rotate then translate. (String)</caption>
 * const viz = new carto.Viz(`
 *   symbol: cross
 *   transform: [rotate(90), translate(10, 20)]
 * `);
 *
 * @param {Number[]|Category[]|Color[]|Date[]|Image[]|Transform[]} elements
 * @returns {List|Transform}
 *
 * @memberof carto.expressions
 * @name list
 * @function
 * @api
 */
export default class List extends Base {
    constructor (elems) {
        checkMaxArguments(arguments, 1, 'list');

        if (!elems) {
            throw new CartoValidationError(`${cvt.MISSING_REQUIRED} list(): invalid parameters: must receive at least one argument.`);
        }

        if (!Array.isArray(elems)) {
            elems = [elems];
        }

        elems = elems.map(implicitCast);

        if (!elems.length) {
            throw new CartoValidationError(`${cvt.MISSING_REQUIRED} list(): invalid parameters: must receive at least one argument.`);
        }

        elems.map((item, index) => {
            checkExpression('list', `item[${index}]`, index, item);
        });

        super(elems);
        this.elems = elems;
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        this._setTypes();

        if (SUPPORTED_CHILD_TYPES.indexOf(this.childType) === -1) {
            throw new CartoValidationError(`${cvt.INCORRECT_TYPE} list(): invalid parameters type: ${this.childType}.`);
        }

        this.elems.map((item, index) => {
            checkExpression('list', `item[${index}]`, index, item);

            if (item.type !== this.childType) {
                throw new CartoValidationError(`${cvt.INCORRECT_TYPE} list(): invalid ${getOrdinalFromIndex(index + 1)} parameter type, invalid argument type combination.`);
            }
        });

        switch (this.elems[0].type) {
            case 'image':
                Object.setPrototypeOf(this, ListImage.prototype);
                break;
            case 'transformation':
                Object.setPrototypeOf(this, ListTransform.prototype);
                break;
            default:
                Object.setPrototypeOf(this, ListGeneric.prototype);
                break;
        }

        return this._bindMetadata(metadata);
    }

    _setTypes () {
        this.childType = this.elems[0].type;
        this.type = `${this.childType}-list`;
    }
}
