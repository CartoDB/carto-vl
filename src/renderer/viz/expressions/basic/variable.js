import BaseExpression from '../base';
import { checkString, checkMaxArguments } from '../utils';
import CartoValidationError, { CartoValidationErrorTypes } from '../../../../errors/carto-validation-error';

/**
 * Alias to a named variable defined in the Viz.
 *
 * @param {String} name - The variable name that is going to be evaluated
 * @return {Number|Category|Color|Date}
 *
 * @example <caption></caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *     sum_price: s.clusterSum(s.prop('price'))
 *   }
 *  filter: s.neq(s.var('sum_price'), 'london')
 * });
 *
 * @example <caption>(String)</caption>
 * const viz = new carto.Viz(`
 *   \@sum_price: clusterSum($price)
 *   filter: $price == 30  // Equivalent to eq($price, 30)
 * `);
 *
 * @memberof carto.expressions
 * @name var
 * @function
 * @api
 */
export class Variable extends BaseExpression {
    constructor () {
        super({});
    }
}

export default function variable (name) {
    checkMaxArguments(arguments, 1, 'variable');
    checkString('variable', 'name', 0, name);

    if (name === '') {
        throw new CartoValidationError(
            'variable(): invalid parameter, zero-length string',
            CartoValidationErrorTypes.INCORRECT_VALUE
        );
    }

    let alias, aliaser;

    const resolve = aliases => {
        if (aliases[name]) {
            alias = aliases[name];
        } else {
            throw new CartoValidationError(
                `variable() with name '${name}' doesn't exist`,
                CartoValidationErrorTypes.MISSING_REQUIRED
            );
        }
    };

    const _getDependencies = () => {
        return [alias];
    };

    aliaser = {
        set: (obj, prop, value) => {
            if (prop === 'parent') {
                obj[prop] = value;
            } else if (prop === 'notify') {
                obj[prop] = value;
            } else if (alias && alias[prop]) {
                alias[prop] = value;
            } else {
                return false;
            }

            return true;
        },

        value () {
            return alias.value;
        },

        propertyName () {
            return alias.propertyName;
        },

        name () {
            return alias._dimension ? alias.propertyName : alias.name;
        },

        blendTo (obj, prop) {
            return obj[prop];
        },

        toString () {
            return alias.toString;  
        },

        _resolveAliases () {
            return resolve;
        },

        _getDependencies () {
            return _getDependencies;
        },

        _alias (property) {
            return property !== undefined && property.bind
                ? property.bind(alias)
                : property;
        },

        _default (obj, prop) {
            return alias !== undefined
                ? aliaser._alias(alias[prop])
                : obj[prop];
        },

        get: (obj, prop) => {
            return aliaser[prop]
                ? aliaser[prop](obj, prop)
                : aliaser._default(obj, prop);
        }
    };

    return new Proxy(new Variable(), aliaser);
}
