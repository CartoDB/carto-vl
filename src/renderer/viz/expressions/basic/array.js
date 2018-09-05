import BaseExpression from '../base';
import { checkExpression, implicitCast, getOrdinalFromIndex, checkMaxArguments } from '../utils';
import CartoValidationError from '../../../../errors/carto-validation-error';

/**
 * Wrapper around arrays. Explicit usage is unnecessary since CARTO VL will wrap implicitly all arrays using this function.
 *
 * @param {Number[]|Category[]|Color[]|Date[]|Image[]} elements
 * @returns {Array}
 *
 * @memberof carto.expressions
 * @name array
 * @function
 * @api
 */
export default class BaseArray extends BaseExpression {
    constructor (elems) {
        checkMaxArguments(arguments, 1, 'array');

        elems = elems || [];

        if (!Array.isArray(elems)) {
            elems = [elems];
        }

        elems = elems.map(implicitCast);
        if (!elems.length) {
            throw new CartoValidationError('expressions', 'arrayNoElements');
        }

        let type = '';

        for (let elem of elems) {
            type = elem.type;
            if (elem.type !== undefined) {
                break;
            }
        }

        if (['number', 'category', 'color', 'time', 'image', undefined].indexOf(type) === -1) {
            throw new CartoValidationError('expressions', `arrayInvalidParamType[${type}]`);
        }

        elems.map((item, index) => {
            checkExpression('array', `item[${index}]`, index, item);
            if (item.type !== type && item.type !== undefined) {
                throw new CartoValidationError('expressions', `arrayInvalidParamTypeCombination[${getOrdinalFromIndex(index + 1)}]`);
            }
        });

        super(elems);

        this.type = `${type}-array`;
        this.elems = elems;
    }

    get value () {
        return this.elems.map(c => c.value);
    }

    eval (feature) {
        return this.elems.map(c => c.eval(feature));
    }

    _resolveAliases (aliases) {
        this.elems.map(c => c._resolveAliases(aliases));
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        const type = this.elems[0].type;
        if (['number', 'category', 'color', 'time', 'image'].indexOf(type) === -1) {
            throw new CartoValidationError('expressions', `arrayInvalidParamType[${type}]`);
        }
        this.elems.map((item, index) => {
            checkExpression('array', `item[${index}]`, index, item);
            if (item.type !== type) {
                throw new CartoValidationError('expressions', `arrayInvalidParamTypeCombination[${getOrdinalFromIndex(index)}]`);
            }
        });
    }
}
