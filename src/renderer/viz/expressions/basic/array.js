import BaseExpression from '../base';
import { checkExpression, implicitCast, getOrdinalFromIndex, checkMaxArguments } from '../utils';

const SUPPORTED_CHILD_TYPES = ['number', 'category', 'color', 'time', 'image'];

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
            throw new Error('array(): invalid parameters: must receive at least one argument');
        }

        let type = '';

        for (let elem of elems) {
            type = elem.type;
            if (elem.type !== undefined) {
                break;
            }
        }

        elems.map((item, index) => {
            checkExpression('array', `item[${index}]`, index, item);
            if (item.type !== type && item.type !== undefined) {
                throw new Error(`array(): invalid ${getOrdinalFromIndex(index + 1)} parameter type, invalid argument type combination`);
            }
        });

        super(elems);

        this.elems = elems;
    }

    _applyToShaderSource (getGLSLforProperty) {
        const childGLSL = this.elems.map(elem => elem._applyToShaderSource(getGLSLforProperty));
        return {
            preface: childGLSL.map(c => c.preface).join('\n'),
            inline: childGLSL.map(c => c.inline)
        };
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

        const childType = this.elems[0].type;
        this.type = `${childType}-array`;
        this.childType = childType;
        if (SUPPORTED_CHILD_TYPES.indexOf(childType) === -1) {
            throw new Error(`array(): invalid parameters type: ${childType}`);
        }
        this.elems.map((item, index) => {
            checkExpression('array', `item[${index}]`, index, item);
            if (item.type !== childType) {
                throw new Error(`array(): invalid ${getOrdinalFromIndex(index)} parameter, invalid argument type combination`);
            }
        });
    }
}
